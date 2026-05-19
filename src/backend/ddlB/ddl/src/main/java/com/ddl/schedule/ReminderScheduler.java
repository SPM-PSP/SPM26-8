package com.ddl.schedule;

import com.ddl.service.TodoReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    @Autowired
    private TodoReminderService todoReminderService;

    /** 每分钟扫描临期任务并发送邮件 */
    @Scheduled(cron = "0 * * * * ?")
    public void scanReminders() {
        try {
            int sent = todoReminderService.scanAndSendReminders();
            if (sent > 0) {
                log.info("任务邮件提醒：本次发送 {} 封", sent);
            }
        } catch (Exception e) {
            log.warn("任务邮件提醒扫描失败: {}", e.getMessage());
        }
    }
}
