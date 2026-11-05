# 数据字典

> 数据库：MySQL 8.0+　｜　ORM：Prisma 6　｜　Prisma schema 为唯一事实来源

## 1. 总览

| 表 | 用途 | 一期是否公开返回 | 备注 |
| --- | --- | --- | --- |
| `site_settings` | 站点基础配置（单行，id=1） | 是 | 多行 JSON 字段存结构化内容 |
| `business_directions` | 研究方向列表 | 是 | 按 `is_active, sort_order` 排序 |
| `posts` | 公告 / 成果 / 招聘 | 仅 `status=published` | 三类型同一张表 |
| `external_links` | 外部链接 | 是 | 主链接高亮 |
| `media_files` | 媒体文件元数据 | 否（预留） | 一期只存元数据 |

---

## 2. `site_settings`

唯一单行表，`id` 固定为 1。

| 字段 | 类型 | 可空 | 默认 | 说明 | 接口映射 |
| --- | --- | --- | --- | --- | --- |
| `id` | INT | 否 | 1 | 主键 | — |
| `org_name` | VARCHAR(200) | 否 | — | 注册全称 | `getSite().orgName`、`getHome().orgName` |
| `short_name` | VARCHAR(100) | 是 | NULL | 品牌简称 | `getSite().orgShortName` |
| `brand_sub` | VARCHAR(200) | 是 | NULL | 品牌副标题 | — |
| `uscc` | VARCHAR(30) | 是 | NULL | 统一社会信用代码 | 仅页脚合规展示 |
| `region` / `park` / `address` / `address_note` | VARCHAR | 是 | NULL | 地址拼接 | `getSite().contact.address` |
| `slogan` | VARCHAR(300) | 是 | NULL | 标语 | `getHome().slogan` |
| `intro` | TEXT | 是 | NULL | 组织简介 | `getSite().intro`、`getAbout().intro` |
| `contact_email` | VARCHAR(200) | 是 | NULL | 公开邮箱 | `getSite().contact.email`、`getAbout().contact.email` |
| `hero_bg_path` / `logo_path` | VARCHAR(300) | 是 | NULL | 图片路径 | **公开接口不返回** |
| `hero` / `statement` / `mission` / `culture` / `values` / `collaboration` / `team` / `team_functions` / `journey` / `place` / `navigation` / `projects_section` / `recruitment_section` | JSON | 是 | NULL | 结构化配置 | 部分供 `getHome` / `getAbout` 取文本 |
| `updated_at` | DATETIME(3) | 否 | 自动 | — | — |

---

## 3. `business_directions`

| 字段 | 类型 | 可空 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | INT | 否 | 自增 | 主键 |
| `code` | VARCHAR(64) | 否 | — | 唯一代码，如 `algorithm`、`data` |
| `title` | VARCHAR(200) | 否 | — | 方向标题 |
| `summary` | TEXT | 是 | NULL | 方向描述 → `getBusiness().list[].desc`、`getHome().directions[].desc` |
| `points` | JSON | 是 | NULL | 要点数组 |
| `is_active` | BOOLEAN | 否 | true | 是否展示 |
| `sort_order` | INT | 否 | 0 | 升序 |
| `created_at` / `updated_at` | DATETIME(3) | 否 | 自动 | — |

索引：`(is_active, sort_order)`。

---

## 4. `posts`

| 字段 | 类型 | 可空 | 默认 | 说明 | 接口映射 |
| --- | --- | --- | --- | --- | --- |
| `id` | INT | 否 | 自增 | 主键 | — |
| `slug` | VARCHAR(200) | 否 | — | 唯一 | — |
| `type` | ENUM | 否 | — | `announcement` / `achievement` / `recruitment` | — |
| `status` | ENUM | 否 | draft | `draft` / `published` / `offline` | **只返回 `published`** |
| `title` | VARCHAR(200) | 否 | — | 标题 → `items[].title` |
| `summary` | TEXT | 是 | NULL | 摘要 → `items[].desc` |
| `content` | LONGTEXT | 是 | NULL | 正文 | 预留 |
| `cover_path` | VARCHAR(300) | 是 | NULL | 封面路径 | **公开接口不返回** |
| `published_at` | DATETIME(3) | 是 | NULL | 发布时间 | — |
| `sort_order` | INT | 否 | 0 | 招聘/成果排序值 | 越小越靠前 |
| `is_pinned` | BOOLEAN | 否 | false | 公告置顶 | 置顶优先展示 |
| `created_at` / `updated_at` | DATETIME(3) | 否 | 自动 | — | — |

索引：`(type, status, published_at)`。

**排序规则**（数据层完成，不允许内存排序）：

| 类型 | 排序 |
| --- | --- |
| 公告 `announcement` | `is_pinned DESC` → `published_at DESC` → `sort_order ASC` → `id DESC` |
| 成果 `achievement` | `sort_order ASC` → `published_at DESC` → `id DESC` |
| 招聘 `recruitment` | `sort_order ASC` → `published_at DESC` → `id DESC` |

---

## 5. `external_links`

| 字段 | 类型 | 可空 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | INT | 否 | 自增 | 主键 |
| `name` | VARCHAR(200) | 否 | — | 链接名称 → `getSite().externalLinks[].name` |
| `url` | VARCHAR(500) | 否 | — | URL → `getSite().externalLinks[].url` |
| `desc` | VARCHAR(500) | 是 | NULL | 描述 |
| `primary` | BOOLEAN | 否 | false | 主链接高亮 |
| `is_active` | BOOLEAN | 否 | true | 是否展示 |
| `sort_order` | INT | 否 | 0 | 升序 |
| `created_at` | DATETIME(3) | 否 | 自动 | — |

索引：`(is_active, sort_order)`。

---

## 6. 公开接口到数据库查询的对应

| 接口 | 查询 | 说明 |
| --- | --- | --- |
| `getSite()` | `site_settings(id=1)` + `external_links(is_active=true)` | 组装 contact.address、map 字段名 |
| `getHome()` | `site_settings(id=1)` + `business_directions(is_active=true)` | 只取 slogan/briefIntro/directions |
| `getAbout()` | `site_settings(id=1)` | 只取 intro/mission/teamIntro/contact |
| `getBusiness()` | `business_directions(is_active=true)` | 按 sort_order 排序 |
| `getProjects()` | `posts(type=achievement, status=published)` | 空则返回 preparing |
| `getNews(p,ps)` | `posts(type=announcement, status=published)` | 置顶优先 + 发布时间倒序，数据库分页 |
| `getRecruitment(p,ps)` | `posts(type=recruitment, status=published)` | sortOrder 优先 + 发布时间倒序 |
