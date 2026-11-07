package com.apptracker.service;

import com.apptracker.dto.ImportRequest;
import com.apptracker.dto.ImportResponse;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * The page fetch uses a static Jsoup.connect, so the URL guard and each parsing strategy are called directly.
 * No test here touches the network.
 */
class ImportServiceTest {

    /** Answers DNS from this map so tests never touch the network. IP literals resolve without a lookup. */
    private static final Map<String, String> DNS = Map.of(
            "boards.greenhouse.io", "93.184.216.34",
            "example.com", "93.184.216.34",
            "internal.example.com", "10.0.0.5",
            "metadata.example.com", "169.254.169.254");

    private final Map<String, Connection.Response> pages = new HashMap<>();
    private final List<String> fetched = new ArrayList<>();

    private final ImportService service = new ImportService() {
        @Override
        InetAddress[] resolve(String host) throws UnknownHostException {
            String ip = DNS.get(host);
            return ip != null ? new InetAddress[] {InetAddress.getByName(ip)} : super.resolve(host);
        }

        @Override
        Connection.Response fetch(String url) {
            fetched.add(url);
            return pages.get(url);
        }
    };

    private Connection.Response redirectTo(String location) {
        Connection.Response response = mock(Connection.Response.class);
        when(response.statusCode()).thenReturn(302);
        when(response.header("Location")).thenReturn(location);
        return response;
    }

    private Connection.Response page(String html) throws Exception {
        Connection.Response response = mock(Connection.Response.class);
        when(response.statusCode()).thenReturn(200);
        when(response.parse()).thenReturn(Jsoup.parse(html));
        return response;
    }

    private ImportResponse importUrl(String url) {
        ImportRequest request = new ImportRequest();
        request.setExternalSource(url);
        return service.importApplication(UUID.randomUUID(), request);
    }

