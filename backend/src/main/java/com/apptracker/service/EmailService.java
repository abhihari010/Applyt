package com.apptracker.service;

import com.apptracker.model.ApplicationEntity;
import com.apptracker.model.Reminder;
import com.apptracker.model.User;
import com.apptracker.repository.ApplicationRepository;
import com.apptracker.repository.ReminderRepository;
import com.apptracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final ReminderRepository reminderRepo;
    private final UserRepository userRepo;
    private final ApplicationRepository applicationRepo;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String supportEmail;

    @Value("${app.frontend-url}")
    private String frontendBaseUrl;

    public EmailService(ReminderRepository reminderRepo, UserRepository userRepo,
            ApplicationRepository applicationRepo, JavaMailSender mailSender) {
        this.reminderRepo = reminderRepo;
        this.userRepo = userRepo;
        this.applicationRepo = applicationRepo;
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(supportEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates it's HTML

            mailSender.send(mimeMessage);
            logger.info("Email sent successfully to {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }

}
