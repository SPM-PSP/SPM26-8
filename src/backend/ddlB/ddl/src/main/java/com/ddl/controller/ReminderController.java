package com.ddl.controller;

import com.ddl.entity.User;
import com.ddl.service.EmailService;
import com.ddl.service.TodoReminderService;
import com.ddl.service.UserService;
import common.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reminder")
public class ReminderController {

    @Autowired
    private TodoReminderService todoReminderService;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    /**
     * 手动检查临期任务：对当前用户重发 24h / 2h 内到期的提醒邮件（忽略是否已发过）
     */
    @PostMapping("/scan")
    public Result<Integer> scan(@RequestParam String openid) {
        User user = userService.getByOpenid(openid);
        if (user == null) {
            return Result.error("用户不存在");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return Result.error("请先绑定邮箱");
        }
        if (user.getIsReminderOn() == null || user.getIsReminderOn() != 1) {
            return Result.error("请先开启邮件提醒");
        }
        int sent = todoReminderService.scanDueRemindersForUser(user);
        return Result.success("扫描完成", sent);
    }

    /** 发送测试邮件 */
    @PostMapping("/test")
    public Result<String> testMail(@RequestParam String openid) {
        User user = userService.getByOpenid(openid);
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return Result.error("请先绑定邮箱");
        }
        try {
            todoReminderService.sendTestEmail(user);
        } catch (Exception e) {
            return Result.error("发送失败：" + e.getMessage());
        }
        String mode = emailService.isConfigured()
                ? "已发送至 " + user.getEmail() + "，请查收件箱与垃圾箱"
                : "演示模式：请查看后端控制台日志";
        return Result.success(mode, null);
    }
}
