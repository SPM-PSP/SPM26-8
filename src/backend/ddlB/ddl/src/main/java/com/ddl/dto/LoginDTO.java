package com.ddl.dto;

import lombok.Data;

@Data
public class LoginDTO {
    private String code;     // 微信登录用的临时凭证
    private String mockId;   // 本地模拟登录用的自定义ID
    /** 新建模拟用户时的昵称（可选） */
    private String nickname;
}