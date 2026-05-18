package com.ddl.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String FROM_NAME = "DDL任务提醒";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${ddl.mail.from:}")
    private String mailFrom;

    public boolean isConfigured() {
        return mailSender != null
                && mailUsername != null
                && !mailUsername.isBlank();
    }

    public void sendPlainText(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("收件邮箱不能为空");
        }
        if (!isConfigured()) {
            log.info("[邮件演示模式] 未配置 SMTP，模拟发送 → {}\n主题: {}\n{}", to, subject, body);
            return;
        }
        // QQ 邮箱要求发件地址与 SMTP 登录账号一致，且需 UTF-8 编码发件人
        String fromAddress = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom.trim() : mailUsername.trim();
        if (!fromAddress.equalsIgnoreCase(mailUsername.trim())) {
            log.warn("发件地址 {} 与 SMTP 账号 {} 不一致，QQ 邮箱可能拒收", fromAddress, mailUsername);
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress, FROM_NAME);
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
            log.info("[邮件已发送] from={} to={} subject={}", fromAddress, to, subject);
        } catch (Exception e) {
            log.error("[邮件发送失败] to={} subject={}", to, subject, e);
            throw new IllegalStateException("邮件发送失败：" + e.getMessage(), e);
        }
    }
}
