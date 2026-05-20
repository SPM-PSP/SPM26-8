package com.ddl.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ddl.entity.TodoTask;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TodoMapper extends BaseMapper<TodoTask> {
}