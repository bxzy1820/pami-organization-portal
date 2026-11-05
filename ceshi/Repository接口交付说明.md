# Repository 真实实现交付说明

> 对照后端冻结的 `mockRepository.js`（v1.1 接口）：7 个函数签名保持兼容，
> **返回字段名以 `docs/API接口契约_v1.0.md` 为准**（本次已修正：列表接口 `list/size` 命名、
> 元素字段 `id/title/summary/content/publishedAt`）。服务层把 import 从 mock 切到真实实现即可，业务代码零改动。

---

## 1. 接口对照表（契约字段名）

| # | 函数签名 | 数据来源表 | 返回结构（与 API 契约一致） |
| --- | --- | --- | --- |
| 1 | `getSite()` | `site_settings` + `external_links` | `{ orgName, orgShortName, intro, mission, teamIntro, contact: { email, address }, externalLinks: [{ name, url }] }`（契约 §3.1） |
| 2 | `getHome()` | `site_settings` + `business_directions` | `{ orgName, slogan, briefIntro, directions: [{ title, desc }] }`（契约 §3.2） |
| 3 | `getAbout()` | `site_settings` | `{ intro, mission, teamIntro, contact: { email, address } }`（契约 §3.3） |
| 4 | `getBusiness()` | `business_directions` | `{ list: [{ title, desc }] }`（契约 §3.4） |
| 5 | `getProjects(page, size)` | `posts`（type=achievement，status=published） | `{ list, total, page, size }`（契约 §3.5） |
| 6 | `getNews(page, size)` | `posts`（type=announcement，status=published） | `{ list, total, page, size }`（契约 §3.6） |
| 7 | `getRecruitment(page, size)` | `posts`（type=recruitment，status=published） | `{ list, total, page, size }`（契约 §3.7） |

**列表元素结构**（三个列表接口一致，契约 §3.5 字段表）：

```js
{
  id: 1,                          // Integer，前端列表 key
  title: '公告标题',               // String，非空
  summary: '摘要',                 // String，可空字符串
  content: '正文',                 // String，可空字符串
  publishedAt: '2026-11-03 10:00:00'  // String，格式 YYYY-MM-DD HH:mm:ss
}
```

**分页约定**（契约 §3.5）：`page` 默认 1、最小 1；`size` 默认 10、最大 50。越界/非法入参在 Repository 内钳制，不抛错。

**置顶说明**：公告 `is_pinned` 仅用于排序（置顶优先展示），契约响应字段中没有该字段，因此不输出。

---

## 2. 真实实现代码

文件位置：`ceshi/backend/src/repository.js`（完整代码如下，可直接复制进仓库 `backend/src/`）。

