# 数据层交付包（一期组织门户）

分支：`feature/data-layer`　｜　范围：数据库设计、数据访问层、公共中间件、种子数据与测试

本目录是数据层分支的独立交付包，可直接合并进仓库 `backend/`、`database/`、`tests/` 与 `docs/`，不影响其他分支正在开发的前端与服务层。

---

## 1. 交付内容

| 模块 | 位置 | 说明 |
| --- | --- | --- |
| 数据模型 | `backend/prisma/schema.prisma` | 5 张表、2 个枚举，唯一事实来源 |
| 迁移脚本 | `backend/prisma/migrations/` | 可通过迁移重建数据库 |
| 兜底建表 | `database/schema.sql` | 无法运行 Prisma 时的手工 DDL |
| 数据字典 | `database/data-dictionary.md` | 字段含义、类型、约束、接口对应 |
| 种子数据 | `database/seed/mock-data.json`、`initial-data.json` | 模拟数据与正式初始数据 |
| 导入脚本 | `database/scripts/import-data.js` | 幂等 upsert，支持 `--set` 与 `--reset` |
| 数据访问层 | `backend/src/repositories/` | 7 个 Repository，工厂函数可注入客户端 |
| 公共中间件 | `backend/src/middleware/` | CORS、访问日志、参数校验、统一错误 |
| 工具函数 | `backend/src/utils/` | JSON 归一化、分页归一化、错误类型 |
| 测试 | `tests/` | 62 用例 / 17 套件，全部通过 |
| 文档 | `docs/数据库初始化及使用说明.md`、`docs/测试报告.md` | 建库导入流程与测试结论 |

---

## 2. 目录结构

```text
ceshi/
├─ backend/
│  ├─ package.json                  # Prisma 依赖与 db:seed / db:reset 脚本
│  ├─ .env.example                  # DATABASE_URL、CORS_ORIGIN 示例
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  │     ├─ migration_lock.toml
│  │     └─ 20261104000000_init/migration.sql
│  └─ src/
│     ├─ prisma/client.js           # Prisma 客户端单例
│     ├─ repositories/              # 数据访问层
│     ├─ middleware/                # 公共中间件
│     └─ utils/                     # 归一化与错误处理
├─ database/
│  ├─ schema.sql
│  ├─ data-dictionary.md
│  ├─ README.md
│  ├─ scripts/import-data.js
│  └─ seed/{mock-data.json,initial-data.json}
├─ docs/
│  ├─ 数据库初始化及使用说明.md
│  └─ 测试报告.md
├─ tests/
│  ├─ repositories.test.js
│  ├─ middleware.test.js
│  ├─ seed-data.test.js
│  ├─ schema-consistency.test.js
│  └─ helpers/fake-db.js
└─ package.json                     # npm test（node --test）
```

---

## 3. 快速开始

```bash
# 1. 安装依赖
cd backend
npm install

# 2. 配置环境变量
cp .env.example .env      # 填入本地 MySQL 账号密码

# 3. 建表
npx prisma generate
npx prisma migrate deploy

# 4. 导入模拟数据（开发联调用）
node ../database/scripts/import-data.js --set=mock --reset

# 5. 运行测试
cd ..
npm test
```

正式上线数据改用 `--set=initial`。完整流程见 `docs/数据库初始化及使用说明.md`。

---

## 4. 合并到仓库的路径映射

| 本包路径 | 合并目标 |
| --- | --- |
| `backend/prisma/` | `backend/prisma/` |
| `backend/src/repositories/` | `backend/src/repositories/` |
| `backend/src/middleware/` | `backend/src/middleware/` |
| `backend/src/prisma/client.js` | `backend/src/prisma/client.js` |
| `backend/src/utils/` | `backend/src/utils/` |
| `database/` | `database/` |
| `tests/` | `tests/` |
| `docs/数据库初始化及使用说明.md` | `docs/` |

合并时只需在 `backend/package.json` 补充 `prisma`、`@prisma/client` 依赖与 `db:seed:*` 脚本，无其他耦合改动。

---

## 5. 数据访问层交接

所有 Repository 通过 `createXRepository(db)` 创建，默认实例在 `backend/src/repositories/index.js` 使用共享 Prisma 客户端，服务层直接引入即可：

| Repository 方法 | 对应接口 | 返回 |
| --- | --- | --- |
| `siteRepository.getSite()` | `GET /api/v1/site` | 站点信息；无配置返回 `null` |
| `homeRepository.getHome()` | `GET /api/v1/home` | `{ hero, statement }` |
| `aboutRepository.getAbout()` | `GET /api/v1/about` | 使命、文化、准则、协作、团队、路径、地点 |
| `aboutRepository.getTeam()` | `GET /api/v1/about/team` | `{ items }`（仅职能） |
| `businessRepository.getBusiness()` | `GET /api/v1/business` | `{ items, cooperation }` |
| `postRepository.getNews({ page, pageSize })` | `GET /api/v1/news` | 分页列表，仅 `published` |
| `postRepository.getProjects()` | `GET /api/v1/projects` | 空栏目时返回 `preparing` |
| `postRepository.getRecruitment({ page, pageSize })` | `GET /api/v1/recruitment` | 空栏目时返回 `preparing` |

中间件接入顺序：

```js
app.use(createCommonMiddleware())   // CORS + 访问日志
app.use(express.json())
app.use('/api/v1', routes)
app.use(notFoundHandler)
app.use(errorHandler())
```

参数校验结果统一放在 `req.validated.query/params/body`，不要直接读取 `req.query` 的字符串值。

---

## 6. 一期边界

- 只做公开只读接口，无登录、无后台、无上传。
- 不建成员表、管理员表，不导入成员个人资料与联系方式。
- 不导入银行账户、开户行等财务信息。
- 公开接口只返回 `status = 'published'` 的内容。
- 数据库不存图片二进制，图片路径字段仅预留且不对外返回。

---

## 7. 待确认事项

| 事项 | 现状 | 需要确认 |
| --- | --- | --- |
| 联系邮箱 | 正式数据 `contact_email` 为空 | 确认可公开邮箱后再填 |
| 团队介绍 | 仅有整体职能说明 | 是否需要补充职能人数 |
| 文章栏目 | 正式数据 `posts: []` | 公告/成果/招聘首发内容由内容负责人提供 |
| 迁移执行 | 本机无 MySQL，未跑真实迁移 | 联调环境补跑 `migrate deploy` 与导入脚本 |

测试执行情况与未执行项详见 `docs/测试报告.md`。
