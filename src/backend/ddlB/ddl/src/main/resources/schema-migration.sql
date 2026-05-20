-- 为已存在的 todo_task 表补充时间字段（新库已在 schema.sql 中包含，重复执行可忽略）
ALTER TABLE `todo_task` ADD COLUMN `begin_time` varchar(64) DEFAULT NULL COMMENT '开始时间 ISO8601';
ALTER TABLE `todo_task` ADD COLUMN `end_time` varchar(64) DEFAULT NULL COMMENT '结束/截止时间 ISO8601';

ALTER TABLE `user` ADD COLUMN `email` varchar(128) DEFAULT NULL COMMENT '绑定邮箱';
ALTER TABLE `user` ADD COLUMN `remind_before_24h` tinyint DEFAULT 1 COMMENT '提前24小时邮件';
ALTER TABLE `user` ADD COLUMN `remind_before_2h` tinyint DEFAULT 1 COMMENT '提前2小时邮件';

CREATE TABLE IF NOT EXISTS `todo_reminder_log` (
  `uuid` varchar(64) NOT NULL,
  `todo_id` varchar(64) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `reminder_type` varchar(8) NOT NULL COMMENT '24h或2h',
  `sent_at` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `idx_reminder_todo` (`todo_id`, `reminder_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务邮件提醒记录';

CREATE TABLE IF NOT EXISTS `ddl_app_meta` (
  `meta_key` varchar(64) NOT NULL,
  `meta_value` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`meta_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
