# 数据字典 · 组织门户一期

版本：v1.0　｜　分支：`feature/data-layer`　｜　状态：与 `backend/prisma/schema.prisma` 保持一致

## 1. 表清单

| 表名 | 用途 | 一期是否对外 | 说明 |
| --- | --- | --- | --- |
| `site_settings` | 站点与组织基础信息、各栏目文案 | 是 | 单行配置，固定 `id = 1` |
| `business_directions` | 业务 / 研究方向 | 是 | 只返回 `is_active = true` |
| `posts` | 公告 / 成果 / 招聘 | 是 | 公开接口只返回 `status = 'published'` |
| `external_links` | 外部链接（Skill Hub 等） | 是 | 只返回 `is_active = true` |
| `media_files` | 媒体文件元数据 | 否（预留） | 一期图片仍由前端静态资源管理 |

一期不建 `members`、`admins`，不保存成员个人信息、登录信息和财务信息。

表之间一期没有外键关系，均为独立配置/内容表，便于后续拆分管理后台权限。

---

## 2. `site_settings`

| 字段 | 类型 | 可空 | 默认值 | 说明 | 对应接口字段 |
| --- | --- | --- | --- | --- | --- |
| `id` | INT | 否 | 1 | 主键，固定单行 | — |
| `name` | VARCHAR(120) | 否 | — | 组织全称 | `site.name` |
| `short_name` | VARCHAR(60) | 否 | — | 组织简称 | `site.shortName` |
| `brand_sub` | VARCHAR(120) | 是 | NULL | Logo 副标题 | `site.brandSub` |
| `uscc` | VARCHAR(32) | 是 | NULL | 统一社会信用代码（公开） | `site.uscc` |
| `region` | VARCHAR(64) | 是 | NULL | 注册地 | `site.region` |
| `park` | VARCHAR(120) | 是 | NULL | 所在园区 | `site.park` |
| `address` | VARCHAR(255) | 是 | NULL | 办公地址 | `site.address` |
| `address_note` | VARCHAR(64) | 是 | NULL | 地址补充说明（如「自主申报」） | `site.addressNote` |
| `slogan` | VARCHAR(255) | 是 | NULL | 一句话定位 | `site.slogan` |
| `intro` | TEXT | 是 | NULL | 组织简介 | `site.intro` |
| `contact_email` | VARCHAR(120) | 是 | NULL | 公开联系邮箱，空表示暂不公开 | `site.contact.email`（空串） |
| `logo_path` | VARCHAR(255) | 是 | NULL | Logo 静态路径，预留，公开接口不返回 | — |
| `hero_bg_path` | VARCHAR(255) | 是 | NULL | 首页背景图静态路径，预留，公开接口不返回 | — |
| `hero` | JSON | 是 | NULL | `{ "titleLines": string[] }` | `home.hero` |
| `statement` | JSON | 是 | NULL | `{ "eyebrow", "lead", "text" }` | `home.statement` |
| `mission` | JSON | 是 | NULL | `{ "title", "lines": string[], "text" }` | `about.mission` |
| `culture` | JSON | 是 | NULL | `{ "title", "intro", "quoteLead": string[3], "quoteTeam": string[3] }` | `about.culture` |
| `values` | JSON | 是 | NULL | `[{ "title", "text", "points": string[] }]` | `about.values` |
| `collaboration` | JSON | 是 | NULL | `[{ "title", "text" }]` | `about.collaboration` |
| `cooperation` | JSON | 是 | NULL | `[{ "title", "text" }]` | `business.cooperation` |
| `team` | JSON | 是 | NULL | `{ "title", "intro" }`，不含成员个人资料 | `about.team` |
| `team_functions` | JSON | 是 | NULL | `[{ "id", "title", "text", "tags": string[] }]` | `/about/team` 的 `items` |
| `journey` | JSON | 是 | NULL | `{ "titleLines": string[], "paragraphs": string[] }` | `about.journey` |
| `place` | JSON | 是 | NULL | `{ "label", "value" }` | `about.place` |
| `navigation` | JSON | 是 | NULL | `[{ "label", "to" }]` | `site.navigation` |
| `projects_section` | JSON | 是 | NULL | `{ "title", "description", "empty", "plans": string[] }` | `projects` 栏目标题与占位 |
| `recruitment_section` | JSON | 是 | NULL | `{ "title", "description", "empty" }` | `recruitment` 栏目配置 |
| `updated_at` | DATETIME(3) | 否 | 自动 | Prisma `@updatedAt` | — |

> JSON 字段约定：接口一律返回数组/对象，不返回 `null`；缺失时由 Repository 归一化为 `[]`、`""` 或默认标题。

---

## 3. `business_directions`

| 字段 | 类型 | 可空 | 默认值 | 说明 | 对应接口字段 |
| --- | --- | --- | --- | --- | --- |
| `id` | INT PK AI | 否 | 自增 | 主键 | — |
| `code` | VARCHAR(64) UNIQUE | 否 | — | 英文标识 | `business.items[].id` |
| `title` | VARCHAR(160) | 否 | — | 方向标题 | `business.items[].title` |
| `summary` | TEXT | 是 | NULL | 方向说明 | `business.items[].summary` |
| `points` | JSON | 是 | NULL | `string[]` 关键词 | `business.items[].points` |
| `sort_order` | INT | 否 | 0 | 升序排序 | 顺序 |
| `is_active` | BOOLEAN | 否 | true | 是否对外展示 | 过滤条件 |
| `created_at` | DATETIME(3) | 否 | 当前时间 | — | — |
| `updated_at` | DATETIME(3) | 否 | 自动 | — | — |

