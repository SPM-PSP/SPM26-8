package com.ddl.service;
import com.baomidou.mybatisplus.extension.service.IService;
import com.ddl.dto.LoginDTO;
import com.ddl.entity.User;

public interface UserService extends IService<User> {
    User mockLogin(LoginDTO loginDTO);

    User getByOpenid(String openid);

    User updateReminderSettings(com.ddl.dto.ReminderSettingsDTO dto);
}