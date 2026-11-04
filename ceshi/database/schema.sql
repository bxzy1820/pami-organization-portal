-- ============================================================================
-- 组织门户一期建表脚本（MySQL 8.0+）
-- 分支：feature/data-layer
--
-- 使用方式：
--   1) mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pami_portal
--        DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
--   2) mysql -u portal_user -p pami_portal < database/schema.sql
--
-- 说明：正式迁移以 backend/prisma/migrations 为准，本文件用于 DBA 手工建库
-- 或无法运行 Prisma 时的兜底建表，两者字段保持一致。
-- 一期不建 members / admins 表，不保存成员个人信息。
-- ============================================================================

SET NAMES utf8mb4;

-- 站点与组织基础信息（单行配置，固定 id = 1）
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `name` VARCHAR(120) NOT NULL COMMENT '组织全称',
  `short_name` VARCHAR(60) NOT NULL COMMENT '组织简称',
  `brand_sub` VARCHAR(120) NULL COMMENT 'Logo 副标题',
  `uscc` VARCHAR(32) NULL COMMENT '统一社会信用代码',
  `region` VARCHAR(64) NULL COMMENT '注册地',
  `park` VARCHAR(120) NULL COMMENT '所在园区',
  `address` VARCHAR(255) NULL COMMENT '办公地址',
  `address_note` VARCHAR(64) NULL COMMENT '地址补充说明',
  `slogan` VARCHAR(255) NULL COMMENT '一句话定位',
  `intro` TEXT NULL COMMENT '组织简介',
  `contact_email` VARCHAR(120) NULL COMMENT '公开联系邮箱，留空则前端不展示',
  `logo_path` VARCHAR(255) NULL COMMENT 'Logo 前端静态路径',
  `hero_bg_path` VARCHAR(255) NULL COMMENT '首页背景图前端静态路径',
  `hero` JSON NULL COMMENT '首页 Hero：{ titleLines: string[] }',
  `statement` JSON NULL COMMENT '首页陈述：{ eyebrow, lead, text }',
  `mission` JSON NULL COMMENT '使命：{ title, lines, text }',
  `culture` JSON NULL COMMENT '文化：{ title, intro, quoteLead, quoteTeam }',
  `values` JSON NULL COMMENT '行事准则：[{ title, text, points }]',
  `collaboration` JSON NULL COMMENT '协作方式：[{ title, text }]',
  `cooperation` JSON NULL COMMENT '合作流程：[{ title, text }]',
  `team` JSON NULL COMMENT '团队：{ title, intro }',
  `team_functions` JSON NULL COMMENT '团队职能：[{ id, title, text, tags }]',
  `journey` JSON NULL COMMENT '路径：{ titleLines, paragraphs }',
  `place` JSON NULL COMMENT '办公地点：{ label, value }',
  `navigation` JSON NULL COMMENT '导航：[{ label, to }]',
  `projects_section` JSON NULL COMMENT '成果栏目配置：{ title, description, empty, plans }',
  `recruitment_section` JSON NULL COMMENT '招聘栏目配置：{ title, description, empty }',
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点与组织基础信息';

-- 业务 / 研究方向
CREATE TABLE IF NOT EXISTS `business_directions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL COMMENT '英文标识，用于前端 key',
  `title` VARCHAR(160) NOT NULL COMMENT '方向标题',
  `summary` TEXT NULL COMMENT '方向说明',
  `points` JSON NULL COMMENT '关键词数组 string[]',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序，越小越靠前',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否对外展示',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_directions_code_key` (`code`),
  KEY `business_directions_is_active_sort_order_idx` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务与研究方向';

-- 公告 / 成果 / 招聘
CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL COMMENT '唯一标识',
  `type` ENUM('announcement','achievement','recruitment') NOT NULL COMMENT '文章类型',
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(500) NULL,
  `content` LONGTEXT NULL,
  `cover_path` VARCHAR(255) NULL COMMENT '封面图前端静态路径，可空',
  `tags` JSON NULL COMMENT '标签数组 string[]',
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME(3) NULL COMMENT '发布时间，仅 published 返回',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `posts_slug_key` (`slug`),
  KEY `posts_type_status_published_at_idx` (`type`, `status`, `published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告/成果/招聘';

-- 外部链接
CREATE TABLE IF NOT EXISTS `external_links` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) NULL,
  `url` VARCHAR(500) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否展示在页头',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `external_links_is_active_sort_order_idx` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='外部链接';

-- 媒体文件元数据（一期预留）
CREATE TABLE IF NOT EXISTS `media_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(200) NOT NULL,
  `path` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) NULL,
  `size_bytes` INT NULL,
  `kind` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体文件元数据（预留）';
