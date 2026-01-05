package com.apptracker.service;

import com.apptracker.dto.*;

import org.springframework.stereotype.Service;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.Jsoup;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ImportService {
    public ImportResponse importApplication(UUID userId, ImportRequest importRequest) {
        String url = importRequest.getExternalSource();

        // Security validation
        if (!isValidUrl(url)) {
            ImportResponse response = new ImportResponse();
            response.setJobUrl(url);
            response.addWarning("Invalid or unsafe URL");
            return response;
        }

        return parseWebpageData(url);
    }

    private boolean isValidUrl(String urlString) {
        try {
            // Check for valid URL
            if (urlString == null || urlString.trim().isEmpty()) {
                return false;
            }

            // Must be http or https
            if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
                return false;
            }

            // Length check
            if (urlString.length() > 2048) {
                return false;
            }

            URI uri = new URI(urlString);
            String host = uri.getHost();

            if (host == null) {
                return false;
            }

            // Block localhost and private IPs
            if (host.equals("localhost") ||
                    host.equals("127.0.0.1") ||
                    host.startsWith("10.") ||
                    host.startsWith("192.168.") ||
                    host.startsWith("172.16.") ||
                    host.startsWith("172.17.") ||
                    host.startsWith("172.18.") ||
                    host.startsWith("172.19.") ||
                    host.startsWith("172.20.") ||
                    host.startsWith("172.21.") ||
                    host.startsWith("172.22.") ||
                    host.startsWith("172.23.") ||
                    host.startsWith("172.24.") ||
                    host.startsWith("172.25.") ||
                    host.startsWith("172.26.") ||
                    host.startsWith("172.27.") ||
                    host.startsWith("172.28.") ||
                    host.startsWith("172.29.") ||
                    host.startsWith("172.30.") ||
                    host.startsWith("172.31.")) {
                return false;
            }

            return true;
        } catch (URISyntaxException e) {
            return false;
        }
    }

    private ImportResponse parseWebpageData(String url) {
        ImportResponse finalResponse = new ImportResponse();
        finalResponse.setJobUrl(url);

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(5000)
                    .maxBodySize(1024 * 1024) // 1MB limit
                    .followRedirects(true)
                    .execute()
                    .parse();

            // Try all three strategies and collect results
            ImportResponse jsonLdResult = new ImportResponse();
            jsonLdResult.setJobUrl(url);
            int jsonLdConfidence = tryJsonLdParsing(doc, jsonLdResult);

            ImportResponse openGraphResult = new ImportResponse();
            openGraphResult.setJobUrl(url);
            int openGraphConfidence = tryOpenGraphParsing(doc, openGraphResult);

            ImportResponse htmlResult = new ImportResponse();
            htmlResult.setJobUrl(url);
            int htmlConfidence = tryHtmlParsing(doc, htmlResult);

            // Pick the strategy with highest confidence as base
            ImportResponse bestResult;
            int bestConfidence;

            if (jsonLdConfidence >= openGraphConfidence && jsonLdConfidence >= htmlConfidence) {
                bestResult = jsonLdResult;
                bestConfidence = jsonLdConfidence;
            } else if (openGraphConfidence >= htmlConfidence) {
                bestResult = openGraphResult;
                bestConfidence = openGraphConfidence;
            } else {
                bestResult = htmlResult;
                bestConfidence = htmlConfidence;
            }

            // Use the best result as base, but fill in missing fields from other strategies
            finalResponse.setCompany(bestResult.getCompany());
            finalResponse.setRole(bestResult.getRole());
            finalResponse.setLocation(bestResult.getLocation());
            finalResponse.setDescription(bestResult.getDescription());

            // Fill missing fields from other strategies
            if (finalResponse.getCompany() == null || finalResponse.getCompany().isEmpty()) {
                if (jsonLdResult.getCompany() != null && !jsonLdResult.getCompany().isEmpty()) {
                    finalResponse.setCompany(jsonLdResult.getCompany());
                } else if (openGraphResult.getCompany() != null && !openGraphResult.getCompany().isEmpty()) {
                    finalResponse.setCompany(openGraphResult.getCompany());
                } else if (htmlResult.getCompany() != null && !htmlResult.getCompany().isEmpty()) {
                    finalResponse.setCompany(htmlResult.getCompany());
                }
            }

            if (finalResponse.getRole() == null || finalResponse.getRole().isEmpty()) {
                if (jsonLdResult.getRole() != null && !jsonLdResult.getRole().isEmpty()) {
                    finalResponse.setRole(jsonLdResult.getRole());
                } else if (openGraphResult.getRole() != null && !openGraphResult.getRole().isEmpty()) {
                    finalResponse.setRole(openGraphResult.getRole());
                } else if (htmlResult.getRole() != null && !htmlResult.getRole().isEmpty()) {
                    finalResponse.setRole(htmlResult.getRole());
                }
            }

            if (finalResponse.getLocation() == null || finalResponse.getLocation().isEmpty()) {
                if (jsonLdResult.getLocation() != null && !jsonLdResult.getLocation().isEmpty()) {
                    finalResponse.setLocation(jsonLdResult.getLocation());
                } else if (openGraphResult.getLocation() != null && !openGraphResult.getLocation().isEmpty()) {
                    finalResponse.setLocation(openGraphResult.getLocation());
                } else if (htmlResult.getLocation() != null && !htmlResult.getLocation().isEmpty()) {
                    finalResponse.setLocation(htmlResult.getLocation());
                }
            }

            if (finalResponse.getDescription() == null || finalResponse.getDescription().isEmpty()) {
                if (jsonLdResult.getDescription() != null && !jsonLdResult.getDescription().isEmpty()) {
                    finalResponse.setDescription(jsonLdResult.getDescription());
                } else if (openGraphResult.getDescription() != null && !openGraphResult.getDescription().isEmpty()) {
                    finalResponse.setDescription(openGraphResult.getDescription());
                } else if (htmlResult.getDescription() != null && !htmlResult.getDescription().isEmpty()) {
                    finalResponse.setDescription(htmlResult.getDescription());
                }
            }

            finalResponse.setConfidence(bestConfidence);

            // Add warnings for missing fields
            if (finalResponse.getCompany() == null || finalResponse.getCompany().isEmpty()) {
                finalResponse.addWarning("Company name not detected");
            }
            if (finalResponse.getRole() == null || finalResponse.getRole().isEmpty()) {
                finalResponse.addWarning("Job title not detected");
            }
            if (finalResponse.getLocation() == null || finalResponse.getLocation().isEmpty()) {
                finalResponse.addWarning("Location not detected");
            }

            return finalResponse;

        } catch (java.io.IOException e) {
            finalResponse.addWarning("Could not fetch the page. Site may block automated access or require login.");
            return finalResponse;
        } catch (Exception e) {
            finalResponse.addWarning("Failed to parse page: " + e.getMessage());
            return finalResponse;
        }
    }

    private int tryJsonLdParsing(Document doc, ImportResponse response) {
        try {
            // Find JSON-LD script tags
            for (Element script : doc.select("script[type='application/ld+json']")) {
                String jsonText = script.html();
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(jsonText);

                // Handle both single object and array
                JsonNode jobPosting = null;
                if (root.isArray()) {
                    for (JsonNode node : root) {
                        if ("JobPosting".equals(node.path("@type").asText())) {
                            jobPosting = node;
                            break;
                        }
                    }
                } else if ("JobPosting".equals(root.path("@type").asText())) {
                    jobPosting = root;
                }

                if (jobPosting != null) {
                    // Extract title
                    String title = jobPosting.path("title").asText(null);
                    if (title != null && !title.isEmpty()) {
                        response.setRole(cleanText(title));
                    }

                    // Extract company
                    JsonNode org = jobPosting.path("hiringOrganization");
                    String company = org.path("name").asText(null);
                    if (company != null && !company.isEmpty()) {
                        response.setCompany(cleanText(company));
                    }

                    // Extract location
                    JsonNode location = jobPosting.path("jobLocation");
                    String loc = null;
                    if (location.isObject()) {
                        JsonNode address = location.path("address");
                        if (address.isObject()) {
                            String city = address.path("addressLocality").asText(null);
                            String region = address.path("addressRegion").asText(null);
                            String country = address.path("addressCountry").asText(null);

                            List<String> parts = new ArrayList<>();
                            if (city != null && !city.isEmpty())
                                parts.add(city);
                            if (region != null && !region.isEmpty())
                                parts.add(region);
                            if (country != null && !country.isEmpty())
                                parts.add(country);

                            if (!parts.isEmpty()) {
                                loc = String.join(", ", parts);
                            }
                        } else {
                            loc = address.asText(null);
                        }
                    } else {
                        loc = location.asText(null);
                    }
                    if (loc != null && !loc.isEmpty()) {
                        response.setLocation(cleanText(loc));
                    }

                    // Extract description
                    String desc = jobPosting.path("description").asText(null);
                    if (desc != null && !desc.isEmpty()) {
                        response.setDescription(desc.length() > 5000 ? desc.substring(0, 5000) : desc);
                    }

                    return 90; // High confidence from structured data
                }
            }
        } catch (Exception e) {
            // JSON-LD parsing failed, continue to other strategies
        }
        return 0;
    }

    private int tryOpenGraphParsing(Document doc, ImportResponse response) {
        int fieldsFound = 0;

        // og:title
        String title = getMetaContent(doc, "og:title");
        if (title != null && !title.isEmpty()) {
            response.setRole(cleanText(title));
            fieldsFound++;
        }

        // og:site_name for company
        String siteName = getMetaContent(doc, "og:site_name");
        if (siteName != null && !siteName.isEmpty()) {
            response.setCompany(cleanText(siteName));
            fieldsFound++;
        }

        // og:description
        String desc = getMetaContent(doc, "og:description");
        if (desc != null && !desc.isEmpty()) {
            response.setDescription(desc.length() > 5000 ? desc.substring(0, 5000) : desc);
        }

        // twitter:title as fallback
        if (response.getRole() == null || response.getRole().isEmpty()) {
            String twitterTitle = getMetaContent(doc, "twitter:title");
            if (twitterTitle != null && !twitterTitle.isEmpty()) {
                response.setRole(cleanText(twitterTitle));
                fieldsFound++;
            }
        }

        return fieldsFound > 0 ? 60 : 0;
    }

    private int tryHtmlParsing(Document doc, ImportResponse response) {
        int fieldsFound = 0;

        // Try to extract from title
        String pageTitle = doc.title();
        if (pageTitle != null && !pageTitle.isEmpty()) {
            // Common patterns: "Job Title - Company" or "Job Title | Company"
            if (pageTitle.contains(" - ")) {
                String[] parts = pageTitle.split(" - ", 2);
                response.setRole(cleanText(parts[0]));
                if (parts.length > 1) {
                    response.setCompany(cleanText(parts[1]));
                    fieldsFound++;
                }
                fieldsFound++;
            } else if (pageTitle.contains(" | ")) {
                String[] parts = pageTitle.split(" \\| ", 2);
                response.setRole(cleanText(parts[0]));
                if (parts.length > 1) {
                    response.setCompany(cleanText(parts[1]));
                    fieldsFound++;
                }
                fieldsFound++;
            } else {
                response.setRole(cleanText(pageTitle));
                fieldsFound++;
            }
        }

        // Try h1 for job title (only if not already found)
        if (response.getRole() == null || response.getRole().isEmpty()) {
            Element h1 = doc.select("h1").first();
            if (h1 != null) {
                response.setRole(cleanText(h1.text()));
                fieldsFound++;
            }
        }

        // Common ATS patterns for company (only if not already found)
        if (response.getCompany() == null || response.getCompany().isEmpty()) {
            String company = trySelectors(doc,
                    ".company-name",
                    ".employer-name",
                    "[data-company]",
                    ".topcard__org-name");
            if (company != null) {
                response.setCompany(cleanText(company));
                fieldsFound++;
            }
        }

        // Common patterns for location
        String location = trySelectors(doc,
                ".location",
                ".job-location",
                "[data-location]",
                ".topcard__flavor--bullet");
        if (location != null) {
            response.setLocation(cleanText(location));
            fieldsFound++;
        }

        return fieldsFound > 0 ? 30 : 0;
    }

    private String getMetaContent(Document doc, String property) {
        var element = doc.select("meta[property=" + property + "]").first();
        if (element == null) {
            element = doc.select("meta[name=" + property + "]").first();
        }
        return element != null ? element.attr("content") : null;
    }

    private String trySelectors(Document doc, String... selectors) {
        for (String selector : selectors) {
            try {
                var element = doc.select(selector).first();
                if (element != null) {
                    String text = element.text();
                    if (text != null && !text.trim().isEmpty()) {
                        return text.trim();
                    }
                }
            } catch (Exception e) {
                // Continue to next selector
            }
        }
        return null;
    }

    private String cleanText(String text) {
        if (text == null)
            return "";
        return text.trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[\\n\\r]+", " ")
                .replaceAll("\\s*\\([^)]*\\)\\s*", " ")
                .trim();
    }

}