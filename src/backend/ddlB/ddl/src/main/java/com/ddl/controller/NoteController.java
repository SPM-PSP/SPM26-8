package com.ddl.controller;

import common.Result;
import com.ddl.entity.Note;
import com.ddl.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/note")
public class NoteController {

    @Autowired
    private NoteService noteService;

    /**
     * 对应前端 dataRestore 逻辑：获取备份
     */
    @GetMapping("/restore")
    public Result restore(@RequestParam String userId) {
        List<Note> notes = noteService.getNotesByUserId(userId);
        return Result.success(notes);
    }

    /**
     * 对应前端 dataBackUp 逻辑：提交备份
     */
    @PostMapping("/backup")
    public Result backup(@RequestBody List<Note> notes, @RequestParam String userId) {
        boolean success = noteService.syncNotes(userId, notes);
        if (success) {
            return Result.success("备份成功");
        }
        return Result.error("备份失败");
    }

    /**
     * 单个笔记的增删改查（为以后实时同步预留）
     */
    @PostMapping("/save")
    public Result save(@RequestBody Note note) {
        noteService.saveOrUpdate(note);
        return Result.success(note);
    }
}