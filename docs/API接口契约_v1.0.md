# 葩米科技组织门户 一期 API 接口契约

> 版本：v1.0



***

## 1. 全局约定

### 1.1 基础信息



| 项    | 约定                             |
| ---- | ------------------------------ |
| 基础路径 | `http://localhost:3000/api/v1` |
| 接口格式 | JSON                           |
| 请求方式 | 全部为 GET（公开只读）                  |
| 鉴权   | 无（一期不做登录 / JWT）                |
| 编码   | UTF-8                          |
| 日期格式 | `YYYY-MM-DD HH:mm:ss`          |

### 1.2 统一响应格式（所有接口）



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {}

}
```



| 字段      | 类型                | 必填 | 说明                 |
| ------- | ----------------- | -- | ------------------ |
| code    | integer           | 是  | 业务状态码，见 §1.3       |
| message | string            | 是  | 可读提示信息             |
| data    | object/array/null | 是  | 业务数据；服务异常时为 `null` |

### 1.3 错误码



| code | 含义     | 触发场景               |
| ---- | ------ | ------------------ |
| 0    | 成功     | 请求正常返回             |
| 400  | 参数错误   | query 参数非法、缺失、格式错误 |
| 404  | 资源不存在  | 对应数据表无内容或接口地址不存在   |
| 500  | 服务内部异常 | 数据层 / 数据库调用出错      |

> 约定：
>
> `message`
>
>  对用户可读（如 “暂无公告数据”“参数 page 必须为正整数”），不返回堆栈。

### 1.4 空数据返回形式（统一约定）



| 场景                                 | data 返回                                           | 说明                           |
| ---------------------------------- | ------------------------------------------------- | ---------------------------- |
| 单对象接口（site/home/about/business）无数据 | 返回约定空结构（字段为空字符串 / 空数组），code=0                     | **已定稿**：不返回 `null`，前端直接渲染空状态 |
| 列表接口（projects/news/recruitment）无数据 | `{"list":[],"total":0,"page":1,"size":10}`，code=0 | 前端据此显示 “内容正在整理中” 空状态         |
| 服务异常                               | `null`，code=500                                   | 前端显示请求失败状态                   |

### 1.5 分页约定（仅列表接口）



* 请求 query 参数：`page`（页码，默认 1）、`size`（每页条数，默认 10，最大 50）

* 返回结构固定为 `{ list, total, page, size }`

### 1.6 图片约定（重要）



* 一期图片**全部为前端静态资源**，存放于 `frontend/public/assets/`

* 后端接口**不返回任何图片 URL / 路径**，数据库**不保存图片路径**，因此本契约所有接口**均不含图片字段**。



***

## 2. 接口总览



| # | 接口路径                  | 请求方式 | 名称        | 用途                        | 对应页面 |
| - | --------------------- | ---- | --------- | ------------------------- | ---- |
| 1 | `/api/v1/site`        | GET  | 站点基础信息    | 组织名称、简介、使命、团队介绍、联系方式、外部链接 | 首页   |
| 2 | `/api/v1/home`        | GET  | 首页内容      | 标语、首页简介、研究方向预览            | 首页   |
| 3 | `/api/v1/about`       | GET  | 关于我们      | 组织简介、使命与定位、团队整体介绍、联系方式    | 关于我们 |
| 4 | `/api/v1/business`    | GET  | 业务 / 研究方向 | 研究方向列表                    | 研究方向 |
| 5 | `/api/v1/projects`    | GET  | 项目成果      | 成果文章列表（分页）                | 项目成果 |
| 6 | `/api/v1/news`        | GET  | 公告动态      | 公告文章列表（分页）                | 公告动态 |
| 7 | `/api/v1/recruitment` | GET  | 加入我们      | 招聘文章列表（分页）                | 加入我们 |



***

## 3. 接口详细契约

### 3.1 GET `/api/v1/site` — 站点基础信息

**请求参数：无**

**成功响应示例：**



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "orgName": "葩米科技",

&#x20;   "orgShortName": "葩米",

&#x20;   "intro": "组织简介",

&#x20;   "mission": "使命与定位",

&#x20;   "teamIntro": "团队整体介绍",

&#x20;   "contact": {

&#x20;     "email": "contact@pami.com",

&#x20;     "address": "河北省保定市×××"

&#x20;   },

&#x20;   "externalLinks": \[

&#x20;     { "name": "Skill Hub", "url": "http://124.223.224.129:8080/" }

&#x20;   ]

&#x20; }

}
```

**响应字段：**



