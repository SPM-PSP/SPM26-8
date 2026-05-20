package com.ddl.service;
import com.baomidou.mybatisplus.extension.service.IService;
import com.ddl.entity.Target;
import java.util.List;

public interface TargetService extends IService<Target> {
    List<Target> getTargetsByUserId(String userId);
    boolean syncTargets(String userId, List<Target> targets);
}