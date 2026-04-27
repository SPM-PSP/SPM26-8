// UserServiceImpl.java
package com.ddl.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ddl.dto.LoginDTO;
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
            this.save(user);
        }
        return user;
    }
}