| 字段                         | 类型     | 必填 | 可空    | 说明                | 数据库字段来源          |
| -------------------------- | ------ | -- | ----- | ----------------- | ---------------- |
| data.orgName               | string | 是  | 否     | 组织全称              | `site_settings`  |
| data.orgShortName          | string | 否  | 是     | 组织简称              | `site_settings`  |
| data.intro                 | string | 是  | 可空字符串 | 组织简介              | `site_settings`  |
| data.mission               | string | 否  | 可空字符串 | 使命与定位             | `site_settings`  |
| data.teamIntro             | string | 否  | 可空字符串 | 团队整体介绍（不涉及成员个人资料） | `site_settings`  |
| data.contact.email         | string | 否  | 可空字符串 | 确认公开的组织邮箱         | `site_settings`  |
| data.contact.address       | string | 否  | 可空字符串 | 确认公开的办公地址         | `site_settings`  |
| data.externalLinks         | array  | 否  | 可空数组  | 外部链接列表            | `external_links` |
| data.externalLinks\[].name | string | 是  | 否     | 链接名称              | `external_links` |
| data.externalLinks\[].url  | string | 是  | 否     | 链接地址              | `external_links` |



***

### 3.2 GET `/api/v1/home` — 首页内容

**请求参数：无**

**成功响应示例：**



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "orgName": "葩米科技",

&#x20;   "slogan": "标语",

&#x20;   "briefIntro": "首页简介",

&#x20;   "directions": \[

&#x20;     { "title": "研究方向一", "desc": "描述" }

&#x20;   ]

&#x20; }

}
```

**响应字段：**



| 字段                       | 类型     | 必填 | 可空    | 说明      | 数据库字段来源               |
| ------------------------ | ------ | -- | ----- | ------- | --------------------- |
| data.orgName             | string | 是  | 否     | 组织全称    | `site_settings`       |
| data.slogan              | string | 否  | 可空字符串 | 使命 / 标语 | `site_settings`       |
| data.briefIntro          | string | 否  | 可空字符串 | 首页简介    | `site_settings`       |
| data.directions          | array  | 否  | 可空数组  | 研究方向预览  | `business_directions` |
| data.directions\[].title | string | 是  | 否     | 方向名称    | `business_directions` |
| data.directions\[].desc  | string | 否  | 可空字符串 | 方向描述    | `business_directions` |



***

### 3.3 GET `/api/v1/about` — 关于我们

**请求参数：无**

**成功响应示例：**



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "intro": "组织简介",

&#x20;   "mission": "使命与定位",

&#x20;   "teamIntro": "团队整体介绍",

&#x20;   "contact": {

&#x20;     "email": "contact@pami.com",

&#x20;     "address": "河北省保定市×××"

&#x20;   }

&#x20; }

}
```

**响应字段：**



| 字段                   | 类型     | 必填 | 可空    | 说明     | 数据库字段来源         |
| -------------------- | ------ | -- | ----- | ------ | --------------- |
| data.intro           | string | 是  | 可空字符串 | 组织简介   | `site_settings` |
| data.mission         | string | 否  | 可空字符串 | 使命与定位  | `site_settings` |
| data.teamIntro       | string | 否  | 可空字符串 | 团队整体介绍 | `site_settings` |
| data.contact.email   | string | 否  | 可空字符串 | 公开组织邮箱 | `site_settings` |
| data.contact.address | string | 否  | 可空字符串 | 公开办公地址 | `site_settings` |



***

### 3.4 GET `/api/v1/business` — 业务 / 研究方向

**请求参数：无**

**成功响应示例：**



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "list": \[

&#x20;     { "title": "方向一", "desc": "描述" }

&#x20;   ]

&#x20; }

}
```

**响应字段：**



| 字段                 | 类型     | 必填 | 可空    | 说明     | 数据库字段来源               |
| ------------------ | ------ | -- | ----- | ------ | --------------------- |
| data.list          | array  | 是  | 可空数组  | 研究方向列表 | `business_directions` |
| data.list\[].title | string | 是  | 否     | 方向名称   | `business_directions` |
| data.list\[].desc  | string | 否  | 可空字符串 | 方向描述   | `business_directions` |



***

### 3.5 GET `/api/v1/projects` — 项目成果（分页）

**请求参数：**



| 参数   | 位置    | 类型      | 必填 | 可空 | 说明               |
| ---- | ----- | ------- | -- | -- | ---------------- |
| page | query | integer | 否  | 是  | 页码，默认 1，最小 1     |
| size | query | integer | 否  | 是  | 每页条数，默认 10，最大 50 |

**成功响应示例：**



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "list": \[

&#x20;     {

&#x20;       "id": 1,

&#x20;       "title": "项目成果标题",

&#x20;       "summary": "摘要",

&#x20;       "content": "正文",

&#x20;       "publishedAt": "2026-11-03 10:00:00"

&#x20;     }

&#x20;   ],

&#x20;   "total": 5,

&#x20;   "page": 1,

&#x20;   "size": 10

&#x20; }

}
```

**响应字段：**



