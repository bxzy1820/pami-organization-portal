# 葩米科技 · 组织门户 API 接口文档

版本：v1.0　｜　对应前端版本：1.0.0　｜　更新日期：2026-11-01

---

## 1. 文档说明

- 当前前端为**纯静态实现**，页面内容全部来自 [`src/data/site.js`](../organization-portal/src/data/site.js)，不依赖后端即可运行。
- 本文档定义前端**期望的内容接口**，作为后端实现的契约。接口就绪后，前端只需替换数据来源，页面结构与样式无需改动。
- 所有字段名与 `site.js` 保持一致，可按字段一一对应。

> 说明：文档中的域名、路径、鉴权方式均为建议方案，可按实际部署环境调整。

---

## 2. 通用约定

### 2.1 基础信息

| 项目 | 约定 |
| --- | --- |
| Base URL | `https://api.example.com/v1`（占位，部署时替换） |
| 协议 | HTTPS |
| 数据格式 | `application/json; charset=utf-8` |
| 鉴权 | 内容接口公开只读，无需鉴权；表单提交接口使用站点令牌 |
| 字符编码 | UTF-8 |

### 2.2 请求头

```
Content-Type: application/json
Accept: application/json
X-Site-Token: <站点令牌>   // 仅写接口需要
```

### 2.3 统一响应结构

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | number | 0 表示成功，其余为错误码 |
| message | string | 提示信息 |
| data | object / array | 业务数据，失败时为 null |

### 2.4 错误码

| code | HTTP | 说明 |
| --- | --- | --- |
| 0 | 200 | 成功 |
| 40001 | 400 | 参数错误 |
| 40401 | 404 | 资源不存在 |
| 42901 | 429 | 请求过于频繁 |
| 50000 | 500 | 服务端异常 |

### 2.5 其他约定

- 时间格式：ISO 8601，如 `2026-11-01T10:00:00+08:00`
- 缓存：内容类接口建议 `Cache-Control: public, max-age=300` 并支持 `ETag`
- 分页参数：`page`（默认 1）、`pageSize`（默认 20，最大 100），返回 `{ items, total, page, pageSize }`
- 字段可空时返回 `""` 或 `[]`，不要返回 `null`，便于前端直接渲染

---

## 3. 接口清单

| 方法 | 路径 | 说明 | 对应前端位置 |
| --- | --- | --- | --- |
| GET | `/site` | 站点基础信息、导航、外链 | 页头、页脚、关于页 |
| GET | `/home` | 首页 Hero 与开篇陈述 | 首页 |
| GET | `/about` | 关于我们全部内容 | 关于我们 |
| GET | `/business` | 研究方向列表 | 研究方向 |
| GET | `/projects` | 项目成果（预留栏目） | 项目成果 |
| POST | `/contact/messages` | 联系/合作留言（预留） | 暂无页面，预留给后续 |
| GET | `/news` | 公告动态（预留） | 栏目已下线，预留 |

---

## 4. 接口详情

### 4.1 获取站点基础信息

`GET /site`

