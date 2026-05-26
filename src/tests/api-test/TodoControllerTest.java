package com.ddl.controller;

import com.ddl.entity.TodoTask;
import com.ddl.service.TodoTaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import common.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TodoControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private TodoTaskService todoTaskService;

    @InjectMocks
    private TodoController todoController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(todoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ========== GET /api/todo/list ==========

    @Test
    void list_ShouldReturnTasks_WhenUserExists() throws Exception {
        TodoTask task = createTask("uuid-1", "Task1", 0, 1, "user-1");
        when(todoTaskService.getSortedTasks("user-1"))
                .thenReturn(Collections.singletonList(task));

        mockMvc.perform(get("/api/todo/list").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].uuid", is("uuid-1")))
                .andExpect(jsonPath("$.data[0].title", is("Task1")));
    }

    @Test
    void list_ShouldReturnEmpty_WhenUserHasNoTasks() throws Exception {
        when(todoTaskService.getSortedTasks("empty-user"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/todo/list").param("userId", "empty-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void list_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(get("/api/todo/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void list_ShouldHandle_ServiceException() throws Exception {
        when(todoTaskService.getSortedTasks("user-1"))
                .thenThrow(new RuntimeException("DB connection lost"));

        mockMvc.perform(get("/api/todo/list").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/todo/backup ==========

    @Test
    void backup_ShouldSucceed_WithDefaultReplaceMode() throws Exception {
        when(todoTaskService.syncTasks(eq("user-1"), anyList())).thenReturn(true);

        List<TodoTask> tasks = Arrays.asList(
                createTask("uuid-1", "Task1", 0, 1, "user-1"),
                createTask("uuid-2", "Task2", 1, 2, "user-1")
        );

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tasks)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldSucceed_WithAppendMode() throws Exception {
        when(todoTaskService.appendTasks(eq("user-1"), anyList())).thenReturn(true);

        List<TodoTask> tasks = Collections.singletonList(
                createTask("uuid-3", "Task3", 0, 1, "user-1")
        );

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .param("mode", "append")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tasks)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldCallAppend_WhenModeIsAppend() throws Exception {
        when(todoTaskService.appendTasks(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .param("mode", "append")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldFail_WhenSyncReturnsFalse() throws Exception {
        when(todoTaskService.syncTasks(eq("user-1"), anyList())).thenReturn(false);

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Collections.singletonList(createTask("uuid-1", "T1", 0, 1, "user-1")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(post("/api/todo/backup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldHandle_EmptyArray() throws Exception {
        when(todoTaskService.syncTasks(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldHandle_ServiceException() throws Exception {
        when(todoTaskService.syncTasks(eq("user-1"), anyList()))
                .thenThrow(new RuntimeException("DB error"));

        List<TodoTask> tasks = Collections.singletonList(
                createTask("uuid-1", "T1", 0, 1, "user-1")
        );

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tasks)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)))
                .andExpect(jsonPath("$.msg", containsString("DB error")));
    }

    @Test
    void backup_ShouldUseReplace_WhenModeIsUppercaseREPLACE() throws Exception {
        when(todoTaskService.syncTasks(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .param("mode", "REPLACE")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldUseReplace_WhenModeIsUnknown() throws Exception {
        when(todoTaskService.syncTasks(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .param("mode", "invalid_mode")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldHandle_AppendServiceException() throws Exception {
        when(todoTaskService.appendTasks(eq("user-1"), anyList()))
                .thenThrow(new RuntimeException("append failed"));

        mockMvc.perform(post("/api/todo/backup")
                        .param("userId", "user-1")
                        .param("mode", "append")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"uuid\":\"u1\",\"title\":\"T1\"}]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    private TodoTask createTask(String uuid, String title, int status, int priority, String userId) {
        TodoTask task = new TodoTask();
        task.setUuid(uuid);
        task.setTitle(title);
        task.setContent(title + " description");
        task.setStatus(status);
        task.setPriority(priority);
        task.setCreatedAt("2026-05-20T10:00:00Z");
        task.setUserId(userId);
        return task;
    }
}
