package com.apptracker.service;

import com.apptracker.dto.OpenJob;
import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.User;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final ApplicationRepository applicationRepo;
    private final UserRepository userRepo;

    // In-memory cache for open job postings from GitHub
    // Refreshed every 12 hours by the scheduled task
    private List<OpenJob> cachedOpenJobs = new ArrayList<>();

    public ScheduledTaskService(ApplicationRepository applicationRepo, UserRepository userRepo) {
        this.applicationRepo = applicationRepo;
        this.userRepo = userRepo;
    }

    /**
     * Initialize the job cache on application startup
     */
    @PostConstruct
    public void initializeCache() {
        logger.info("Initializing job cache on startup");
        try {
            refreshOpenJobsCache();
            logger.info("Job cache initialized with {} entries", cachedOpenJobs.size());
        } catch (Exception e) {
            logger.error("Failed to initialize job cache on startup", e);
        }
    }

    /**
     * Runs daily at 2 AM to auto-archive rejected applications older than 30 days
     * for users who have enabled the auto-archive preference
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void autoArchiveOldRejectedApplications() {
        logger.info("Running scheduled task: auto-archive old rejected applications");

        try {
            // Get all users who have auto-archive enabled
            List<User> usersWithAutoArchive = userRepo.findAll().stream()
                    .filter(User::isAutoArchiveOldApps)
                    .toList();

            logger.info("Found {} users with auto-archive enabled", usersWithAutoArchive.size());

            int totalArchived = 0;

            for (User user : usersWithAutoArchive) {
                // Calculate the cutoff date (30 days ago)
                OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(30);

                // Find all rejected, non-archived applications for this user that are older
                // than 30 days
                List<ApplicationEntity> applicationsToArchive = applicationRepo.findAll().stream()
                        .filter(app -> app.getUserId().equals(user.getId()))
                        .filter(app -> "REJECTED".equals(app.getStatus()))
                        .filter(app -> !app.isArchived())
                        .filter(app -> app.getUpdatedAt() != null && app.getUpdatedAt().isBefore(cutoffDate))
                        .toList();

                // Archive them
                for (ApplicationEntity app : applicationsToArchive) {
                    app.setArchived(true);
                    applicationRepo.save(app);
                    totalArchived++;
                }
            }

            logger.info("Auto-archive task completed. Archived {} applications", totalArchived);

        } catch (Exception e) {
            logger.error("Error during auto-archive task", e);
        }
    }

    /**
     * Scheduled to run every 12 hours (12 PM and 12 AM) to fetch new internship
     * postings from GitHub
     */
    @Scheduled(cron = "0 0 */12 * * *")
    public void refreshOpenJobsCache() {
        logger.info("Starting scheduled task: refresh open internship applications cache from GitHub");

        try {

            String url = "https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/README.md";
            RestTemplate restTemplate = new RestTemplate();

            logger.info("Fetching markdown from: {}", url);
            String markdown = restTemplate.getForObject(url, String.class);

            if (markdown == null || markdown.isEmpty()) {
                logger.warn("No markdown content retrieved from GitHub");
                return;
            }

            logger.info("Successfully fetched markdown ({} characters)", markdown.length());

            List<OpenJob> applications = parseMarkdownTable(markdown);

            logger.info("Parsed {} total internship applications from GitHub", applications.size());

            this.cachedOpenJobs = applications;

            logger.info("Successfully updated job cache with {} postings", applications.size());

        } catch (Exception e) {
            logger.error("Error fetching open applications from GitHub", e);
        }
    }

    /**
     * Returns the cached list of open job postings from GitHub
     * This list is automatically refreshed every 12 hours
     * 
     * @return List of all job postings
     */
    public List<OpenJob> getCachedOpenJobs() {
        return new ArrayList<>(cachedOpenJobs);
    }

    /**
     * Parses a markdown table to extract internship application details
     */
    private List<OpenJob> parseMarkdownTable(String markdown) {
        List<OpenJob> applications = new ArrayList<>();

        String[] lines = markdown.split("\n");

        Pattern markdownLinkPattern = Pattern.compile("\\[([^\\]]+)\\]\\(([^\\)]+)\\)");
        Pattern htmlLinkPattern = Pattern.compile("<a\\s+href=[\"']([^\"']+)[\"']");

        for (String line : lines) {
            // Trim whitespace from the line
            line = line.trim();

            // Skip empty lines
            if (line.isEmpty()) {
                continue;
            }

            if (line.startsWith("|") && !line.contains("---")) {
                if (line.toLowerCase().contains("company") || line.toLowerCase().contains("role")) {
                    continue;
                }

                String[] cells = line.split("\\|");

                if (cells.length >= 6) {
                    OpenJob app = new OpenJob();

                    // Clean up company name - remove HTML tags, emojis, and arrows
                    String companyName = cells[1].trim()
                            .replaceAll("<[^>]*>", "") // Remove HTML tags
                            .replaceAll("[↳🔽⬇️➡️⏩]", "") // Remove arrow/emoji characters
                            .trim();
                    app.setCompany(companyName);
                    
                    app.setRole(cells[2].trim());
                    
                    // Clean up location - handle multiple locations separated by <br> or other HTML
                    String location = cells[3].trim()
                            .replaceAll("(?i)<br\\s*/?>", ", ") // Replace <br> with comma (case-insensitive)
                            .replaceAll("<[^>]*>", "") // Remove other HTML tags
                            .replaceAll("\\s*,\\s*,\\s*", ", ") // Remove duplicate commas
                            .replaceAll("^,\\s*|\\s*,$", "") // Remove leading/trailing commas
                            .trim();
                    app.setLocation(location);

                    String linkCell = cells[4];
                    String jobUrl = null;

                    // First try to find HTML anchor tag
                    Matcher htmlMatcher = htmlLinkPattern.matcher(linkCell);
                    if (htmlMatcher.find()) {
                        // group(1) contains the URL from href attribute
                        jobUrl = htmlMatcher.group(1).trim();
                    } else {
                        // Try markdown link format
                        Matcher markdownMatcher = markdownLinkPattern.matcher(linkCell);
                        if (markdownMatcher.find()) {
                            // group(2) contains the URL part
                            jobUrl = markdownMatcher.group(2).trim();
                        }
                    }

                    if (jobUrl != null && !jobUrl.isEmpty()) {
                        app.setJobUrl(jobUrl);
                    }

                    String dateCell = cells[5].trim();
                    try {
                        String[] dateParts = dateCell.split("\\s+");

                        if (dateParts.length >= 2) {
                            Map<String, Integer> monthMap = Map.ofEntries(
                                    Map.entry("Jan", 1), Map.entry("Feb", 2), Map.entry("Mar", 3),
                                    Map.entry("Apr", 4), Map.entry("May", 5), Map.entry("Jun", 6),
                                    Map.entry("Jul", 7), Map.entry("Aug", 8), Map.entry("Sep", 9),
                                    Map.entry("Oct", 10), Map.entry("Nov", 11), Map.entry("Dec", 12));

                            Integer month = monthMap.get(dateParts[0]);
                            if (month != null) {
                                int day = Integer.parseInt(dateParts[1]);

                                int currentYear = OffsetDateTime.now().getYear();
                                int currentMonth = OffsetDateTime.now().getMonthValue();

                                int year;

                                if (month > currentMonth) {
                                    year = currentYear - 1;
                                } else {
                                    year = currentYear;
                                }

                                OffsetDateTime datePosted = OffsetDateTime.now()
                                        .withYear(year)
                                        .withMonth(month)
                                        .withDayOfMonth(day)
                                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                                app.setDatePosted(datePosted);
                            }
                        }
                    } catch (NumberFormatException | java.time.DateTimeException e) {
                        logger.warn("Failed to parse date posted: {} - {}", dateCell, e.getMessage());
                    }

                    // Only add if we have valid data
                    // Skip entries with:
                    // - Empty or very short company names (likely arrows/emojis)
                    // - No URL
                    // - Company names that are just special characters
                    if (app.getCompany() != null && app.getCompany().length() > 1
                            && app.getJobUrl() != null && !app.getJobUrl().isEmpty()
                            && !app.getCompany().matches("[^a-zA-Z0-9\\s]+")) { // Reject if only special chars
                        applications.add(app);
                    }
                }
            }
        }

        return applications;
    }
}
