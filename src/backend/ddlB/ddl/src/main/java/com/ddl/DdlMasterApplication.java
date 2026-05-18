package com.ddl;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.ddl", "config", "common"})
@MapperScan("com.ddl.mapper")
@EnableScheduling
public class DdlMasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(DdlMasterApplication.class, args);
        System.out.println("====== DDL-Master 后端服务启动成功 ======");
    }
}