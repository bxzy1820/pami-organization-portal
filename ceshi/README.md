# 数据层交付包（一期组织门户）

分支：`feature/data-layer`　｜　范围：数据库设计、数据访问层、公共中间件、种子数据与测试

本目录为数据层交付内容，可直接合并进仓库 `backend/`、`database/`、`tests/` 与 `docs/`，不影响其他分支正在开发的前端与服务层。

## 1. 交付内容

| 模块 | 位置 | 说明 |
| --- | --- | --- |
| 数据模型 | `backend/prisma/schema.prisma` | 5 张表、2 个枚举，唯一事实来源 |
| 迁移脚本 | `backend/prisma/migrations/` | 可通过迁移重建数据库 |
| 兜底建表 | `database/schema.sql` | 无法运行 Prisma 时的手工 DDL |
| 数据字典 | `database/data-dictionary.md` | 字段含义、类型、约束、接口对应 |
| 种子数据 | `database/seed/mock-data.json`、`initial-data.json` | 模拟数据与正式初始数据 |
| 导入脚本 | `database/scripts/import-data.js` | 幂等 upsert，支持 `--set` 与 `--reset` |
| 数据访问层 | `backend/src/repository.js` | **7 个冻结接口函数**（见第 5 节） |
| 公共中间件 | `backend/src/middleware/` | CORS、访问日志、参数校验、统一错误 |
| 工具函数 | `backend/src/utils/` | JSON 归一化、分页归一化、错误类型 |
| 测试 | `tests/` | 63 用例 / 17 套件，全部通过 |
| 文档 | `docs/数据库初始化及使用说明.md`、`docs/测试报告.md` | 建库导入流程与测试结论 |

## 2. 目录结构

```text
ceshi/
├─ backend/
│  ├─ package.json
│  ├─ .env.example
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/20261104000000_init/{migration.sql, migration_lock.toml}
│  └─ src/
│     ├─ prisma/client.js
│     ├─ repository.js                 ← 服务层唯一引入点
│     ├─ middleware/{cors,logger,validate,error-handler,index}.js
│     └─ utils/{errors,json,pagination}.js
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
│  ├─ repository.test.js
│  ├─ middleware.test.js
│  ├─ seed-data.test.js
│  ├─ schema-consistency.test.js
│  └─ helpers/fake-db.js
└─ package.json
```

## 3. 快速开始

```bash
cd ceshi/backend
npm install
cp .env.example .env            # 填入本地 MySQL 账号密码
npx prisma generate
npx prisma migrate deploy
node ../database/scripts/import-data.js --set=mock --reset     # 开发联调

cd ..
npm test                        # 63/63 通过
```

正式数据改用 `--set=initial`。

## 4. 合并到仓库的路径映射

| 本包路径 | 合并目标 |
| --- | --- |
| `backend/prisma/` | `backend/prisma/` |
| `backend/src/repository.js` | `backend/src/repository.js` |
| `backend/src/middleware/` | `backend/src/middleware/`（替换现有 errorHandler.js） |
| `backend/src/prisma/client.js` | `backend/src/prisma/client.js` |
| `backend/src/utils/` | `backend/src/utils/` |
| `database/` | `database/` |
| `tests/` | `tests/` |

合并时需在 `backend/package.json` 补充 prisma 依赖与 db:seed:* 脚本，服务层把 `import { getSite, ... } from './repository.js'` 替换当前的 mock 引用即可。

## 5. 冻结的 Repository 接口

**签名与返回结构已与后端 mockRepository.js 完全对齐**，服务层直接替换 import 即可，无需改业务代码。

```js
// 服务层这样引入：
import { getSite, getHome, getAbout, getBusiness,
         getProjects, getNews, getRecruitment } from '../repository.js'
```

| 函数 | 入参 | 返回 | 说明 |
| --- | --- | --- | --- |
| `getSite()` | — | `{ orgName, orgShortName, intro, mission, teamIntro, contact:{email,address}, externalLinks:[{name,url}] }` | 站点基础信息 + 外链 |
| `getHome()` | — | `{ orgName, slogan, briefIntro, directions:[{title,desc}] }` | 首页内容 + 研究方向 |
| `getAbout()` | — | `{ intro, mission, teamIntro, contact:{email,address} }` | 关于我们（不含成员资料） |
| `getBusiness()` | — | `{ list:[{title,desc}] }` | 研究方向列表 |
| `getProjects()` | — | `{ items:[], total:0, page:1, pageSize:20 }` | 空栏目返回 preparing |
| `getNews(page, pageSize)` | 可选，默认 1/20 | `{ items:[], total, page, pageSize }` | **置顶优先** + 发布时间倒序 |
| `getRecruitment(page, pageSize)` | 可选，默认 1/20 | `{ items:[], total, page, pageSize }` | sortOrder 优先 + 发布时间倒序 |

排序规则在数据层完成，**不允许**服务层查全部后内存分页/排序。

## 6. 一期边界

- 只做公开只读接口，无登录、无后台、无上传。
- 不建成员表、管理员表，不导入成员个人资料与联系方式。
- 不导入银行账户、开户行等财务信息。
- 公开接口只返回 `status = 'published'` 的内容。
- 数据库不存图片二进制，图片路径字段仅预留且不对外返回。

## 7. 待确认事项

| 事项 | 现状 | 需要确认 |
| --- | --- | --- |
| 联系邮箱 | 正式数据 `contact_email` 为空 | 确认可公开邮箱后再填 |
| 文章栏目 | 正式数据 `posts: []` | 公告/成果/招聘首发内容由内容负责人提供 |
| 迁移执行 | 交付环境无 MySQL，未跑真实迁移 | 联调环境补跑 `migrate deploy` 与导入脚本 |

测试执行情况与未执行项详见 `docs/测试报告.md`。
