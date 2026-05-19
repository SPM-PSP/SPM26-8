// UserServiceImpl.java
package com.ddl.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ddl.dto.LoginDTO;
import com.ddl.dto.ReminderSettingsDTO;
import com.ddl.entity.User;
import com.ddl.mapper.UserMapper;
import com.ddl.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    @Override
    public User mockLogin(LoginDTO loginDTO) {
        // 本地调试用的模拟登录逻辑
        String mockId = loginDTO.getMockId();
        User user = this.getOne(new LambdaQueryWrapper<User>().eq(User::getOpenid, mockId));
        if (user == null) {
            // 如果不存在，静默注册一个模拟用户
            user = new User();
            user.setOpenid(mockId);
            user.setNickname("模拟测试用户");
            user.setIsReminderOn(1);
            user.setDefaultAdvanceMinutes(30);
            user.setRemindBefore24h(1);
            user.setRemindBefore2h(1);
            this.save(user);
        }
        return user;
    }

    @Override
    public User getByOpenid(String openid) {
        return this.getOne(new LambdaQueryWrapper<User>().eq(User::getOpenid, openid));
    }

    @Override
    public User updateReminderSettings(ReminderSettingsDTO dto) {
        User user = getByOpenid(dto.getOpenid());
        if (user == null) {
            throw new IllegalArgumentException("用户不存在，请先登录");
        }
        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail().trim());
        }
        if (dto.getIsReminderOn() != null) {
            user.setIsReminderOn(dto.getIsReminderOn());
        }
        if (dto.getRemindBefore24h() != null) {
            user.setRemindBefore24h(dto.getRemindBefore24h());
        }
        if (dto.getRemindBefore2h() != null) {
            user.setRemindBefore2h(dto.getRemindBefore2h());
        }
        this.updateById(user);
        return user;
    }
}