package com.ddl.controller;

import common.Result;
import com.ddl.entity.TodoTask;
import com.ddl.service.TodoTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 待办事项模块控制器 (TodoController)
 * 负责接收和处理与「待办任务(TodoTask)」相关的前端 HTTP 请求。
 */
@RestController
@RequestMapping("/api/todo")
public class TodoController {

    @Autowired
    private TodoTaskService todoTaskService;

    /**
     * 获取云端已排序的待办任务列表
     * GET /api/todo/list?userId=xxx
     */
    @GetMapping("/list")
    public Result list(@RequestParam String userId) {
        return Result.success(todoTaskService.getSortedTasks(userId));
    }

    /**
     * 备份/同步待办任务
     * POST /api/todo/backup?userId=xxx&mode=replace|append
     * mode=replace（默认）先删后插；mode=append 仅增量写入
     */
    @PostMapping("/backup")
    public Result backup(
            @RequestBody List<TodoTask> tasks,
            @RequestParam String userId,
            @RequestParam(defaultValue = "replace") String mode) {
        boolean ok = "append".equalsIgnoreCase(mode)
                ? todoTaskService.appendTasks(userId, tasks)
                : todoTaskService.syncTasks(userId, tasks);
        return ok ? Result.success("同步成功") : Result.error("失败");
    }
}