```js
// 数据访问层 —— 冻结接口（v1.1）
// 本文件是服务层唯一的 Repository 引入点，函数签名与后端冻结的 mockRepository.js
// 兼容，返回字段名与 API 契约 v1.0 一致。所有查询在数据库侧完成过滤、排序与分页。

import { parseText, formatDateTime } from './utils/json.js'
import { normalizePagination } from './utils/pagination.js'

// ============================================================
// 排序规则（数据层完成，不允许内存排序）
// ============================================================

const ORDER_BY = Object.freeze({
  announcement: [
    { isPinned: 'desc' },
    { publishedAt: 'desc' },
    { sortOrder: 'asc' },
    { id: 'desc' }
  ],
  achievement: [
    { sortOrder: 'asc' },
    { publishedAt: 'desc' },
    { id: 'desc' }
  ],
  recruitment: [
    { sortOrder: 'asc' },
    { publishedAt: 'desc' },
    { id: 'desc' }
  ]
})

// ============================================================
// 内部工具
// ============================================================

// 动态懒加载 Prisma 单例——测试注入 fake-db 时永远不会进入这里。
async function pickDb(db) {
  if (db) return db
  const mod = await import('./prisma/client.js')
  return mod.getPrisma()
}

function buildContact(site) {
  return {
    email: site.contactEmail || '',
    address: site.address || ''
  }
}

function pickMissionText(missionJson) {
  if (!missionJson) return ''
  if (typeof missionJson === 'string') {
    try { missionJson = JSON.parse(missionJson) } catch { return missionJson }
  }
  if (missionJson && typeof missionJson === 'object') {
    if (typeof missionJson.text === 'string') return missionJson.text
    if (Array.isArray(missionJson.lines)) return missionJson.lines.join('')
  }
  return ''
}

function pickTeamIntro(teamJson) {
  if (!teamJson) return ''
  if (typeof teamJson === 'string') {
    try { teamJson = JSON.parse(teamJson) } catch { return teamJson }
  }
  if (teamJson && typeof teamJson === 'object' && typeof teamJson.intro === 'string') {
    return teamJson.intro
  }
  return ''
}

function pickBriefIntro(statementJson, siteIntro) {
  const fromStmt = parseText(statementJson, 'text')
  if (fromStmt) return fromStmt
  return siteIntro || ''
}

// 契约列表元素公共映射：{ id, title, summary, content, publishedAt }
function toPostItem(row) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary || '',
    content: row.content || '',
    publishedAt: formatDateTime(row.publishedAt)
  }
}

// ============================================================
// Repository 接口（v1.1 冻结签名，返回字段按契约）
// ============================================================

/** 获取站点基础信息。对应表：site_settings + external_links（契约 §3.1） */
export async function getSite(db) {
  const prisma = await pickDb(db)
  const site = await prisma.siteSetting.findUnique({ where: { id: 1 } })

  if (!site) return null

  const links = await prisma.externalLink.findMany({
    where: { isActive: true },
    orderBy: [{ primary: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
    select: { name: true, url: true }
  })

  return {
    orgName: site.name,
    orgShortName: site.shortName || '',
    intro: site.intro || '',
    mission: pickMissionText(site.mission),
    teamIntro: pickTeamIntro(site.team),
    contact: buildContact(site),
    externalLinks: links
  }
}

/** 获取首页内容。对应表：site_settings + business_directions（契约 §3.2） */
export async function getHome(db) {
  const prisma = await pickDb(db)
  const site = await prisma.siteSetting.findUnique({ where: { id: 1 } })

  const directions = await prisma.businessDirection.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: { title: true, summary: true }
  })

  return {
    orgName: site?.name || '',
    slogan: site?.slogan || '',
    briefIntro: pickBriefIntro(site?.statement, site?.intro),
    directions: directions.map((d) => ({ title: d.title, desc: d.summary || '' }))
  }
}

/** 获取关于我们。对应表：site_settings（契约 §3.3） */
export async function getAbout(db) {
  const prisma = await pickDb(db)
  const site = await prisma.siteSetting.findUnique({ where: { id: 1 } })

  if (!site) return { intro: '', mission: '', teamIntro: '', contact: { email: '', address: '' } }

  return {
    intro: site.intro || '',
    mission: pickMissionText(site.mission),
    teamIntro: pickTeamIntro(site.team),
    contact: buildContact(site)
  }
}

/** 获取研究方向列表。对应表：business_directions（契约 §3.4） */
export async function getBusiness(db) {
  const prisma = await pickDb(db)
  const directions = await prisma.businessDirection.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: { title: true, summary: true }
  })

  return {
    list: directions.map((d) => ({ title: d.title, desc: d.summary || '' }))
  }
}

/**
 * 获取项目成果列表（分页）。posts (type=achievement, status=published)，sort_order 优先
 * 返回契约 §3.5 结构：{ list, total, page, size }
 * page/size 为可选参数，兼容 getProjects() 无参调用
 */
export async function getProjects(page = 1, size = 10, db) {
  const prisma = await pickDb(db)
  const { page: p, size: s } = normalizePagination(page, size)

  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { type: 'achievement', status: 'published' } }),
    prisma.post.findMany({
      where: { type: 'achievement', status: 'published' },
      orderBy: ORDER_BY.achievement,
      skip: (p - 1) * s,
      take: s,
      select: { id: true, title: true, summary: true, content: true, publishedAt: true }
    })
  ])

  return { list: rows.map(toPostItem), total, page: p, size: s }
}

/**
 * 获取公告动态列表（分页）。置顶优先，发布时间倒序，分页在数据库侧完成
 * 返回契约 §3.6 结构：{ list, total, page, size }
 */
export async function getNews(page = 1, size = 10, db) {
  const prisma = await pickDb(db)
  const { page: p, size: s } = normalizePagination(page, size)

  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { type: 'announcement', status: 'published' } }),
    prisma.post.findMany({
      where: { type: 'announcement', status: 'published' },
      orderBy: ORDER_BY.announcement,
      skip: (p - 1) * s,
      take: s,
      select: { id: true, title: true, summary: true, content: true, publishedAt: true }
    })
  ])

  return { list: rows.map(toPostItem), total, page: p, size: s }
}

/**
 * 获取招聘列表（分页）。sort_order 优先，发布时间倒序，分页在数据库侧完成
 * 返回契约 §3.7 结构：{ list, total, page, size }
 */
export async function getRecruitment(page = 1, size = 10, db) {
  const prisma = await pickDb(db)
  const { page: p, size: s } = normalizePagination(page, size)

  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { type: 'recruitment', status: 'published' } }),
    prisma.post.findMany({
      where: { type: 'recruitment', status: 'published' },
      orderBy: ORDER_BY.recruitment,
      skip: (p - 1) * s,
      take: s,
      select: { id: true, title: true, summary: true, content: true, publishedAt: true }
    })
  ])

  return { list: rows.map(toPostItem), total, page: p, size: s }
}
```

