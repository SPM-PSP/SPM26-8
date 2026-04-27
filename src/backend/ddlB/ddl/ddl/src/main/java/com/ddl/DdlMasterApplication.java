package com.ddl;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.ddl.mapper") // 扫描 Mapper 接口所在的包
public class DdlMasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(DdlMasterApplication.class, args);
        System.out.println("====== DDL-Master 后端服务启动成功 ======");
    }
}