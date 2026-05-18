package com.ddl.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("todo_reminder_log")
public class TodoReminderLog {
    @TableId(type = IdType.ASSIGN_UUID)
    private String uuid;
    private String todoId;
    private String userId;
    /** 24h 或 2h */
    private String reminderType;
    private String sentAt;
}
