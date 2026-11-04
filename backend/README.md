# Backend（一期：公开只读 API）

一期只做**门户公开只读接口**，无登录、无管理后台、无图片上传。

## 技术栈
- Node.js + Express
- ESM（`"type": "module"`）
- Swagger（swagger-jsdoc + swagger-ui-express）
- 数据库访问层（Prisma / Repository）由 C / 赵天硕 实现，位于 `src/repositories/`

## 目录结构
```
backend/
├── src/
│   ├── index.js            # 入口
│   ├── app.js              # Express 实例、中间件、路由挂载
│   ├── common/
│   │   └── response.js      # 统一返回 {code,message,data}、错误码、BizError
│   ├── config/
│   │   └── swagger.js       # Swagger 配置
│   ├── middleware/
│   │   └── errorHandler.js # 404 + 全局异常处理
│   ├── routes/              # 路由定义（7个公开接口）
│   ├── controllers/         # 参数校验、调用 service、组装返回
│   ├── services/            # 业务逻辑，调用 repository
│   └── repositories/        # 【C 负责】数据访问层，Prisma 实现
├── .env.example
└── package.json
```

## 启动
```bash
cd backend
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```
- API 地址：http://localhost:3000/api/v1
- Swagger 文档：http://localhost:3000/api-docs

## 一期接口（全部 GET、无鉴权）
| 路径 | 说明 |
| --- | --- |
| `/api/v1/site` | 站点基础信息 |
| `/api/v1/home` | 首页内容 |
| `/api/v1/about` | 关于我们 |
| `/api/v1/business` | 业务/研究方向 |
| `/api/v1/projects` | 项目成果（分页） |
| `/api/v1/news` | 公告动态（分页） |
| `/api/v1/recruitment` | 加入我们（分页） |

## 统一返回
```json
{ "code": 0, "message": "ok", "data": {} }
```
错误码：0 成功 / 400 参数错误 / 404 不存在 / 500 服务异常。

## 当前状态
- service 层暂用 mock 数据，待 C 完成 repository 后替换为真实数据库查询。
- 契约文档见 `docs/API接口契约_v1.0.md`。