**响应示例**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "name": "雄安葩米科技有限公司",
    "shortName": "葩米科技",
    "uscc": "91133100MAE65PXG4Q",
    "region": "河北雄安新区",
    "park": "雄安新区 · 人工智能产业园",
    "address": "河北省雄安新区容城县启动区易宁大街164号创智园北区（人工智能产业园）4单元 F2-024",
    "addressNote": "自主申报",
    "slogan": "以人工智能技术，回应真实的产业问题",
    "intro": "葩米是一家注册于河北雄安新区的人工智能组织……",
    "contact": {
      "email": ""
    },
    "navigation": [
      { "label": "首页", "to": "/" },
      { "label": "关于我们", "to": "/about" },
      { "label": "研究方向", "to": "/business" },
      { "label": "项目成果", "to": "/projects" }
    ],
    "externalLinks": [
      {
        "label": "雄安新区官网",
        "desc": "雄安新区官方信息发布平台",
        "url": "https://www.xiongan.gov.cn/"
      }
    ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 组织全称 |
| shortName | string | 是 | 简称，用于 logo 与浏览器标题 |
| uscc | string | 否 | 统一社会信用代码，展示在页脚 |
| region | string | 否 | 注册地 |
| park | string | 否 | 所在园区 |
| address | string | 否 | 办公地址 |
| addressNote | string | 否 | 地址补充说明（如「自主申报」） |
| slogan | string | 否 | 一句话定位 |
| intro | string | 否 | 组织简介（长文本） |
| contact.email | string | 否 | 对外联系邮箱，为空时前端不展示 |
| navigation | array | 是 | 顶部/页脚导航，`to` 为前端路由 |
| externalLinks | array | 否 | 外部链接，`primary: true` 会出现在页头 |

---

### 4.2 获取首页内容

`GET /home`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "hero": {
      "titleLines": ["让人工智能", "在真实的产业里生长"]
    },
    "statement": {
      "eyebrow": "关于葩米",
      "lead": "葩米是一个扎根雄安新区的人工智能组织。",
      "text": "我们更关心技术能否在真实场景里长期运转，而不是停留在演示中。"
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| hero.titleLines | string[] | 打字机标语，每个元素一行，建议 2 行、单行不超过 12 字 |
| statement.eyebrow | string | 陈述段上方的小标签 |
| statement.lead | string | 陈述段首句（前端加粗显示） |
| statement.text | string | 陈述段正文 |

> 首页的栏目目录直接复用 `/site` 的 `navigation`，无需单独接口。

---

### 4.3 获取关于我们内容

`GET /about`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "mission": {
      "title": "我们的使命",
      "lines": ["让前沿技术走进场景，", "为合作伙伴创造价值。"],
      "text": "我们相信，人工智能的价值不在于演示，而在于它能否被真实业务持续使用。"
    },
    "culture": {
      "title": "我们的文化",
      "intro": "葩米科技的文化由使命、行事准则与协作方式构成……",
      "quoteLead": ["我们把「", "行事准则", "」作为对每位成员的要求。"],
      "quoteTeam": ["「", "协作方式", "」说明我们如何把事做成。"]
    },
    "values": [
      {
        "title": "技术务实",
        "text": "以真实问题为起点，用可验证的结果衡量技术价值。",
        "points": ["以真实问题为起点", "用可验证的结果衡量", "不做无法落地的演示"]
      }
    ],
    "collaboration": [
      { "title": "明确目标", "text": "每个项目开始前先对齐目标与成功标准，避免方向偏差。" }
    ],
    "team": {
      "title": "团队",
      "intro": "团队以职能协作的方式组织，覆盖从技术研究、产品实现到项目交付的全过程。"
    },
    "journey": {
      "titleLines": ["我们的", "路径"],
      "paragraphs": ["葩米科技注册于河北雄安新区，办公地点位于启动区人工智能产业园。"]
    },
    "place": {
      "label": "办公地点",
      "value": "雄安新区 · 人工智能产业园"
    }
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| mission.lines | string[] | 使命标语，2 行，前端做双渐变色 |
| culture.quoteLead / quoteTeam | string[3] | 三段式文本，中间一段为高亮关键词（渐变字），顺序不可变 |
| values | array | 行事准则，前端做轮播，建议 3-6 条 |
| values[].points | string[] | 每条准则的要点，建议 3 条 |
| collaboration | array | 协作方式，前端做折叠面板 |
| team | object | 团队标题与说明 |
| journey.paragraphs | string[] | 路径正文，建议 3-5 段 |

---

### 4.4 获取团队职能

`GET /about/team`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "research",
        "title": "算法与研究",
        "text": "负责核心技术方向的算法研究、模型实验与效果评估。",
        "tags": ["算法研究", "模型训练", "效果评测"]
      }
    ]
  }
}
```

> 当前仅展示职能，不展示个人资料。若后续需要展示成员，建议新增 `members` 字段并在前端增加卡片样式，且只在确认可公开后返回。

---

### 4.5 获取业务方向

`GET /business`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": "algorithm",
        "title": "人工智能算法与应用研发",
        "summary": "围绕实际业务场景开展算法研究与应用开发，覆盖模型构建、训练调优到部署上线的完整链路。",
        "points": ["场景化模型研发", "算法效果评测", "工程化部署"]
      }
    ],
    "cooperation": [
      { "title": "需求沟通", "text": "了解业务背景、目标与约束，明确项目边界与成功标准。" }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| items | array | 业务方向，建议 4 条，前端按顺序编号 01-04 |
| items[].points | string[] | 关键词，建议 3 个 |
| cooperation | array | 合作流程，前端做折叠面板 |

---

### 4.6 获取项目成果

`GET /projects`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "status": "preparing",
    "title": "项目与成果",
    "description": "展示已落地项目、技术成果与合作伙伴案例。",
    "empty": "项目成果正在整理中，正式内容敬请期待。",
    "plans": ["项目案例", "技术成果", "合作案例"],
    "items": []
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| status | string | `preparing`（筹备中，展示占位） / `online`（有内容） |
| plans | string[] | 栏目规划，`status=preparing` 时展示 |
| items | array | 正式内容，`status=online` 时展示，字段建议 `{ id, title, summary, cover, tags, date }` |

---

### 4.7 提交联系/合作留言（预留）

`POST /contact/messages`

```json
{
  "name": "张三",
  "company": "某某公司",
  "phone": "13800000000",
  "email": "zhangsan@example.com",
  "message": "希望就……进行沟通"
}
```

```json
{ "code": 0, "message": "ok", "data": { "id": "msg_1001" } }
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 联系人，1-30 字 |
| company | string | 否 | 公司名称，≤60 字 |
| phone / email | string | 二选一 | 至少填写一项联系方式 |
| message | string | 是 | 留言内容，10-1000 字 |

