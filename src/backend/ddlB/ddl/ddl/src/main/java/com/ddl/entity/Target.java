package com.ddl.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("target")
public class Target {
    @TableId(type = IdType.ASSIGN_UUID)
    private String uuid;
    private String title;
    private String content;
    private Integer progress; // 目标进度(0-100)
    private String createdAt;
    private String userId;    // 关联用户
}