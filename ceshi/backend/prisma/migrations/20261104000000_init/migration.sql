-- 组织门户一期初始化迁移（feature/data-layer）
-- 生成方式：prisma migrate（本文件与 schema.prisma 保持一致，可手工执行）

-- 站点与组织基础信息（单行配置）
CREATE TABLE `site_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `name` VARCHAR(120) NOT NULL,
  `short_name` VARCHAR(60) NOT NULL,
  `brand_sub` VARCHAR(120) NULL,
  `uscc` VARCHAR(32) NULL,
  `region` VARCHAR(64) NULL,
  `park` VARCHAR(120) NULL,
  `address` VARCHAR(255) NULL,
  `address_note` VARCHAR(64) NULL,
  `slogan` VARCHAR(255) NULL,
  `intro` TEXT NULL,
  `contact_email` VARCHAR(120) NULL,
  `logo_path` VARCHAR(255) NULL,
  `hero_bg_path` VARCHAR(255) NULL,
  `hero` JSON NULL,
  `statement` JSON NULL,
  `mission` JSON NULL,
  `culture` JSON NULL,
  `values` JSON NULL,
  `collaboration` JSON NULL,
  `cooperation` JSON NULL,
  `team` JSON NULL,
  `team_functions` JSON NULL,
  `journey` JSON NULL,
  `place` JSON NULL,
  `navigation` JSON NULL,
  `projects_section` JSON NULL,
  `recruitment_section` JSON NULL,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 业务 / 研究方向
CREATE TABLE `business_directions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `summary` TEXT NULL,
  `points` JSON NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `business_directions_code_key` (`code`),
  INDEX `business_directions_is_active_sort_order_idx` (`is_active`, `sort_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 公告 / 成果 / 招聘文章
CREATE TABLE `posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(160) NOT NULL,
  `type` ENUM('announcement', 'achievement', 'recruitment') NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `summary` VARCHAR(500) NULL,
  `content` LONGTEXT NULL,
  `cover_path` VARCHAR(255) NULL,
  `tags` JSON NULL,
  `status` ENUM('draft', 'published', 'offline') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME(3) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `posts_slug_key` (`slug`),
  INDEX `posts_type_status_published_at_idx` (`type`, `status`, `published_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 外部链接
CREATE TABLE `external_links` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `label` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) NULL,
  `url` VARCHAR(500) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT false,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `external_links_is_active_sort_order_idx` (`is_active`, `sort_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 媒体文件元数据（一期预留，不对外返回）
CREATE TABLE `media_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(200) NOT NULL,
  `path` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) NULL,
  `size_bytes` INT NULL,
  `kind` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
