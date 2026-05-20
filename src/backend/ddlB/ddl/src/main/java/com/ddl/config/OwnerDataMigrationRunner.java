package com.ddl.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 一次性将库中已有任务/目标/计划/笔记归属到主账号 wch13819780501
 */
@Component
public class OwnerDataMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OwnerDataMigrationRunner.class);
    public static final String OWNER_OPENID = "wch13819780501";
    private static final String META_KEY = "owner_wch_migrated";

    private final JdbcTemplate jdbcTemplate;

    public OwnerDataMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS `ddl_app_meta` ("
                            + "`meta_key` varchar(64) NOT NULL,"
                            + "`meta_value` varchar(64) DEFAULT NULL,"
                            + "PRIMARY KEY (`meta_key`)"
                            + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
            );
            Integer done = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM ddl_app_meta WHERE meta_key = ? AND meta_value = '1'",
                    Integer.class,
                    META_KEY
            );
            if (done != null && done > 0) {
                return;
            }

            int todos = jdbcTemplate.update("UPDATE todo_task SET user_id = ?", OWNER_OPENID);
            int targets = jdbcTemplate.update("UPDATE target SET user_id = ?", OWNER_OPENID);
            int plans = jdbcTemplate.update("UPDATE plan SET user_id = ?", OWNER_OPENID);
            int notes = jdbcTemplate.update("UPDATE note SET user_id = ?", OWNER_OPENID);
            try {
                jdbcTemplate.update("UPDATE todo_reminder_log SET user_id = ?", OWNER_OPENID);
            } catch (Exception ignored) {
                /* 表可能不存在 */
            }

            jdbcTemplate.update(
                    "INSERT INTO ddl_app_meta (meta_key, meta_value) VALUES (?, '1') "
                            + "ON DUPLICATE KEY UPDATE meta_value = '1'",
                    META_KEY
            );

            log.info(
                    "已将历史数据归属到 {}：todo={} target={} plan={} note={}",
                    OWNER_OPENID,
                    todos,
                    targets,
                    plans,
                    notes
            );
        } catch (Exception e) {
            log.warn("主账号数据迁移跳过或失败: {}", e.getMessage());
        }
    }
}
