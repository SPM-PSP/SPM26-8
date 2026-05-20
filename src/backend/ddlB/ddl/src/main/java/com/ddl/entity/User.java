package com.ddl.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.ASSIGN_UUID)
    private String uuid;      // 保持和其他表一致的UUID主键
    private String openid;    // 微信OpenID (唯一)
    private String nickname;  // 用户昵称
    private String avatarUrl; // 头像链接
    private Integer isReminderOn; // 提醒开关：1开启，0关闭
    private Integer defaultAdvanceMinutes; // 默认提前提醒时间
    /** 绑定邮箱，用于任务临期提醒 */
    private String email;
    /** 提前 24 小时邮件提醒：1 开启（列名含数字，需显式映射） */
    @TableField("remind_before_24h")
    private Integer remindBefore24h;
    /** 提前 2 小时邮件提醒：1 开启 */
    @TableField("remind_before_2h")
    private Integer remindBefore2h;
}