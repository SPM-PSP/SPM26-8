// TargetServiceImpl.java
package com.ddl.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ddl.entity.Target;
import com.ddl.mapper.TargetMapper;
import com.ddl.service.TargetService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TargetServiceImpl extends ServiceImpl<TargetMapper, Target> implements TargetService {
    @Override
    public List<Target> getTargetsByUserId(String userId) {
        return this.list(new LambdaQueryWrapper<Target>().eq(Target::getUserId, userId));
    }

    @Override
    @Transactional
    public boolean syncTargets(String userId, List<Target> targets) {
        this.remove(new LambdaQueryWrapper<Target>().eq(Target::getUserId, userId));
        targets.forEach(t -> t.setUserId(userId));
        return this.saveBatch(targets);
    }
}