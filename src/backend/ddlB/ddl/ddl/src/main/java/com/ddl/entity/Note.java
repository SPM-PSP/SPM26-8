package com.ddl.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;

/**
 * 对应前端 Note 模型
 */
@Data
@TableName("note")
public class Note implements Serializable {
    @TableId(type = IdType.ASSIGN_UUID)
    private String uuid; // 与前端 Model.js 生成的 uuid 保持一致
    
    private String title;
    private String content;
    private String createdAt; // 保持原小程序 String 格式
    private String planId;
    private String targetId;
    private String userId; // 用于区分不同用户的数据备份
}