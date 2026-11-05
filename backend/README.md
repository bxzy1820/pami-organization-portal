# Backend（一期：公开只读 API）

一期只实现门户公开只读接口，不包含登录、管理后台、JWT、图片上传和公开写入接口。

## 运行环境

| 项目 | 版本 |
| --- | --- |
| Node.js | 18.x 及以上，建议 20.x LTS |
| npm | 9.x 及以上 |
| 操作系统 | Windows、macOS、Linux |

## 技术栈

- Node.js + Express
- ESM（`"type": "module"`）
- Swagger UI / OpenAPI 3.0
- CORS 和请求日志中间件
- Repository 数据访问层

## 目录结构

```text
backend/
├─ src/
│  ├─ index.js
│  ├─ app.js
│  ├─ common/
│  │  └─ response.js
│  ├─ config/
│  │  └─ swagger.js
│  ├─ middleware/
│  │  ├─ errorHandler.js
│  │  └─ logger.js
│  ├─ routes/
│  ├─ controllers/
│  ├─ services/
│  └─ repositories/
│     └─ mockRepository.js
├─ .env.example
├─ package.json
└─ package-lock.json
```

## 安装和启动

安装依赖：

```bash
cd backend
npm install
```

复制环境变量文件：

```powershell
Copy-Item .env.example .env
```

macOS 或 Linux：

```bash
cp .env.example .env
```

启动开发服务：

```bash
npm run dev
```

普通启动：

```bash
npm start
```

默认地址：

| 用途 | 地址 |
| --- | --- |
| 后端服务 | `http://localhost:3000` |
| API 前缀 | `http://localhost:3000/api/v1` |
| Swagger 文档 | `http://localhost:3000/api-docs` |

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `NODE_ENV` | `development` | 运行环境 |
| `PORT` | `3000` | 后端端口 |
| `API_PREFIX` | `/api/v1` | API 路径前缀 |
| `CORS_ORIGIN` | `http://localhost:5173` | 允许访问的前端地址 |
| `DATABASE_URL` | 示例 MySQL URL | 数据层接入后使用的数据库连接 |

真实数据库密码只允许写入本地 `.env`，不得提交到 Git。

## 公开接口

一期接口全部为 GET 请求，无需鉴权：

| 接口 | 说明 | 分页参数 |
| --- | --- | --- |
| `GET /api/v1/site` | 站点基础信息 | 无 |
| `GET /api/v1/home` | 首页内容 | 无 |
| `GET /api/v1/about` | 关于我们 | 无 |
| `GET /api/v1/business` | 业务/研究方向 | 无 |
| `GET /api/v1/projects` | 项目成果 | 无 |
| `GET /api/v1/news` | 公告动态 | `page`、`pageSize` |
| `GET /api/v1/recruitment` | 招聘信息 | `page`、`pageSize` |

分页约定：

| 参数 | 默认值 | 最小值 | 最大值 |
| --- | --- | --- | --- |
| `page` | 1 | 1 | 无 |
| `pageSize` | 20 | 1 | 100 |

分页数据结构：

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

## 统一响应

成功响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

错误码：

| code | 说明 |
| --- | --- |
| 0 | 成功 |
| 400 | 参数错误 |
| 404 | 资源或接口不存在 |
| 500 | 服务内部异常 |

## 测试

当前版本尚未配置自动化测试脚本。启动服务后可以通过 Swagger 或以下地址进行手动验证：

```text
http://localhost:3000/api/v1/site
http://localhost:3000/api/v1/home
http://localhost:3000/api/v1/about
http://localhost:3000/api/v1/business
http://localhost:3000/api/v1/projects
http://localhost:3000/api/v1/news?page=1&pageSize=20
http://localhost:3000/api/v1/recruitment?page=1&pageSize=20
```

## 数据层状态

当前使用 `src/repositories/mockRepository.js`，用于后端和前端并行开发。正式验收前需要接入真实 Repository，最终链路为：

```text
前端 → 后端 API → Service → 真实 Repository → MySQL
```

切换真实数据层时，对外接口路径、分页参数和响应结构不得变化。

## 常见问题

| 问题 | 处理方法 |
| --- | --- |
| 找不到依赖 | 在 `backend/` 执行 `npm install` |
| 3000 端口被占用 | 关闭占用进程，或修改 `.env` 中的 `PORT` |
| 接口返回 404 | 确认请求路径包含 `/api/v1` |
| 前端跨域失败 | 检查 `CORS_ORIGIN` 是否为前端实际地址 |

## 当前状态

- 7 个公开接口可用。
- Swagger 文档已配置。
- Mock Repository 已独立于 Controller 和 Service。
- CORS 和请求日志已接入。
- 分页参数为 `page`、`pageSize`。
- 待接入真实 Repository。
- 待补充自动化测试。
