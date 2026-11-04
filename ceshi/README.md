# 赵天硕交付包 · 数据库 / 数据层 / 中间件 / 测试

对应《一期任务分配》§10 与《B、C 成员任务分工》C 角色。分支：`feature/data-layer`。
全部内容自包含在本文件夹，可直接复制到仓库对应目录。

## 1. 任务完成情况

| # | 任务 | 交付位置 | 状态 |
| --- | --- | --- | --- |
| 1 | 设计数据库表及字段 | [database/data-dictionary.md](database/data-dictionary.md) | 已完成 |
| 2 | 配置 MySQL 和 ORM | [backend/prisma/schema.prisma](backend/prisma/schema.prisma)、[backend/.env.example](backend/.env.example) | 已完成 |
| 3 | 建表及迁移脚本 | [backend/prisma/migrations](backend/prisma/migrations)、[database/schema.sql](database/schema.sql) | 已完成 |
| 4 | Repository 数据访问层 | [backend/src/repositories](backend/src/repositories) | 已完成 |
| 5 | 开发模拟数据 | [database/seed/mock-data.json](database/seed/mock-data.json) | 已完成 |
| 6 | 正式初始数据 + 导入脚本 | [database/seed/initial-data.json](database/seed/initial-data.json)、[database/scripts/import-data.js](database/scripts/import-data.js) | 已完成 |
| 7 | 参数校验、CORS、日志、统一错误 | [backend/src/middleware](backend/src/middleware) | 已完成 |
| 8 | 配合 B 完成接口与数据库联调 | 见「交接给李悦涵」一节 | 待联调环境执行 |
| 9 | 测试数据库操作和公开接口 | [tests](tests)、[docs/测试报告.md](docs/测试报告.md) | 单元/结构测试 62 项通过；真库集成待补跑 |
| 10 | 数据库初始化及使用说明 | [docs/数据库初始化及使用说明.md](docs/数据库初始化及使用说明.md) | 已完成 |

## 2. 目录结构

```text
ceshi/
├─ package.json                      # 测试入口（node --test）
├─ backend/
│  ├─ package.json                   # Prisma 依赖与数据库脚本
│  ├─ .env.example                   # DATABASE_URL / CORS_ORIGIN
│  ├─ prisma/
│  │  ├─ schema.prisma               # 5 张表 + 2 个枚举
│  │  └─ migrations/                 # init 迁移与 migration_lock
│  └─ src/
│     ├─ prisma/client.js            # Prisma 单例
│     ├─ repositories/               # site/home/about/business/post/external-link/media-file
│     ├─ middleware/                 # cors / logger / validate / error-handler
│     └─ utils/                      # json 归一化 / 分页 / ApiError
├─ database/
│  ├─ schema.sql                     # 手工建表兜底
│  ├─ data-dictionary.md             # 表、字段、API 映射
│  ├─ seed/                          # mock-data / initial-data
│  └─ scripts/import-data.js         # 幂等导入脚本
├─ docs/
│  ├─ 数据库初始化及使用说明.md
│  └─ 测试报告.md
└─ tests/
   ├─ repositories.test.js
   ├─ middleware.test.js
   ├─ seed-data.test.js
   └─ schema-consistency.test.js
```

## 3. 快速开始

```bash
cd backend
npm install
cp .env.example .env            # 填入本地 MySQL 密码
npx prisma generate
npx prisma migrate deploy       # 建表
node ../database/scripts/import-data.js --set=mock --reset   # 导入模拟数据
```

运行测试（不需要数据库）：

```bash
cd ..      # 回到 ceshi 根目录
npm test
```

预期：`tests 62 / pass 62 / fail 0`。

## 4. 合并到仓库

