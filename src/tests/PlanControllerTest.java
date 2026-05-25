package com.ddl.controller;

import com.ddl.entity.Plan;
import com.ddl.service.PlanService;
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
class PlanControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PlanService planService;

    @InjectMocks
    private PlanController planController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(planController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ========== GET /api/plan/restore ==========

    @Test
    void restore_ShouldReturnPlans_WhenUserExists() throws Exception {
        when(planService.getPlansByUserId("user-1"))
                .thenReturn(Collections.singletonList(createPlan("uuid-1", "Plan1", 30, "user-1")));

        mockMvc.perform(get("/api/plan/restore").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].uuid", is("uuid-1")))
                .andExpect(jsonPath("$.data[0].title", is("Plan1")));
    }

    @Test
    void restore_ShouldReturnEmpty_WhenUserHasNoPlans() throws Exception {
        when(planService.getPlansByUserId("empty-user"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/plan/restore").param("userId", "empty-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void restore_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(get("/api/plan/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void restore_ShouldHandle_ServiceException() throws Exception {
        when(planService.getPlansByUserId("user-1"))
                .thenThrow(new RuntimeException("DB connection lost"));

        mockMvc.perform(get("/api/plan/restore").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/plan/backup ==========

    @Test
    void backup_ShouldSucceed_WhenValidData() throws Exception {
        when(planService.syncPlans(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/plan/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Arrays.asList(
                                createPlan("uuid-1", "Plan1", 30, "user-1"),
                                createPlan("uuid-2", "Plan2", 60, "user-1")
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldFail_WhenSyncReturnsFalse() throws Exception {
        when(planService.syncPlans(eq("user-1"), anyList())).thenReturn(false);

        mockMvc.perform(post("/api/plan/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Collections.singletonList(createPlan("uuid-1", "P1", 30, "user-1")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(post("/api/plan/backup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldHandle_EmptyArray() throws Exception {
        when(planService.syncPlans(eq("user-1"), anyList())).thenReturn(true);

        mockMvc.perform(post("/api/plan/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldHandle_ServiceException() throws Exception {
        when(planService.syncPlans(eq("user-1"), anyList()))
                .thenThrow(new RuntimeException("sync error"));

        mockMvc.perform(post("/api/plan/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"uuid\":\"u1\",\"title\":\"P1\",\"progress\":0,\"userId\":\"user-1\"}]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    private Plan createPlan(String uuid, String title, int progress, String userId) {
        Plan plan = new Plan();
        plan.setUuid(uuid);
        plan.setTitle(title);
        plan.setContent(title + " description");
        plan.setProgress(progress);
        plan.setCreatedAt("2026-05-20T10:00:00Z");
        plan.setUserId(userId);
        return plan;
    }
}
