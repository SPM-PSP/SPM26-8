package com.ddl.controller;

import common.Result;
import com.ddl.entity.Target;
import com.ddl.service.TargetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 目标模块控制器 (TargetController)
 * 负责接收和处理与“目标(Target)”相关的前端 HTTP 请求。
 * 主要提供目标数据的云端备份（同步）与恢复接口。
 */
@RestController // 复合注解：标识这是一个控制器，并且类中所有方法的返回值都会自动转为 JSON 格式响应给前端
@RequestMapping("/api/target") // 统一路由前缀：规定访问该控制器下所有接口的 URL 必须以 /api/target 开头
public class TargetController {

    @Autowired // 依赖注入：由 Spring 容器自动实例化 TargetService 并注入到这里，供后续业务逻辑调用
    private TargetService targetService;

    /**
     * 恢复/获取云端目标列表数据 (GET请求)
     * 接口路径: GET /api/target/restore?userId=xxx
     *
     * @param userId 用户的唯一标识 (通过 URL 的 Query 参数传递)
     * @return 统一标准响应对象 Result，成功时 data 字段中将包含该用户的所有目标数据列表
     */
    @GetMapping("/restore")
    public Result restore(@RequestParam String userId) {
        // 调用 Service 层方法去数据库中查询当前用户的所有目标记录，并包装成成功响应返回
        return Result.success(targetService.getTargetsByUserId(userId));
    }

    /**
     * 备份/同步本地目标数据到云端 (POST请求)
     * 接口路径: POST /api/target/backup?userId=xxx
     *
     * @param targets 前端传来的目标数据列表
     * @param userId  用户的唯一标识 (通过 URL 的 Query 参数传递)
     * @return 统一标准响应对象 Result，返回纯文本提示“备份成功”或“备份失败”
     */
    @PostMapping("/backup")
    public Result backup(@RequestBody List<Target> targets, @RequestParam String userId) {
        // 调用 Service 层方法执行全量同步/备份逻辑，根据返回的布尔值决定响应成功还是失败信息。
        // （三元运算符：条件 ? 成功结果 : 失败结果）
        return targetService.syncTargets(userId, targets) ? Result.success("备份成功") : Result.error("备份失败");
    }
}