| 字段                       | 类型      | 必填 | 可空    | 说明                  | 数据库字段来源              |
| ------------------------ | ------- | -- | ----- | ------------------- | -------------------- |
| data.list                | array   | 是  | 可空数组  | 成果列表                | `posts`              |
| data.list\[].id          | integer | 是  | 否     | 文章 ID（保留，供前端唯一 key） | `posts.id`           |
| data.list\[].title       | string  | 是  | 否     | 标题                  | `posts.title`        |
| data.list\[].summary     | string  | 否  | 可空字符串 | 摘要                  | `posts.summary`      |
| data.list\[].content     | string  | 否  | 可空字符串 | 正文（一期为纯文本）          | `posts.content`      |
| data.list\[].publishedAt | string  | 是  | 否     | 发布时间                | `posts.published_at` |
| data.total               | integer | 是  | 否     | 总条数                 | 查询结果统计               |
| data.page                | integer | 是  | 否     | 当前页码                | 回显请求参数               |
| data.size                | integer | 是  | 否     | 每页条数                | 回显请求参数               |

**查询规则：** `posts` 中 `type = achievement` 且 `status = published`。



***

### 3.6 GET `/api/v1/news` — 公告动态（分页）

**请求参数：** 同 §3.5（`page`、`size`）

**成功响应示例：**



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "list": \[

&#x20;     {

&#x20;       "id": 2,

&#x20;       "title": "公告标题",

&#x20;       "summary": "摘要",

&#x20;       "content": "正文",

&#x20;       "publishedAt": "2026-11-03 10:00:00"

&#x20;     }

&#x20;   ],

&#x20;   "total": 3,

&#x20;   "page": 1,

&#x20;   "size": 10

&#x20; }

}
```

**响应字段：** 同 §3.5 的 list 结构。

**查询规则：** `posts` 中 `type = announcement` 且 `status = published`。



***

### 3.7 GET `/api/v1/recruitment` — 加入我们（分页）

**请求参数：** 同 §3.5（`page`、`size`）

**成功响应示例：**



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "list": \[

&#x20;     {

&#x20;       "id": 3,

&#x20;       "title": "岗位名称",

&#x20;       "summary": "岗位要求摘要",

&#x20;       "content": "岗位详情",

&#x20;       "publishedAt": "2026-11-03 10:00:00"

&#x20;     }

&#x20;   ],

&#x20;   "total": 2,

&#x20;   "page": 1,

&#x20;   "size": 10

&#x20; }

}
```

**响应字段：** 同 §3.5 的 list 结构。

**查询规则：** `posts` 中 `type = recruitment` 且 `status = published`。



***

## 4. 异常与空数据示例

### 4.1 参数错误（400）



```
{

&#x20; "code": 400,

&#x20; "message": "参数 page 必须为正整数",

&#x20; "data": null

}
```

### 4.2 资源不存在（404）



```
{

&#x20; "code": 404,

&#x20; "message": "暂无内容",

&#x20; "data": null

}
```

### 4.3 服务异常（500）



```
{

&#x20; "code": 500,

&#x20; "message": "服务内部异常",

&#x20; "data": null

}
```

### 4.4 列表为空（code=0，空列表）



```
{

&#x20; "code": 0,

&#x20; "message": "ok",

&#x20; "data": {

&#x20;   "list": \[],

&#x20;   "total": 0,

&#x20;   "page": 1,

&#x20;   "size": 10

&#x20; }

}
```

> 前端据 
>
> `list.length === 0`
>
>  显示 “内容正在整理中”。



***

## 5. 附录：数据字典与契约对应关系

> 本表为契约与数据库的对应摘要，供数据层与后端对齐使用，完整字段见
>
> `database/data-dictionary.md`
>
> 。



| 数据库表                  | 用途                       | 被本契约哪些接口引用                    |
| --------------------- | ------------------------ | ----------------------------- |
| `site_settings`       | 组织信息（名称、简介、使命、团队介绍、联系方式） | site / home / about           |
| `business_directions` | 业务与研究方向                  | home / business               |
| `posts`               | 文章（type 区分公告 / 成果 / 招聘）  | projects / news / recruitment |
| `external_links`      | 外部链接                     | site                          |

### 字段级映射要点



| 契约字段                                                           | 数据库字段                                          | 表                     | 备注                             |
| -------------------------------------------------------------- | ---------------------------------------------- | --------------------- | ------------------------------ |
| orgName / orgShortName / intro / mission / teamIntro / contact | 对应字段                                           | `site_settings`       | 字段名以数据字典为准                      |
| externalLinks\[].name / url                                    | name / url                                     | `external_links`      | 仅取公开链接                         |
| directions\[].title / desc                                     | title / desc                                   | `business_directions` |                                |
| list\[].id / title / summary / content / publishedAt           | id / title / summary / content / published\_at | `posts`               | 过滤 `type` 与 `status=published` |



***

## 6. 接口约定




| 约定项            | 定稿结论                              |
| -------------- | --------------------------------- |
| 单对象接口无数据       | 返回约定空结构（字段为空字符串 / 空数组），不返回 `null` |
| 列表接口是否含 `id`   | 保留 `id` 字段，供前端做唯一 key             |
| `content` 内容形式 | 一期为纯文本（text），不使用富文本 HTML；后续可扩展    |
| 分页 `size` 上限   | 默认 10，最大 50                       |

> 后续任何字段改动由后端负责人同步通知数据层与前端负责人。