---

## 3. 与 mock 的差异说明（均向后兼容）

| 差异点 | mock 行为 | 真实实现 | 影响 |
| --- | --- | --- | --- |
| 列表字段命名 | `items` / `pageSize` | **`list` / `size`**（按 API 契约 §3.5–3.7 修正） | 服务层组装 `data` 时直接透传，无需改字段名 |
| 列表元素字段 | mock 一期为空数组 | `{ id, title, summary, content, publishedAt }` | 与契约字段表逐一对应；不再输出 `slug/desc/date/pinned` |
| 时间格式 | mock 无数据不涉及 | `publishedAt` 输出 `YYYY-MM-DD HH:mm:ss`（契约示例格式） | — |
| `getProjects` 参数 | `getProjects()` 无参 | `getProjects(page?, size?, db?)` | 追加可选参数，无参调用兼容；支持契约的 page/size 回显 |
| 额外可选尾参 | — | 所有函数末位可选 `db` 参数用于测试注入 | 按 mock 签名调用完全兼容 |
| 空数据行为 | 永远返回测试数据 | `getSite()` 在无站点配置时返回 `null`；`getAbout()` 返回全空字段对象 | 服务层对 `getSite()` 需保留已有的空值兜底 |
| 分页钳制 | 直接 slice | `page` 最小 1；`size` 默认 10、钳制 1–50（契约约定） | 非法入参不再产生负 offset |
| 排序 | mock 无数据不涉及 | 数据库侧 `ORDER BY`（见第 4 节） | 满足「不允许查全部后内存分页」的冻结要求 |

---

## 4. 排序与过滤规则（数据层保证）

| 接口 | 过滤条件 | 排序 |
| --- | --- | --- |
| `getProjects` | `type=achievement AND status='published'` | `sort_order ASC → published_at DESC → id DESC` |
| `getNews` | `type=announcement AND status='published'` | **`is_pinned DESC`** → `published_at DESC → sort_order ASC → id DESC` |
| `getRecruitment` | `type=recruitment AND status='published'` | `sort_order ASC → published_at DESC → id DESC` |

- `draft` / `offline` 状态的文章在任何公开接口中都不会返回。
- 公告 `is_pinned` 仅参与排序，不作为响应字段输出（契约未定义）。

---

## 5. 接入方式

```js
// 之前（开发阶段）
import { getSite, getHome, getAbout, getBusiness,
         getProjects, getNews, getRecruitment } from './mockRepository.js'

// 之后（真实数据层）——仅改这一行
import { getSite, getHome, getAbout, getBusiness,
         getProjects, getNews, getRecruitment } from '../repository.js'
```

服务层把返回值直接放进 `data` 即可满足契约的 `{ code, message, data }` 外壳，字段无需二次映射。

前置环境准备（详见 `docs/数据库初始化及使用说明.md`）：

```bash
cd backend
npm install                      # 安装 prisma / @prisma/client
cp .env.example .env             # 配置 DATABASE_URL
npx prisma generate
npx prisma migrate deploy        # 建表
node ../database/scripts/import-data.js --set=mock --reset   # 导入联调数据
```

---

## 6. 验证情况

- 单元/结构测试 **62 用例 / 16 套件全部通过**（`npm test`，Node 内置 test runner，约 140 ms）。
- 覆盖：7 个函数的返回结构断言（含契约字段名逐一比对、禁止契约外字段泄漏）、过滤条件、排序规则、分页钳制（默认 10 / 上限 50）、越界与非法参数、空状态、种子数据隐私约束、Prisma ↔ migration.sql ↔ schema.sql 三方字段一致性。
- 未执行项（需联调环境）：`prisma migrate deploy`、真实数据导入、接口联调，详见 `docs/测试报告.md`。
