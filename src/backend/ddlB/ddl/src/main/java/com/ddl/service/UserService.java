package com.ddl.service;
import com.baomidou.mybatisplus.extension.service.IService;
import com.ddl.dto.LoginDTO;
import com.ddl.entity.User;

public interface UserService extends IService<User> {
    User mockLogin(LoginDTO loginDTO); // 模拟登录接口
}