| 本交付包路径 | 仓库目标路径 |
| --- | --- |
| `backend/prisma/` | `backend/prisma/` |
| `backend/src/repositories/` | `backend/src/repositories/` |
| `backend/src/middleware/` | `backend/src/middleware/` |
| `backend/src/prisma/`、`backend/src/utils/` | `backend/src/prisma/`、`backend/src/utils/`（新增） |
| `database/` | `database/` |
| `docs/数据库初始化及使用说明.md`、`docs/测试报告.md` | `docs/` |
| `tests/`、根 `package.json` | 仓库根目录（可选，建议保留测试） |
| `backend/package.json` | **不要覆盖**，把 `scripts`、`prisma`、`dependencies` 合并进李悦涵的后端 `package.json` |

注意事项：

- 迁移目录 `backend/prisma/migrations/20261104000000_init` 必须随代码一起提交，否则他人无法重建库。
- `.env` 不提交；`schema.prisma` 中的连接串只从环境变量读取。

## 5. 交接给李悦涵（后端）

### 5.1 Repository 与接口对应

| 方法 | 接口 | 数据形状 |
| --- | --- | --- |
| `siteRepository.getSite()` | `GET /api/v1/site` | 站点信息；无配置行返回 `null` |
| `homeRepository.getHome()` | `GET /api/v1/home` | `{ hero, statement }` |
| `aboutRepository.getAbout()` | `GET /api/v1/about` | `{ mission, culture, values, collaboration, team, journey, place }` |
| `aboutRepository.getTeam()` | `GET /api/v1/about/team` | `{ items }`（仅职能） |
| `businessRepository.getBusiness()` | `GET /api/v1/business` | `{ items, cooperation }` |
| `postRepository.getNews({ page, pageSize })` | `GET /api/v1/news` | `{ items, total, page, pageSize }` |
| `postRepository.getProjects()` | `GET /api/v1/projects` | `{ status, title, description, empty, plans, items }` |
| `postRepository.getRecruitment({ page, pageSize })` | `GET /api/v1/recruitment` | `{ status, title, description, empty, items, total, page, pageSize }` |
| `externalLinkRepository.listActive()` / `getPrimary()` | 复用 `/site` | `[{ label, desc, url, primary }]` |
| `mediaFileRepository.list()` | 一期不对接 | 预留 |

### 5.2 中间件接入

```js
import { createCommonMiddleware, errorHandler, notFoundHandler } from './middleware/index.js'
import { paginationSchema, validateQuery } from './middleware/validate.js'

app.use(createCommonMiddleware())      // CORS 白名单 + JSON 访问日志
app.use(express.json())
app.use('/api/v1', routes)
app.use(notFoundHandler)
app.use(errorHandler())
```

- 校验结果统一读 `req.validated.query / params / body`。
- 抛错请使用 `ApiError.badRequest / notFound / serverError`，由 `errorHandler` 输出 `{ code, message, data: null }`。
- Repository 的分页已归一化，Service 直接透传 `page` / `pageSize` 即可。

### 5.3 接口补充字段说明

`GET /site` 在契约之外额外返回 `brandSub`（Logo 副标题），供现有前端 `BrandLogo.vue` 使用，建议同步进 API 文档。
`GET /about/team` 与 `GET /recruitment` 的字段为契约补充，需与李悦涵确认后写入 `docs/API接口文档.md`。

## 6. 一期边界

- 不建 `members`、`admins`，不保存登录信息与成员个人资料
- 不导入银行账户、开户行、账户编码等财务信息
- 不保存图片二进制；`logo_path` / `hero_bg_path` / `cover_path` 仅为预留字段，公开接口不返回
- 公告、成果、招聘不导入正式记录，由前端展示占位文案
- 不做服务器部署

## 7. 待确认 / 遗留

1. 联调环境（MySQL 8.0+）补跑迁移、导入与 7 个公开接口测试，结果追加到 [docs/测试报告.md](docs/测试报告.md) 第 5 节。
2. `projectsSection.empty`、`recruitmentSection.empty` 的正式文案待李炳涵确认后更新 `initial-data.json`。
3. 公开联系邮箱确认后填写 `contactEmail`，留空时前端不展示。
4. 若服务器 MySQL 版本低于 8.0，需确认 JSON 字段兼容方案（建议统一升级到 8.0）。
