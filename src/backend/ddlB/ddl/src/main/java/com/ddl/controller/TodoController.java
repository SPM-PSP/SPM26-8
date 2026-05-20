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

    @PostMapping("/backup")
    public Result backup(@RequestBody List<TodoTask> tasks, @RequestParam String userId) {
        return todoTaskService.syncTasks(userId, tasks) ? Result.success("同步成功") : Result.error("失败");
    }
}