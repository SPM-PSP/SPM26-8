package com.ddl.controller;

import com.ddl.entity.User;
import com.ddl.service.EmailService;
import com.ddl.service.TodoReminderService;
import com.ddl.service.UserService;
import common.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ReminderControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TodoReminderService todoReminderService;

    @Mock
    private UserService userService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ReminderController reminderController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(reminderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ========== POST /api/reminder/scan ==========

    @Test
    void scan_ShouldReturnSentCount_WhenValidUser() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);
        when(todoReminderService.scanDueRemindersForUser(user)).thenReturn(3);

        mockMvc.perform(post("/api/reminder/scan").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", is(3)));
    }

    @Test
    void scan_ShouldReturnZero_WhenNoRemindersToSend() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);
        when(todoReminderService.scanDueRemindersForUser(user)).thenReturn(0);

        mockMvc.perform(post("/api/reminder/scan").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", is(0)));
    }

    @Test
    void scan_ShouldReturnError_WhenUserNotFound() throws Exception {
        when(userService.getByOpenid("ghost")).thenReturn(null);

        mockMvc.perform(post("/api/reminder/scan").param("openid", "ghost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void scan_ShouldReturnError_WhenEmailIsNull() throws Exception {
        User user = createUser("mock-user", null, 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);

        mockMvc.perform(post("/api/reminder/scan").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void scan_ShouldReturnError_WhenEmailIsBlank() throws Exception {
        User user = createUser("mock-user", "", 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);

        mockMvc.perform(post("/api/reminder/scan").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void scan_ShouldReturnError_WhenReminderOff() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 0);
        when(userService.getByOpenid("mock-user")).thenReturn(user);

        mockMvc.perform(post("/api/reminder/scan").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void scan_ShouldReturnError_WhenOpenidMissing() throws Exception {
        mockMvc.perform(post("/api/reminder/scan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void scan_ShouldReturnError_WhenIsReminderOnIsNull() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 1);
        user.setIsReminderOn(null);
        when(userService.getByOpenid("mock-user")).thenReturn(user);

        mockMvc.perform(post("/api/reminder/scan").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void scan_ShouldHandle_ServiceException() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);
        when(todoReminderService.scanDueRemindersForUser(user))
                .thenThrow(new RuntimeException("scan failed"));

        mockMvc.perform(post("/api/reminder/scan").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/reminder/test ==========

    @Test
    void testMail_ShouldSucceed_WhenUserHasEmail() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);
        when(emailService.isConfigured()).thenReturn(true);
        doNothing().when(todoReminderService).sendTestEmail(user);

        mockMvc.perform(post("/api/reminder/test").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void testMail_ShouldReturnError_WhenUserNotFound() throws Exception {
        when(userService.getByOpenid("ghost")).thenReturn(null);

        mockMvc.perform(post("/api/reminder/test").param("openid", "ghost"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void testMail_ShouldReturnError_WhenUserHasNoEmail() throws Exception {
        when(userService.getByOpenid("mock-user"))
                .thenReturn(createUser("mock-user", null, 1));

        mockMvc.perform(post("/api/reminder/test").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void testMail_ShouldReturnError_WhenEmailIsBlank() throws Exception {
        when(userService.getByOpenid("mock-user"))
                .thenReturn(createUser("mock-user", "", 1));

        mockMvc.perform(post("/api/reminder/test").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void testMail_ShouldReturnError_WhenOpenidMissing() throws Exception {
        mockMvc.perform(post("/api/reminder/test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void testMail_ShouldHandle_DemoMode() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);
        when(emailService.isConfigured()).thenReturn(false);
        doNothing().when(todoReminderService).sendTestEmail(user);

        mockMvc.perform(post("/api/reminder/test").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void testMail_ShouldReturnError_WhenSendFails() throws Exception {
        User user = createUser("mock-user", "test@qq.com", 1);
        when(userService.getByOpenid("mock-user")).thenReturn(user);
        doThrow(new RuntimeException("SMTP connection failed"))
                .when(todoReminderService).sendTestEmail(user);

        mockMvc.perform(post("/api/reminder/test").param("openid", "mock-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    private User createUser(String openid, String email, int isReminderOn) {
        User user = new User();
        user.setUuid("uuid-" + openid);
        user.setOpenid(openid);
        user.setNickname("Test User");
        user.setEmail(email);
        user.setIsReminderOn(isReminderOn);
        user.setRemindBefore24h(1);
        user.setRemindBefore2h(1);
        return user;
    }
}
