package com.ddl.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("todo_task")
public class TodoTask {
    @TableId(type = IdType.ASSIGN_UUID)
    private String uuid;
    private String title;
    private String content;
    private Integer status;   // 0:未完成, 1:已完成
    private Integer priority; // 优先级排序核心字段
    private String createdAt;
    private String planId;
    private String targetId;
    private String userId;    // 用于数据备份识别
}