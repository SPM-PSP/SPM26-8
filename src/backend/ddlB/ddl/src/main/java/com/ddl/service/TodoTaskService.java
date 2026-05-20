package com.ddl.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ddl.entity.TodoTask;
import java.util.List;

public interface TodoTaskService extends IService<TodoTask> {
    List<TodoTask> getSortedTasks(String userId);
    boolean syncTasks(String userId, List<TodoTask> tasks);
}