索引：`(is_active, sort_order)`。

---

## 4. `posts`

| 字段 | 类型 | 可空 | 默认值 | 说明 | 对应接口字段 |
| --- | --- | --- | --- | --- | --- |
| `id` | INT PK AI | 否 | 自增 | 主键 | `items[].id` |
| `slug` | VARCHAR(160) UNIQUE | 否 | — | 唯一标识 | — |
| `type` | ENUM(`announcement`,`achievement`,`recruitment`) | 否 | — | 文章类型 | 查询条件 |
| `title` | VARCHAR(200) | 否 | — | 标题 | `items[].title` |
| `summary` | VARCHAR(500) | 是 | NULL | 摘要 | `items[].summary` |
| `content` | LONGTEXT | 是 | NULL | 正文 | 详情接口预留 |
| `cover_path` | VARCHAR(255) | 是 | NULL | 封面静态路径，接口返回空串表示无封面 | `items[].cover` |
| `tags` | JSON | 是 | NULL | `string[]` | `items[].tags` |
| `status` | ENUM(`draft`,`published`,`offline`) | 否 | `draft` | 内容状态 | 过滤条件 |
| `published_at` | DATETIME(3) | 是 | NULL | 发布时间 | `items[].date`（YYYY-MM-DD） |
| `sort_order` | INT | 否 | 0 | 展示排序 | 排序 |
| `created_at` | DATETIME(3) | 否 | 当前时间 | — | — |
| `updated_at` | DATETIME(3) | 否 | 自动 | — | — |

索引：`(type, status, published_at)`。
公开查询统一条件：`type = ? AND status = 'published'`。

文章类型与栏目对应：

| type | 接口 | 说明 |
| --- | --- | --- |
| `announcement` | `GET /api/v1/news` | 公告动态 |
| `achievement` | `GET /api/v1/projects` | 项目成果 |
| `recruitment` | `GET /api/v1/recruitment` | 加入我们 |

---

## 5. `external_links`

| 字段 | 类型 | 可空 | 默认值 | 说明 | 对应接口字段 |
| --- | --- | --- | --- | --- | --- |
| `id` | INT PK AI | 否 | 自增 | 主键 | — |
| `label` | VARCHAR(80) | 否 | — | 链接名称 | `externalLinks[].label` |
| `description` | VARCHAR(255) | 是 | NULL | 链接说明 | `externalLinks[].desc` |
| `url` | VARCHAR(500) | 否 | — | 完整 URL | `externalLinks[].url` |
| `is_primary` | BOOLEAN | 否 | false | 是否展示在页头 | `externalLinks[].primary` |
| `sort_order` | INT | 否 | 0 | 升序排序 | 顺序 |
| `is_active` | BOOLEAN | 否 | true | 是否对外展示 | 过滤条件 |
| `created_at` | DATETIME(3) | 否 | 当前时间 | — | — |
| `updated_at` | DATETIME(3) | 否 | 自动 | — | — |

索引：`(is_active, sort_order)`。

---

## 6. `media_files`（一期预留，不对外）

| 字段 | 类型 | 可空 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | INT PK AI | 否 | 自增 | 主键 |
| `filename` | VARCHAR(200) | 否 | — | 文件名 |
| `path` | VARCHAR(255) | 否 | — | 存储路径 |
| `mime_type` | VARCHAR(120) | 是 | NULL | MIME 类型 |
| `size_bytes` | INT | 是 | NULL | 文件大小 |
| `kind` | VARCHAR(64) | 是 | NULL | 分类：logo / hero / project 等 |
| `created_at` | DATETIME(3) | 否 | 当前时间 | — |

一期不存图片二进制，图片仍由前端 `frontend/public/assets/` 管理；本表仅预留给后续文件管理。

---

## 7. 字段与页面映射（与 API 契约对照）

| 页面 | 接口 | 数据库来源 |
| --- | --- | --- |
| 页头 / 页脚 | `GET /site` | `site_settings` + `external_links` |
| 首页 | `GET /site` + `GET /home` | `site_settings`（`navigation`、`hero`、`statement`） |
| 关于我们 | `GET /about` | `site_settings`（`mission`、`culture`、`values`、`collaboration`、`team`、`journey`、`place`） |
| 团队职能 | `GET /about/team` | `site_settings.team_functions` |
| 研究方向 | `GET /business` | `business_directions` + `site_settings.cooperation` |
| 项目成果 | `GET /projects` | `posts(type=achievement,status=published)` + `projects_section` |
| 公告动态 | `GET /news` | `posts(type=announcement,status=published)` |
| 加入我们 | `GET /recruitment` | `posts(type=recruitment,status=published)` + `recruitment_section` |

## 8. 空值约定

| 场景 | 返回 | 前端表现 |
| --- | --- | --- |
| 无 `site_settings` 行 | `null` + 40401 | 首页错误态 |
| 联系邮箱为空 | `contact.email = ""` | 不渲染邮箱 |
| 无研究方向 | `items: []` | 空列表 |
| 无成果 / 公告 / 招聘 | `status: "preparing"`、`items: []` | 「内容正在整理中」 |
| 无封面 / 摘要 | `""` | 不渲染对应元素 |
| 数据库字段为 NULL（数组/对象类） | `[]` 或默认标题 | 结构稳定，不出现 null |
