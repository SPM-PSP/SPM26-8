package com.ddl.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ddl.entity.Note;
import java.util.List;

public interface NoteService extends IService<Note> {
    /**
     * 根据用户ID获取笔记列表
     */
    List<Note> getNotesByUserId(String userId);
    
    /**
     * 批量保存/更新备份数据
     */
    boolean syncNotes(String userId, List<Note> notes);
}