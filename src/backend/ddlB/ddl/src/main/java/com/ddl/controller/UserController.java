package com.ddl.controller;

import common.Result;
import com.ddl.dto.LoginDTO;
import com.ddl.dto.ReminderSettingsDTO;
import com.ddl.entity.User;
import com.ddl.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户模块控制器 (UserController)
 * 负责接收和处理与“用户(User)”相关的前端 HTTP 请求。
 * 包含用户模拟登录、信息查询、信息更新及提醒设置等功能。
 */
@RestController // 复合注解：标识这是一个控制器，所有方法的返回值自动转为 JSON 格式返回给前端
@RequestMapping("/api/user") // 统一路由前缀：规定访问该控制器下所有接口的 URL 必须以 /api/user 开头
public class UserController {

    @Autowired // 依赖注入：由 Spring 容器自动实例化 UserService 并注入到这里
    private UserService userService;

    /**
     * 本地模拟登录接口 (POST请求)
     * 接口路径: POST /api/user/login/mock
     * 用途: 用于在普通浏览器环境（如 Chrome）开发时，绕过微信真实的授权机制，直接建立用户会话。
     *
     * @param loginDTO 登录数据传输对象，包含前端传来的模拟标识 (如 mockId)
     * @return 统一标准响应对象 Result，成功时 data 字段包含当前登录的用户实体信息
     */
    @PostMapping("/login/mock")
    public Result mockLogin(@RequestBody LoginDTO loginDTO) {
        User user = userService.mockLogin(loginDTO);
        // 此处暂时直接返回用户信息，日后如果加入了 JWT 鉴权体系，可以改为返回 Token 字符串
        return Result.success("登录成功", user);
    }

    /**
     * 更新用户通用信息 (POST请求)
     * 接口路径: POST /api/user/update
     * 用途: 更新用户的全量或部分基础配置项。
     *
     * @param user 前端传来的最新用户实体数据 (JSON格式)
     * @return 统一标准响应对象 Result，纯文本提示“更新成功”
     */
    @PostMapping("/update")
    public Result updateInfo(@RequestBody User user) {
        // 调用 Service 层的 saveOrUpdate 方法，如果主键存在则更新，不存在则新增
        userService.saveOrUpdate(user);
        return Result.success("更新成功");
    }

    /**
     * 获取用户个人信息 (GET请求)
     * 接口路径: GET /api/user/profile?openid=xxx
     * 用途: 根据用户的唯一标识(openid)拉取最新的个人资料。如果用户不存在，则自动为其走模拟注册流程。
     *
     * @param openid 用户的唯一标识 (通常是微信授权获取的 OpenID，此处开发阶段由前端传入)
     * @return 统一标准响应对象 Result，泛型限定 data 必须是 User 对象
     */
    @GetMapping("/profile")
    public Result<User> profile(@RequestParam String openid) {
        User user = userService.getByOpenid(openid);
        // 防御性编程：如果在数据库中未查到该 openid 对应的用户
        if (user == null) {
            // 则现场构建一个登录 DTO，为其执行模拟注册/登录逻辑，保证正常返回用户实体
            LoginDTO loginDTO = new LoginDTO();
            loginDTO.setMockId(openid);
            user = userService.mockLogin(loginDTO);
        }
        return Result.success(user);
    }

    /**
     * 更新用户提醒设置 (POST请求)
     * 接口路径: POST /api/user/reminder-settings
     * 用途: 专门用于处理用户修改“全局提醒”（如提前多久提醒、是否开启推送等）的设置。
     *
     * @param dto 提醒设置的数据传输对象 (DTO)，包含了前端传来的特定提醒字段
     * @return 统一标准响应对象 Result，包含提示信息以及更新后的 User 对象
     */
    @PostMapping("/reminder-settings")
    public Result<User> reminderSettings(@RequestBody ReminderSettingsDTO dto) {
        // 调用 Service 层专门处理提醒设置更新的逻辑，并返回更新后的最新用户记录
        User user = userService.updateReminderSettings(dto);
        return Result.success("保存成功", user);
    }
}