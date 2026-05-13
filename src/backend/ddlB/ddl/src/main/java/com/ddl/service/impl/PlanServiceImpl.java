// PlanServiceImpl.java
package com.ddl.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ddl.entity.Plan;
import com.ddl.mapper.PlanMapper;
import com.ddl.service.PlanService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PlanServiceImpl extends ServiceImpl<PlanMapper, Plan> implements PlanService {
    @Override
    public List<Plan> getPlansByUserId(String userId) {
        return this.list(new LambdaQueryWrapper<Plan>().eq(Plan::getUserId, userId));
    }

    @Override
    @Transactional
    public boolean syncPlans(String userId, List<Plan> plans) {
        this.remove(new LambdaQueryWrapper<Plan>().eq(Plan::getUserId, userId));
        plans.forEach(p -> p.setUserId(userId));
        return this.saveBatch(plans);
    }
}