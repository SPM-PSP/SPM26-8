package com.ddl.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ddl.entity.Note;
import com.ddl.mapper.NoteMapper;
import com.ddl.service.NoteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteServiceImpl extends ServiceImpl<NoteMapper, Note> implements NoteService {

    @Override
    public List<Note> getNotesByUserId(String userId) {
        return this.list(new LambdaQueryWrapper<Note>()
                .eq(Note::getUserId, userId));
    }

    @Override
    @Transactional
    public boolean syncNotes(String userId, List<Note> notes) {
        // 先删除该用户旧的备份数据，实现全量覆盖备份逻辑
        this.remove(new LambdaQueryWrapper<Note>().eq(Note::getUserId, userId));
        
        // 绑定用户ID并保存
        for (Note note : notes) {
            note.setUserId(userId);
        }
        return this.saveBatch(notes);
    }
}