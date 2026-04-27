package com.ddl.controller;

import common.Result;
import com.ddl.entity.Plan;
import com.ddl.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/plan")
public class PlanController {

    @Autowired
    private PlanService planService;

    @GetMapping("/restore")
    public Result restore(@RequestParam String userId) {
        return Result.success(planService.getPlansByUserId(userId));
    }

    @PostMapping("/backup")
    public Result backup(@RequestBody List<Plan> plans, @RequestParam String userId) {
        return planService.syncPlans(userId, plans) ? Result.success("备份成功") : Result.error("备份失败");
    }
}