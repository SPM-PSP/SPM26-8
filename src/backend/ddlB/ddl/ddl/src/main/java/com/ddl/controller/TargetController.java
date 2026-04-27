package com.ddl.controller;

import common.Result;
import com.ddl.entity.Target;
import com.ddl.service.TargetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/target")
public class TargetController {

    @Autowired
    private TargetService targetService;

    @GetMapping("/restore")
    public Result restore(@RequestParam String userId) {
        return Result.success(targetService.getTargetsByUserId(userId));
    }

    @PostMapping("/backup")
    public Result backup(@RequestBody List<Target> targets, @RequestParam String userId) {
        return targetService.syncTargets(userId, targets) ? Result.success("备份成功") : Result.error("备份失败");
    }
}