package com.ddl.controller;

import com.ddl.entity.Target;
import com.ddl.service.TargetService;
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

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TargetControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private TargetService targetService;

    @InjectMocks
    private TargetController targetController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(targetController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ========== GET /api/target/restore ==========

    @Test
    void restore_ShouldReturnTargets_WhenUserExists() throws Exception {
        when(targetService.getTargetsByUserId("user-1"))
                .thenReturn(Collections.singletonList(createTarget("uuid-1", "Goal1", 50, "user-1")));

        mockMvc.perform(get("/api/target/restore").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].uuid", is("uuid-1")))
                .andExpect(jsonPath("$.data[0].title", is("Goal1")));
    }

    @Test
    void restore_ShouldReturnEmpty_WhenUserHasNoTargets() throws Exception {
        when(targetService.getTargetsByUserId("empty-user"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/target/restore").param("userId", "empty-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void restore_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(get("/api/target/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void restore_ShouldHandle_ServiceException() throws Exception {
        when(targetService.getTargetsByUserId("user-1"))
                .thenThrow(new RuntimeException("DB connection lost"));

        mockMvc.perform(get("/api/target/restore").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/target/backup ==========

    @Test
    void backup_ShouldSucceed_WhenValidData() throws Exception {
        when(targetService.syncTargets(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/target/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Arrays.asList(
                                createTarget("uuid-1", "Goal1", 50, "user-1"),
                                createTarget("uuid-2", "Goal2", 100, "user-1")
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldFail_WhenSyncReturnsFalse() throws Exception {
        when(targetService.syncTargets(eq("user-1"), anyList())).thenReturn(false);

        mockMvc.perform(post("/api/target/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Collections.singletonList(createTarget("uuid-1", "G1", 50, "user-1")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(post("/api/target/backup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldHandle_EmptyArray() throws Exception {
        when(targetService.syncTargets(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/target/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldHandle_ServiceException() throws Exception {
        when(targetService.syncTargets(eq("user-1"), anyList()))
                .thenThrow(new RuntimeException("sync error"));

        mockMvc.perform(post("/api/target/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"uuid\":\"u1\",\"title\":\"T1\",\"progress\":0,\"userId\":\"user-1\"}]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    private Target createTarget(String uuid, String title, int progress, String userId) {
        Target target = new Target();
        target.setUuid(uuid);
        target.setTitle(title);
        target.setContent(title + " description");
        target.setProgress(progress);
        target.setCreatedAt("2026-05-20T10:00:00Z");
        target.setUserId(userId);
        return target;
    }
}
