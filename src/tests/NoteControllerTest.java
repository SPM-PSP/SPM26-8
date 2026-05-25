package com.ddl.controller;

import com.ddl.entity.Note;
import com.ddl.service.NoteService;
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
class NoteControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private NoteService noteService;

    @InjectMocks
    private NoteController noteController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(noteController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ========== GET /api/note/restore ==========

    @Test
    void restore_ShouldReturnNotes_WhenUserExists() throws Exception {
        when(noteService.getNotesByUserId("user-1"))
                .thenReturn(Collections.singletonList(createNote("uuid-1", "Note1", "user-1")));

        mockMvc.perform(get("/api/note/restore").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].uuid", is("uuid-1")))
                .andExpect(jsonPath("$.data[0].title", is("Note1")));
    }

    @Test
    void restore_ShouldReturnEmpty_WhenUserHasNoNotes() throws Exception {
        when(noteService.getNotesByUserId("empty-user"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/note/restore").param("userId", "empty-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void restore_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(get("/api/note/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void restore_ShouldHandle_ServiceException() throws Exception {
        when(noteService.getNotesByUserId("user-1"))
                .thenThrow(new RuntimeException("DB connection lost"));

        mockMvc.perform(get("/api/note/restore").param("userId", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/note/backup ==========

    @Test
    void backup_ShouldSucceed_WhenValidData() throws Exception {
        when(noteService.syncNotes(eq("user-1"), anyList())).thenReturn(true);

        List<Note> notes = Arrays.asList(
                createNote("uuid-1", "Note1", "user-1"),
                createNote("uuid-2", "Note2", "user-1")
        );

        mockMvc.perform(post("/api/note/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notes)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)));
    }

    @Test
    void backup_ShouldFail_WhenSyncReturnsFalse() throws Exception {
        when(noteService.syncNotes(eq("user-1"), anyList())).thenReturn(false);

        mockMvc.perform(post("/api/note/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Collections.singletonList(createNote("uuid-1", "N1", "user-1")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldReturnError_WhenUserIdMissing() throws Exception {
        mockMvc.perform(post("/api/note/backup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void backup_ShouldHandle_ServiceException() throws Exception {
        when(noteService.syncNotes(eq("user-1"), anyList()))
                .thenThrow(new RuntimeException("sync error"));

        mockMvc.perform(post("/api/note/backup")
                        .param("userId", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"uuid\":\"u1\",\"title\":\"N1\",\"userId\":\"user-1\"}]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    // ========== POST /api/note/save ==========

    @Test
    void save_ShouldSucceed_WhenValidNote() throws Exception {
        Note note = createNote("uuid-1", "New Note", "user-1");
        note.setContent("Note content");
        when(noteService.saveOrUpdate(note)).thenReturn(true);

        mockMvc.perform(post("/api/note/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(note)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(200)))
                .andExpect(jsonPath("$.data.uuid", is("uuid-1")));
    }

    @Test
    void save_ShouldReturnError_WhenBodyEmpty() throws Exception {
        mockMvc.perform(post("/api/note/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    @Test
    void save_ShouldHandle_ServiceException() throws Exception {
        Note note = createNote("uuid-1", "New Note", "user-1");
        when(noteService.saveOrUpdate(note))
                .thenThrow(new RuntimeException("save error"));

        mockMvc.perform(post("/api/note/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(note)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is(500)));
    }

    private Note createNote(String uuid, String title, String userId) {
        Note note = new Note();
        note.setUuid(uuid);
        note.setTitle(title);
        note.setContent(title + " content");
        note.setCreatedAt("2026-05-20T10:00:00Z");
        note.setUserId(userId);
        return note;
    }
}
