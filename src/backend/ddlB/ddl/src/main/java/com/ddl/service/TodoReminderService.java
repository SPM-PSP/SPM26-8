package com.ddl.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ddl.entity.TodoReminderLog;
import com.ddl.entity.TodoTask;
import com.ddl.entity.User;
import com.ddl.mapper.TodoReminderLogMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TodoReminderService {

    private static final long MINUTES_24H = 24 * 60;
    private static final long MINUTES_2H = 2 * 60;
    /** 定时任务每分钟执行，允许的时间窗口（分钟） */
    private static final long WINDOW = 2;

    @Autowired
    private TodoTaskService todoTaskService;

    @Autowired
    private UserService userService;

    @Autowired
    private TodoReminderLogMapper reminderLogMapper;

    @Autowired
    private EmailService emailService;

    public int scanAndSendReminders() {
        List<User> users = userService.list(
                new LambdaQueryWrapper<User>()
                        .eq(User::getIsReminderOn, 1)
                        .isNotNull(User::getEmail)
                        .ne(User::getEmail, "")
        );
        int sent = 0;
        for (User user : users) {
            sent += processUserReminders(user);
        }
        return sent;
    }

    private int processUserReminders(User user) {
        String userId = user.getOpenid();
        List<TodoTask> tasks = todoTaskService.list(
                new LambdaQueryWrapper<TodoTask>()
                        .eq(TodoTask::getUserId, userId)
                        .eq(TodoTask::getStatus, 0)
                        .isNotNull(TodoTask::getEndTime)
                        .ne(TodoTask::getEndTime, "")
        );

        int sent = 0;
        long nowMs = System.currentTimeMillis();

        for (TodoTask task : tasks) {
            long endMs = parseTime(task.getEndTime());
            if (endMs <= 0) continue;

            long minutesLeft = (endMs - nowMs) / 60_000;
            if (minutesLeft < 0) continue;

            if (isEnabled(user.getRemindBefore24h())
                    && inWindow(minutesLeft, MINUTES_24H)
                    && !alreadySent(task.getUuid(), userId, "24h")) {
                if (sendReminder(user, task, "24h", minutesLeft)) {
                    sent++;
                }
            }

            if (isEnabled(user.getRemindBefore2h())
                    && inWindow(minutesLeft, MINUTES_2H)
                    && !alreadySent(task.getUuid(), userId, "2h")) {
                if (sendReminder(user, task, "2h", minutesLeft)) {
                    sent++;
                }
            }
        }
        return sent;
    }

    private boolean inWindow(long minutesLeft, long targetMinutes) {
        return minutesLeft <= targetMinutes && minutesLeft > targetMinutes - WINDOW;
    }

    private boolean isEnabled(Integer flag) {
        return flag != null && flag == 1;
    }

    private boolean alreadySent(String todoId, String userId, String type) {
        Long count = reminderLogMapper.selectCount(
                new LambdaQueryWrapper<TodoReminderLog>()
                        .eq(TodoReminderLog::getTodoId, todoId)
                        .eq(TodoReminderLog::getUserId, userId)
                        .eq(TodoReminderLog::getReminderType, type)
        );
        return count != null && count > 0;
    }

    private boolean sendReminder(User user, TodoTask task, String type, long minutesLeft) {
        String label = "24h".equals(type) ? "24 小时" : "2 小时";
        String endStr = formatTime(task.getEndTime());
        String subject = "【任务临期提醒】还有约 " + label + "：" + task.getTitle();
        String body = "您好，" + (user.getNickname() != null ? user.getNickname() : "用户") + "：\n\n"
                + "您的任务即将到期：\n"
                + "标题：" + task.getTitle() + "\n"
                + (task.getContent() != null && !task.getContent().isBlank()
                ? "说明：" + task.getContent() + "\n" : "")
                + "截止时间：" + endStr + "\n"
                + "剩余约：" + formatMinutes(minutesLeft) + "\n\n"
                + "请登录目标管理系统及时处理。\n";

        try {
            emailService.sendPlainText(user.getEmail(), subject, body);
            TodoReminderLog log = new TodoReminderLog();
            log.setTodoId(task.getUuid());
            log.setUserId(user.getOpenid());
            log.setReminderType(type);
            log.setSentAt(Instant.now().toString());
            reminderLogMapper.insert(log);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public void sendTestEmail(User user) {
        emailService.sendPlainText(
                user.getEmail(),
                "【测试】任务邮件提醒已开通",
                "您已成功绑定邮箱。当任务截止前 24 小时 / 2 小时（可在「我的」中开关）时，系统将发送提醒邮件。\n\n"
                        + (emailService.isConfigured()
                        ? "本邮件由系统 SMTP 真实发出。若未收到，请检查 QQ 邮箱垃圾箱，并登录发件 QQ 邮箱网页版查看「已发送」。"
                        : "当前为演示模式：邮件内容输出在后端控制台，请配置 spring.mail 后启用真实发送。")
        );
    }

    private long parseTime(String value) {
        try {
            return Instant.parse(value).toEpochMilli();
        } catch (Exception ignored) {
        }
        try {
            String normalized = value.contains("T") ? value : value.replace(" ", "T");
            if (normalized.length() == 16) {
                return java.time.LocalDateTime.parse(normalized)
                        .atZone(ZoneId.systemDefault())
                        .toInstant()
                        .toEpochMilli();
            }
            return java.time.LocalDateTime.parse(normalized)
                    .atZone(ZoneId.systemDefault())
                    .toInstant()
                    .toEpochMilli();
        } catch (Exception e) {
            return -1;
        }
    }

    private String formatTime(String value) {
        long ms = parseTime(value);
        if (ms <= 0) return value;
        return DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
                .withZone(ZoneId.systemDefault())
                .format(Instant.ofEpochMilli(ms));
    }

    private String formatMinutes(long minutes) {
        long h = minutes / 60;
        long m = minutes % 60;
        if (h > 0) return h + " 小时 " + m + " 分钟";
        return m + " 分钟";
    }
}
