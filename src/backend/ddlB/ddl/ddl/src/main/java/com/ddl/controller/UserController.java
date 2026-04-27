package com.ddl.controller;

import common.Result;
import com.ddl.dto.LoginDTO;
import com.ddl.entity.User;
import com.ddl.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 本地模拟登录接口，用于绕过微信授权直接开发业务
     */
    @PostMapping("/login/mock")
    public Result mockLogin(@RequestBody LoginDTO loginDTO) {
        User user = userService.mockLogin(loginDTO);
        // 此处暂时直接返回用户信息，日后加入 JWT 可以返回 Token
        return Result.success("登录成功", user);
    }

    /**
     * 更新用户信息（如配置项）
     */
    @PostMapping("/update")
    public Result updateInfo(@RequestBody User user) {
        userService.saveOrUpdate(user);
        return Result.success("更新成功");
    }
}