    @Test
    void followsSafeRedirectsAndParsesTheFinalPage() throws Exception {
        pages.put("https://example.com/a", redirectTo("/b"));
        pages.put("https://example.com/b", page("<html><head><title>Engineer - Acme</title></head></html>"));

        ImportResponse response = importUrl("https://example.com/a");

        assertThat(fetched).containsExactly("https://example.com/a", "https://example.com/b");
        assertThat(response.getRole()).isEqualTo("Engineer");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://169.254.169.254/latest/meta-data/",
            "http://localhost:8080/actuator",
            "http://internal.example.com/",
            "ftp://example.com/file"
    })
    void refusesToFollowARedirectToAnUnsafeAddress(String target) {
        pages.put("https://example.com/a", redirectTo(target));

        ImportResponse response = importUrl("https://example.com/a");

        assertThat(fetched).containsExactly("https://example.com/a");
        assertThat(response.getWarnings()).isNotEmpty();
        assertThat(response.getCompany()).isNull();
    }

    @Test
    void stopsFollowingRedirectLoops() {
        pages.put("https://example.com/a", redirectTo("https://example.com/a"));

        ImportResponse response = importUrl("https://example.com/a");

        assertThat(fetched).hasSize(6);
        assertThat(response.getWarnings()).isNotEmpty();
    }

    private boolean isValidUrl(String url) {
        return Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(service, "isValidUrl", url));
    }

    private int parseWith(String strategy, String html, ImportResponse response) {
        Document doc = Jsoup.parse(html);
        Integer confidence = ReflectionTestUtils.invokeMethod(service, strategy, doc, response);
        return confidence == null ? -1 : confidence;
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://boards.greenhouse.io/acme/jobs/1",
            "http://example.com/job?id=1",
            "https://8.8.8.8/job"
    })
    void allowsPublicHttpUrls(String url) {
        assertThat(isValidUrl(url)).isTrue();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {
            "   ",
            "ftp://example.com/file",
            "file:///etc/passwd",
            "javascript:alert(1)",
            "http://",
            "https://exa mple.com/"
    })
    void rejectsMalformedOrNonHttpUrls(String url) {
        assertThat(isValidUrl(url)).isFalse();
    }

    @Test
    void rejectsOverlongUrls() {
        assertThat(isValidUrl("https://example.com/" + "a".repeat(2048))).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://localhost:8080/actuator",
            "http://127.0.0.1/",
            "http://10.0.0.5/",
            "http://192.168.1.1/",
            "http://172.16.0.1/",
            "http://172.31.255.255/"
    })
    void blocksLoopbackAndPrivateRanges(String url) {
        assertThat(isValidUrl(url)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://169.254.169.254/latest/meta-data/", // cloud metadata service
            "http://127.0.0.2/",
            "http://0.0.0.0/",
            "http://[::1]/",
            "http://[fd00::1]/", // IPv6 unique local
            "http://[fe80::1]/", // IPv6 link-local
            "http://[::ffff:127.0.0.1]/", // IPv4-mapped IPv6
            "http://100.64.0.1/", // carrier-grade NAT
            "http://2130706433/", // 127.0.0.1 written as a number
            "http://internal.example.com/", // public-looking name, private address
            "http://metadata.example.com/",
            "http://user@127.0.0.1/"
    })
    void blocksOtherInternalAddresses(String url) {
        assertThat(isValidUrl(url)).isFalse();
    }

    @Test
    void unsafeUrlReturnsAWarningInsteadOfFetching() {
        ImportRequest request = new ImportRequest();
        request.setExternalSource("http://localhost/secret");

        ImportResponse response = service.importApplication(UUID.randomUUID(), request);

        assertThat(response.getWarnings()).contains("Invalid or unsafe URL");
        assertThat(response.getCompany()).isNull();
    }

    private static String jsonLd(String json) {
        return "<html><head><script type=\"application/ld+json\">" + json + "</script></head></html>";
    }

    @Test
    void jsonLdExtractsAllFieldsWithHighConfidence() {
        ImportResponse response = new ImportResponse();
        int confidence = parseWith("tryJsonLdParsing", jsonLd("""
                {"@type":"JobPosting","title":"Backend Engineer","description":"Build things",
                 "hiringOrganization":{"name":"Acme"},
                 "jobLocation":{"address":{"addressLocality":"Austin","addressRegion":"TX","addressCountry":"US"}}}
                """), response);

        assertThat(confidence).isEqualTo(90);
        assertThat(response.getRole()).isEqualTo("Backend Engineer");
        assertThat(response.getCompany()).isEqualTo("Acme");
        assertThat(response.getLocation()).isEqualTo("Austin, TX, US");
        assertThat(response.getDescription()).isEqualTo("Build things");
    }

    @Test
    void jsonLdFindsJobPostingInsideAnArray() {
        ImportResponse response = new ImportResponse();
        int confidence = parseWith("tryJsonLdParsing",
                jsonLd("[{\"@type\":\"Organization\"},{\"@type\":\"JobPosting\",\"title\":\"Analyst\"}]"), response);

        assertThat(confidence).isEqualTo(90);
        assertThat(response.getRole()).isEqualTo("Analyst");
    }

    @Test
    void jsonLdTruncatesLongDescriptions() {
        ImportResponse response = new ImportResponse();
        parseWith("tryJsonLdParsing",
                jsonLd("{\"@type\":\"JobPosting\",\"description\":\"" + "x".repeat(6000) + "\"}"), response);
        assertThat(response.getDescription()).hasSize(5000);
    }

    @ParameterizedTest
    @ValueSource(strings = {"{\"@type\":\"Organization\",\"name\":\"Acme\"}", "{not json"})
    void jsonLdIgnoresOtherTypesAndInvalidJson(String json) {
        ImportResponse response = new ImportResponse();
        assertThat(parseWith("tryJsonLdParsing", jsonLd(json), response)).isZero();
        assertThat(response.getRole()).isNull();
    }

    @Test
    void openGraphExtractsTitleAndSiteName() {
        ImportResponse response = new ImportResponse();
        int confidence = parseWith("tryOpenGraphParsing", """
                <html><head>
                <meta property="og:title" content="Data Engineer"/>
                <meta property="og:site_name" content="Acme"/>
                <meta property="og:description" content="Pipelines"/>
                </head></html>
                """, response);

        assertThat(confidence).isEqualTo(60);
        assertThat(response.getRole()).isEqualTo("Data Engineer");
        assertThat(response.getCompany()).isEqualTo("Acme");
        assertThat(response.getDescription()).isEqualTo("Pipelines");
    }

    @Test
    void openGraphFallsBackToTwitterTitle() {
        ImportResponse response = new ImportResponse();
        parseWith("tryOpenGraphParsing", "<html><head><meta name=\"twitter:title\" content=\"QA Lead\"/></head></html>",
                response);
        assertThat(response.getRole()).isEqualTo("QA Lead");
    }

    @Test
    void openGraphWithNoTagsHasZeroConfidence() {
        assertThat(parseWith("tryOpenGraphParsing", "<html></html>", new ImportResponse())).isZero();
    }

    @ParameterizedTest
    @ValueSource(strings = {"Platform Engineer - Acme", "Platform Engineer | Acme"})
    void htmlSplitsTitleIntoRoleAndCompany(String title) {
        ImportResponse response = new ImportResponse();
        int confidence = parseWith("tryHtmlParsing", "<html><head><title>" + title + "</title></head></html>", response);

        assertThat(confidence).isEqualTo(30);
        assertThat(response.getRole()).isEqualTo("Platform Engineer");
        assertThat(response.getCompany()).isEqualTo("Acme");
    }

    @Test
    void htmlFallsBackToHeadingAndCommonSelectors() {
        ImportResponse response = new ImportResponse();
        parseWith("tryHtmlParsing", """
                <html><body>
                <h1>Site Reliability Engineer</h1>
                <div class="company-name">Acme</div>
                <div class="job-location">Berlin</div>
                </body></html>
                """, response);

        assertThat(response.getRole()).isEqualTo("Site Reliability Engineer");
        assertThat(response.getCompany()).isEqualTo("Acme");
        assertThat(response.getLocation()).isEqualTo("Berlin");
    }

    @Test
    void cleanTextCollapsesWhitespaceAndDropsParentheticals() {
        String cleaned = ReflectionTestUtils.invokeMethod(service, "cleanText", "  Senior   Engineer (Remote)\n ");
        assertThat(cleaned).isEqualTo("Senior Engineer");
    }
}
