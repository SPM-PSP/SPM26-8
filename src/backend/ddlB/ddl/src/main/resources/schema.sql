-- 与 MyBatis-Plus 驼峰映射一致：列名使用下划线，对应 Java userId -> user_id
-- 由 Spring Boot 在启动时执行（application.yml 中 spring.sql.init.mode=always）
-- 前提：本机 MySQL 服务已启动（端口与 url 中一致）

CREATE TABLE IF NOT EXISTS `user` (
  `uuid` varchar(64) NOT NULL COMMENT '主键',
  `openid` varchar(128) NOT NULL COMMENT '微信OpenID或mockId',
  `nickname` varchar(64) DEFAULT '默认用户' COMMENT '昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像',
  `is_reminder_on` tinyint DEFAULT 1 COMMENT '1开启0关闭',
  `default_advance_minutes` int DEFAULT 30 COMMENT '默认提前提醒分钟',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uk_openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户';

CREATE TABLE IF NOT EXISTS `todo_task` (
  `uuid` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `status` tinyint DEFAULT 0 COMMENT '0未完成1已完成',
  `priority` int DEFAULT 0 COMMENT '优先级/四象限数值',
  `created_at` varchar(64) DEFAULT NULL,
  `plan_id` varchar(64) DEFAULT NULL,
  `target_id` varchar(64) DEFAULT NULL,
  `user_id` varchar(128) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `idx_todo_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日程';

CREATE TABLE IF NOT EXISTS `target` (
  `uuid` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `progress` int DEFAULT 0,
  `created_at` varchar(64) DEFAULT NULL,
  `user_id` varchar(128) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `idx_target_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='目标';

CREATE TABLE IF NOT EXISTS `plan` (
  `uuid` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `progress` int DEFAULT 0,
  `target_id` varchar(64) DEFAULT NULL,
  `created_at` varchar(64) DEFAULT NULL,
  `user_id` varchar(128) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `idx_plan_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='计划';

CREATE TABLE IF NOT EXISTS `note` (
  `uuid` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `created_at` varchar(64) DEFAULT NULL,
  `plan_id` varchar(64) DEFAULT NULL,
  `target_id` varchar(64) DEFAULT NULL,
  `user_id` varchar(128) NOT NULL,
  PRIMARY KEY (`uuid`),
  KEY `idx_note_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='备忘录';
