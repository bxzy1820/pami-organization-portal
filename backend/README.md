# Backend

后端负责人在此目录实现：

<<<<<<< Updated upstream
- 管理员登录、密码加密和身份鉴权
- 组织信息、成员、研究方向、文章和外链管理接口
- 公开只读接口
- 图片上传及文件类型、大小限制
- 参数校验、统一错误响应和接口文档

公开接口只能返回已发布且确认可公开的数据。

=======
---

## 运行环境

| 项 | 版本 |
| --- | --- |
| Node.js | ≥ 18.x（建议 20.x LTS） |
| npm | ≥ 9.x |
| 操作系统 | Windows / macOS / Linux 均可 |

---

## 技术栈

- Node.js + Express
- ESM（`"type": "module"`）
- Swagger（swagger-ui-express，硬编码 OpenAPI 3.0 spec）
- CORS 跨域中间件
- 请求日志中间件
- 数据库访问层（Prisma / Repository）由 赵天硕 实现，位于 `src/repositories/`

---

## 目录结构

```
backend/
├── src/
│   ├── index.js            # 入口
│   ├── app.js              # Express 实例、中间件、路由挂载
│   ├── common/
│   │   └── response.js      # 统一返回 {code,message,data}、错误码、BizError
│   ├── config/
│   │   └── swagger.js       # Swagger OpenAPI 配置
│   ├── middleware/
│   │   ├── errorHandler.js  # 404 + 全局异常处理
│   │   └── logger.js        # 请求日志中间件
│   ├── routes/              # 路由定义（7个公开接口）
│   ├── controllers/         # 参数解析、调用 service、组装返回
│   ├── services/            # 业务组装层，调用 repository
│   └── repositories/        # 数据访问层
│       ├── mockRepository.js # 开发阶段 Mock 数据层
│       └── README.md         # 真实 Repository 由赵天硕实现
├── tests/                   # 接口测试（待补充）
├── .env.example             # 环境变量示例
└── package.json
```

---

## 快速启动

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

`.env` 内容一般不用改，本地开发默认即可。

### 3. 启动开发服务

```bash
npm run dev
```

启动成功后终端会显示：

```
✅ 后端已启动: http://localhost:3000
📚 Swagger 文档: http://localhost:3000/api-docs
🔌 API 前缀: /api/v1
```

---

## 访问地址

| 用途 | 地址 |
| --- | --- |
| 后端 API | http://localhost:3000/api/v1 |
| Swagger 在线文档 | http://localhost:3000/api-docs |
| 默认端口 | 3000 |

---

## 一期接口（全部 GET、无鉴权）

| 路径 | 说明 | 分页参数 |
| --- | --- | --- |
| `GET /api/v1/site` | 站点基础信息 | 无 |
| `GET /api/v1/home` | 首页内容 | 无 |
| `GET /api/v1/about` | 关于我们 | 无 |
| `GET /api/v1/business` | 业务/研究方向 | 无 |
| `GET /api/v1/projects` | 项目成果列表 | 无 |
| `GET /api/v1/news` | 公告动态列表 | `?page=1&pageSize=20` |
| `GET /api/v1/recruitment` | 招聘列表 | `?page=1&pageSize=20` |

### 分页约定（v1.1）

| 参数 | 默认值 | 最小值 | 最大值 |
| --- | --- | --- | --- |
| `page` | 1 | 1 | — |
| `pageSize` | 20 | 1 | 100 |

分页返回结构：
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

---

## 统一返回格式

所有接口统一返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

### 错误码

| code | 含义 | 触发场景 |
| --- | --- | --- |
| 0 | 成功 | 请求正常返回 |
| 400 | 参数错误 | query 参数非法、缺失、格式错误 |
| 404 | 资源不存在 | 接口地址不存在 |
| 500 | 服务内部异常 | 数据层 / 数据库调用出错 |

---

## 环境变量说明（.env）

| 变量名 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | 3000 | 后端服务端口 |
| `API_PREFIX` | /api/v1 | API 路由前缀 |
| `CORS_ORIGIN` | http://localhost:5173 | 允许跨域的前端地址 |

> ⚠️ `.env` 文件不要提交到 Git，真实数据库密码等敏感信息只写在本地 `.env` 里。

---

## 生产构建和启动

```bash
# 目前一期为开发阶段，生产启动方式同开发
npm run dev

# 后续如需 PM2 / Docker 部署，待补充
```

---

## 测试

```bash
# 待补充：自动化测试命令
# npm test
```

手动测试：启动服务后，浏览器访问上述接口地址即可验证返回。

---

## 数据库依赖

> 📌 数据库初始化说明待赵天硕交付后补充。

当前开发阶段使用 **Mock Repository**（`src/repositories/mockRepository.js`），不依赖真实数据库即可启动和联调。

正式接入时，只需将 `src/services/*.js` 中的 import 从 `mockRepository` 改为赵天硕提供的真实 Repository 路径即可。

---

## 常见启动错误

| 错误 | 原因 | 解决方法 |
| --- | --- | --- |
| `Error: Cannot find module` | 没装依赖 | 先执行 `npm install` |
| `Port 3000 is already in use` | 3000 端口被占用 | 关掉占用端口的程序，或在 `.env` 里改 `PORT` |
| 接口返回 404 | 路由路径写错 | 确认地址是 `/api/v1/xxx`，不是 `/xxx` |
| 前端跨域报错 | CORS 没配对 | 确认 `.env` 里 `CORS_ORIGIN` 是前端实际地址 |

---

## 当前状态

- ✅ 7 个公开接口全部可用
- ✅ Swagger 在线文档已配置
- ✅ Mock Repository 独立，符合 v1.1 冻结的接口签名
- ✅ CORS 跨域已配置
- ✅ 请求日志中间件已接入
- ⏳ 待接入赵天硕的真实 Repository
- ⏳ 待补充自动化测试用例
>>>>>>> Stashed changes
