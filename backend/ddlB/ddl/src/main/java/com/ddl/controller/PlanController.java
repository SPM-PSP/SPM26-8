package com.ddl.controller;

import common.Result;
import com.ddl.entity.Plan;
import com.ddl.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 计划模块控制器 (PlanController)
 * 负责处理与“计划(Plan)”相关的前端 HTTP 请求，例如计划数据的云端备份与恢复。
 */
@RestController // 标识这是一个 REST 风格的控制器，所有方法的返回值都会自动序列化为 JSON 格式返回给前端
@RequestMapping("/api/plan") // 定义该控制器下所有接口的基础路径前缀为 /api/plan
public class PlanController {

    @Autowired // Spring 自动依赖注入，将 PlanService 层的实例注入进来，用于处理具体的业务逻辑
    private PlanService planService;

    /**
     * 恢复/获取云端计划列表数据 (GET请求)
     * * @param userId 用户的唯一标识 (通过 URL Query 参数传递，例如：/api/plan/restore?userId=123)
     * @return 统一响应对象 Result，成功时其 data 字段包含该用户的计划数据列表
     */
    @GetMapping("/restore")
    public Result restore(@RequestParam String userId) {
        // 调用 service 层的 getPlansByUserId 方法查询数据库，并将结果封装成统一格式返回
        return Result.success(planService.getPlansByUserId(userId));
    }

    /**
     * 备份/同步本地计划数据到云端 (POST请求)
     * * @param plans  前端传来的计划数据列表 (由于使用了 @RequestBody，前端需要以 JSON 数组的形式放在请求体中传递)
     * @param userId 用户的唯一标识 (通过 URL Query 参数传递)
     * @return 统一响应对象 Result，提示备份成功或失败
     */
    @PostMapping("/backup")
    public Result backup(@RequestBody List<Plan> plans, @RequestParam String userId) {
        // 调用 service 层的 syncPlans 方法执行全量同步/备份逻辑。
        // 这是一个三元运算符：如果 syncPlans 返回 true，则向前端返回“备份成功”；否则返回“备份失败”
        return planService.syncPlans(userId, plans) ? Result.success("备份成功") : Result.error("备份失败");
    }
}