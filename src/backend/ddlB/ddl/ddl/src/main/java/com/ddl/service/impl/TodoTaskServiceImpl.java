package com.ddl.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ddl.entity.TodoTask;
import com.ddl.mapper.TodoMapper;
import com.ddl.service.TodoTaskService;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TodoTaskServiceImpl extends ServiceImpl<TodoMapper, TodoTask> implements TodoTaskService {

    @Override
    public List<TodoTask> getSortedTasks(String userId) {
        List<TodoTask> list = this.list(new LambdaQueryWrapper<TodoTask>().eq(TodoTask::getUserId, userId));
        // 核心排序：优先级(四象限)由高到低，时间倒序
        return list.stream()
                .sorted(Comparator.comparing(TodoTask::getPriority).reversed()
                        .thenComparing(TodoTask::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public boolean syncTasks(String userId, List<TodoTask> tasks) {
        this.remove(new LambdaQueryWrapper<TodoTask>().eq(TodoTask::getUserId, userId));
        tasks.forEach(t -> t.setUserId(userId));
        return this.saveBatch(tasks);
    }
}