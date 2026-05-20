package com.ddl.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ddl.entity.TodoTask;
import com.ddl.mapper.TodoMapper;
import com.ddl.service.TodoTaskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
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

    private void normalizeTask(TodoTask t, String userId) {
        t.setUserId(userId);
        if (t.getUuid() == null || t.getUuid().isBlank()) {
            t.setUuid(UUID.randomUUID().toString().replace("-", ""));
        }
        if (t.getTitle() == null || t.getTitle().isBlank()) {
            t.setTitle("未命名任务");
        }
        if (t.getContent() == null) {
            t.setContent("");
        }
        if (t.getStatus() == null) {
            t.setStatus(0);
        }
        if (t.getPriority() == null) {
            t.setPriority(1);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean syncTasks(String userId, List<TodoTask> tasks) {
        if (tasks == null) {
            return false;
        }
        this.remove(new LambdaQueryWrapper<TodoTask>().eq(TodoTask::getUserId, userId));
        if (tasks.isEmpty()) {
            return true;
        }
        tasks.forEach(t -> normalizeTask(t, userId));
        return this.saveBatch(tasks);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean appendTasks(String userId, List<TodoTask> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return true;
        }
        tasks.forEach(t -> normalizeTask(t, userId));
        return this.saveOrUpdateBatch(tasks);
    }
}