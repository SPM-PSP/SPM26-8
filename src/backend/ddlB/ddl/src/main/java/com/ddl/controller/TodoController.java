package com.ddl.controller;

import common.Result;
import com.ddl.entity.TodoTask;
import com.ddl.service.TodoTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/todo")
public class TodoController {
    @Autowired
    private TodoTaskService todoTaskService;

    @GetMapping("/list")
    public Result list(@RequestParam String userId) {
        return Result.success(todoTaskService.getSortedTasks(userId));
    }

    /**
     * 全量同步：mode=replace（默认）先删后插；mode=append 仅增量写入
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