-- 组织门户一期兜底建表脚本
-- 当无法运行 Prisma CLI 时，用本脚本手工建表；schema 与 backend/prisma/schema.prisma 保持同步

CREATE TABLE IF NOT EXISTS site_settings (
  id INT NOT NULL DEFAULT 1,
  org_name VARCHAR(200) NOT NULL,
  short_name VARCHAR(100) DEFAULT NULL,
  brand_sub VARCHAR(200) DEFAULT NULL,
  uscc VARCHAR(30) DEFAULT NULL,
  region VARCHAR(100) DEFAULT NULL,
  park VARCHAR(200) DEFAULT NULL,
  address VARCHAR(300) DEFAULT NULL,
  address_note VARCHAR(300) DEFAULT NULL,
  slogan VARCHAR(300) DEFAULT NULL,
  intro TEXT,
  contact_email VARCHAR(200) DEFAULT NULL COMMENT '仅填写确认可公开的邮箱',
  logo_path VARCHAR(300) DEFAULT NULL,
  hero_bg_path VARCHAR(300) DEFAULT NULL,
  hero JSON,
  statement JSON,
  mission JSON,
  culture JSON,
  values JSON,
  collaboration JSON,
  team JSON,
  team_functions JSON,
  journey JSON,
  place JSON,
  navigation JSON,
  projects_section JSON,
  recruitment_section JSON,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_directions (
  id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL COMMENT '研究方向唯一代码，可读英文短语',
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  points JSON,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY business_directions_code_key (code),
  KEY business_directions_is_active_sort_order_idx (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
  id INT NOT NULL AUTO_INCREMENT,
  slug VARCHAR(200) NOT NULL COMMENT '唯一路径段，英文短横线',
  type ENUM('announcement','achievement','recruitment') NOT NULL,
  status ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
  title VARCHAR(200) NOT NULL,
  summary TEXT,
  content LONGTEXT,
  cover_path VARCHAR(300) DEFAULT NULL,
  published_at DATETIME(3) DEFAULT NULL COMMENT '发布时间，仅 published 返回',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '招聘等列表的排序值，越小越靠前',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE COMMENT '公告置顶，置顶优先展示',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY posts_slug_key (slug),
  KEY posts_type_status_published_at_idx (type, status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS external_links (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL,
  desc VARCHAR(500) DEFAULT NULL,
  primary BOOLEAN NOT NULL DEFAULT FALSE COMMENT '主链接（如内部平台）高亮',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY external_links_name_key (name),
  KEY external_links_is_active_sort_order_idx (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_files (
  id INT NOT NULL AUTO_INCREMENT,
  path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY media_files_path_key (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
