package com.ddl.controller;

import common.Result;
import com.ddl.entity.TodoTask;
import com.ddl.service.TodoTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 待办事项模块控制器 (TodoController)
 * 负责接收和处理与“待办任务(TodoTask)”相关的前端 HTTP 请求。
 * 主要提供获取已排序的待办列表以及数据云端备份（同步）的接口。
 */
@RestController // 复合注解：标识这是一个控制器，并且类中所有方法的返回值都会自动转为 JSON 格式响应给前端
@RequestMapping("/api/todo") // 统一路由前缀：规定访问该控制器下所有接口的 URL 必须以 /api/todo 开头
public class TodoController {

    @Autowired // 依赖注入：由 Spring 容器自动实例化 TodoTaskService 并注入到这里，供后续业务逻辑调用
    private TodoTaskService todoTaskService;

    /**
     * 获取云端已排序的待办任务列表 (GET请求)
     * 接口路径: GET /api/todo/list?userId=xxx
     *
     * @param userId 用户的唯一标识 (通过 URL 的 Query 参数传递)
     * @return 统一标准响应对象 Result，成功时 data 字段中将包含该用户排好序的待办任务列表
     */
    @GetMapping("/list")
    public Result list(@RequestParam String userId) {
        // 调用 Service 层方法去数据库中查询当前用户的所有待办记录（已排序），并包装成成功响应返回
        return Result.success(todoTaskService.getSortedTasks(userId));
    }

    /**
     * 备份/同步本地待办任务数据到云端 (POST请求)
     * 接口路径: POST /api/todo/backup?userId=xxx
     *
     * @param tasks  前端传来的待办任务列表 (因使用 @RequestBody，前端需将数据放在 HTTP 请求体 Body 中以 JSON 数组格式传递)
     * @param userId 用户的唯一标识 (通过 URL 的 Query 参数传递)
     * @return 统一标准响应对象 Result，返回纯文本提示“同步成功”或“失败”
     */
    @PostMapping("/backup")
    public Result backup(@RequestBody List<TodoTask> tasks, @RequestParam String userId) {
        // 调用 Service 层方法执行全量同步/备份逻辑，根据返回的布尔值决定响应成功还是失败信息。
        // （三元运算符：条件 ? 成功结果 : 失败结果）
        return todoTaskService.syncTasks(userId, tasks) ? Result.success("同步成功") : Result.error("失败");
    }
}