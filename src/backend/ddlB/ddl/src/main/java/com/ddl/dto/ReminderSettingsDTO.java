package com.ddl.dto;

import lombok.Data;

@Data
public class ReminderSettingsDTO {
    /** 与 openid 一致，当前为 mock-user */
    private String openid;
    private String email;
    private Integer isReminderOn;
    private Integer remindBefore24h;
    private Integer remindBefore2h;
}
