package com.ddl.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("plan")
public class Plan {
    @TableId(type = IdType.ASSIGN_UUID)
    private String uuid;
    private String title;
    private String content;
    private Integer progress; // 计划进度(0-100)
    private String targetId;  // 归属的总目标ID
    private String createdAt;
    private String userId;    // 关联用户
}