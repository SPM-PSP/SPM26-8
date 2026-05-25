package com.ddl.controller;

import com.ddl.dto.LoginDTO;
import com.ddl.dto.ReminderSettingsDTO;
import com.ddl.entity.User;
import com.ddl.service.UserService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ========== POST /api/user/login/mock ==========

    @Test
    void mockLogin_ShouldReturnUser_WhenValidCredentials() throws Exception {
        when(userService.mockLogin(any(LoginDTO.class)))
                .thenReturn(createUser("uuid-1", "mock-user", "TestUser"));

        mockMvc.perform(post("/api/user/login/mock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mockId\":\"mock-user\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.uuid", is("uuid-1")))
                .andExpect(jsonPath("$.data.openid", is("mock-user")));
    }

    @Test
    void mockLogin_ShouldReturnError_WhenBodyEmpty() throws Exception {
        mockMvc.perform(post("/api/user/login/mock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void mockLogin_ShouldHandle_ServiceException() throws Exception {
        when(userService.mockLogin(any(LoginDTO.class)))
                .thenThrow(new RuntimeException("login failed"));

        mockMvc.perform(post("/api/user/login/mock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mockId\":\"mock-user\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/user/update ==========

    @Test
    void update_ShouldSucceed_WhenValidUser() throws Exception {
        User user = createUser("uuid-1", "mock-user", "NewName");
        when(userService.saveOrUpdate(user)).thenReturn(true);

        mockMvc.perform(post("/api/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void update_ShouldReturnError_WhenBodyEmpty() throws Exception {
        mockMvc.perform(post("/api/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void update_ShouldHandle_ServiceException() throws Exception {
        User user = createUser("uuid-1", "mock-user", "NewName");
        when(userService.saveOrUpdate(user))
                .thenThrow(new RuntimeException("update failed"));

        mockMvc.perform(post("/api/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== GET /api/user/list ==========

    @Test
    void listUsers_ShouldReturnAllUsers() throws Exception {
        when(userService.listAll()).thenReturn(Arrays.asList(
                createUser("uuid-1", "user-1", "Alice"),
                createUser("uuid-2", "user-2", "Bob")
        ));

        mockMvc.perform(get("/api/user/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].openid", is("user-1")))
                .andExpect(jsonPath("$.data[1].openid", is("user-2")));
    }

    @Test
    void listUsers_ShouldReturnEmpty_WhenNoUsers() throws Exception {
        when(userService.listAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/user/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void listUsers_ShouldHandle_ServiceException() throws Exception {
        when(userService.listAll())
                .thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/api/user/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== GET /api/user/profile ==========

    @Test
    void profile_ShouldReturnUser_WhenUserExists() throws Exception {
        when(userService.getByOpenid("mock-user"))
                .thenReturn(createUser("uuid-1", "mock-user", "TestUser"));

        mockMvc.perform(get("/api/user/profile").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.uuid", is("uuid-1")))
                .andExpect(jsonPath("$.data.openid", is("mock-user")));
    }

    @Test
    void profile_ShouldAutoRegister_WhenUserNotFound() throws Exception {
        when(userService.getByOpenid("new-user")).thenReturn(null);
        when(userService.mockLogin(any(LoginDTO.class)))
                .thenReturn(createUser("uuid-new", "new-user", "new-user"));

        mockMvc.perform(get("/api/user/profile").param("openid", "new-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.uuid", is("uuid-new")));
    }

    @Test
    void profile_ShouldReturnError_WhenOpenidMissing() throws Exception {
        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void profile_ShouldHandle_ServiceException() throws Exception {
        when(userService.getByOpenid("mock-user"))
                .thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/api/user/profile").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/user/reminder-settings ==========

    @Test
    void reminderSettings_ShouldSucceed_WhenValidSettings() throws Exception {
        User user = createUser("uuid-1", "mock-user", "TestUser");
        user.setEmail("test@qq.com");
        user.setIsReminderOn(1);
        user.setRemindBefore24h(1);
        user.setRemindBefore2h(1);
        when(userService.updateReminderSettings(any(ReminderSettingsDTO.class))).thenReturn(user);

        String body = "{\"openid\":\"mock-user\",\"email\":\"test@qq.com\",\"isReminderOn\":1,\"remindBefore24h\":1,\"remindBefore2h\":1}";

        mockMvc.perform(post("/api/user/reminder-settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.uuid", is("uuid-1")));
    }

    @Test
    void reminderSettings_ShouldReturnError_WhenBodyEmpty() throws Exception {
        mockMvc.perform(post("/api/user/reminder-settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void reminderSettings_ShouldHandle_ServiceException() throws Exception {
        when(userService.updateReminderSettings(any(ReminderSettingsDTO.class)))
                .thenThrow(new RuntimeException("update failed"));

        mockMvc.perform(post("/api/user/reminder-settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"openid\":\"mock-user\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    private User createUser(String uuid, String openid, String nickname) {
        User user = new User();
        user.setUuid(uuid);
        user.setOpenid(openid);
        user.setNickname(nickname);
        user.setAvatarUrl("https://example.com/avatar.png");
        user.setIsReminderOn(1);
        user.setDefaultAdvanceMinutes(30);
        return user;
    }
}