> 当前门户未开放留言表单（「联系我们」栏目已下线），该接口为后续开放时预留。

---

### 4.8 公告动态（预留）

`GET /news?page=1&pageSize=10`

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [
      { "id": "n1", "title": "标题", "summary": "摘要", "date": "2026-11-01", "cover": "" }
    ],
    "total": 0,
    "page": 1,
    "pageSize": 10
  }
}
```

> 栏目当前已下线（`/news` 会重定向到首页），接口结构保留以便恢复。

---

## 5. 前端接入方式

当前数据流：

```
src/data/site.js  →  各页面组件（直接 import）
```

接入后端后建议：

1. 新增 `src/api/index.js`，封装 `request()`：

```js
const BASE = import.meta.env.VITE_API_BASE || '/api/v1'

export async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (json.code !== 0) throw new Error(json.message)
  return json.data
}
```

2. 将页面中的静态引用改为异步获取，并补三态：

```js
const about = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    about.value = await get('/about')
  } finally {
    loading.value = false
  }
})
```

3. 环境变量：在项目根目录新建 `.env.production`

```
VITE_API_BASE=https://api.example.com/v1
```

4. 前端已预留的表现：
   - 联系方式为空字符串时不渲染对应元素（`contact.email`）
   - `projects.status` 决定显示占位还是列表
   - 导航项由 `navigation` 驱动，增删栏目无需改代码

---

## 6. 字段与前端位置对照

| 字段 | 前端位置 |
| --- | --- |
| `site.name` / `shortName` | 页头 Logo 副标题、页脚版权、浏览器标题 |
| `site.uscc` | 页脚底部 |
| `site.navigation` | 页头导航、移动端抽屉、首页栏目目录、页脚手风琴 |
| `site.externalLinks` | 页头（primary）、页脚「更多」 |
| `site.hero.titleLines` | 首页打字机标题 |
| `site.statement` | 首页开篇陈述（暂未在首页展示，可作为备用） |
| `about.mission` | 关于页「我们的使命」 |
| `about.values` | 关于页轮播卡片 |
| `about.collaboration` | 关于页折叠面板 |
| `business.items` | 业务方向列表 |
| `projects.plans` / `items` | 项目成果栏目规划 / 列表 |

---

## 7. 变更记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | 2026-11-01 | 首版，定义站点、首页、关于、业务、成果接口 |
