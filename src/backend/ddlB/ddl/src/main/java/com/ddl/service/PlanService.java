package com.ddl.service;
import com.baomidou.mybatisplus.extension.service.IService;
import com.ddl.entity.Plan;
import java.util.List;

public interface PlanService extends IService<Plan> {
    List<Plan> getPlansByUserId(String userId);
    boolean syncPlans(String userId, List<Plan> plans);
}