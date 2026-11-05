-- 组织门户一期初始化迁移（feature/data-layer）
-- 生成时间：2026-11-04
-- 数据库：MySQL 8.0+，字符集 utf8mb4

CREATE TABLE `site_settings` (
  `id` INT NOT NULL,
  `org_name` VARCHAR(200) NOT NULL,
  `short_name` VARCHAR(100) NULL,
  `brand_sub` VARCHAR(200) NULL,
  `uscc` VARCHAR(30) NULL,
  `region` VARCHAR(100) NULL,
  `park` VARCHAR(200) NULL,
  `address` VARCHAR(300) NULL,
  `address_note` VARCHAR(300) NULL,
  `slogan` VARCHAR(300) NULL,
  `intro` TEXT NULL,
  `contact_email` VARCHAR(200) NULL,
  `logo_path` VARCHAR(300) NULL,
  `hero_bg_path` VARCHAR(300) NULL,
  `hero` JSON NULL,
  `statement` JSON NULL,
  `mission` JSON NULL,
  `culture` JSON NULL,
  `values` JSON NULL,
  `collaboration` JSON NULL,
  `team` JSON NULL,
  `team_functions` JSON NULL,
  `journey` JSON NULL,
  `place` JSON NULL,
  `navigation` JSON NULL,
  `projects_section` JSON NULL,
  `recruitment_section` JSON NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `business_directions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `summary` TEXT NULL,
  `points` JSON NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `business_directions_code_key` (`code`),
  INDEX `business_directions_is_active_sort_order_idx` (`is_active`, `sort_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(200) NOT NULL,
  `type` ENUM('announcement','achievement','recruitment') NOT NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
  `title` VARCHAR(200) NOT NULL,
  `summary` TEXT NULL,
  `content` LONGTEXT NULL,
  `cover_path` VARCHAR(300) NULL,
  `published_at` DATETIME(3) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_pinned` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `posts_slug_key` (`slug`),
  INDEX `posts_type_status_published_at_idx` (`type`, `status`, `published_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `external_links` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `desc` VARCHAR(500) NULL,
  `primary` BOOLEAN NOT NULL DEFAULT false,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `external_links_name_key` (`name`),
  INDEX `external_links_is_active_sort_order_idx` (`is_active`, `sort_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `media_files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `path` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `size` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `media_files_path_key` (`path`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
