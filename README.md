# 葩米科技组织门户

组织门户一期总仓库，包含公开门户、内容管理后台、后端接口、数据库脚本和部署配置。

## 目录

```text
frontend/   已完成的 Vue 3 + Vite 公开门户
admin/      内容管理后台
backend/    后端服务与 API
database/   数据库迁移、初始化和测试数据
deploy/     Nginx、Docker 与服务器部署配置
docs/       前端说明、API 契约与协作文档
```

## 本地运行公开门户

```bash
cd frontend
npm install
npm run dev
```

生产构建：

```bash
cd frontend
npm run build
```


## 分支约定

- `main`：正式发布版本，禁止直接开发。
- `develop`：集成测试版本。
- `feature/frontend-api`：公开门户接口接入。
- `feature/backend`：后端和数据库。
- `feature/admin`：管理后台和部署。

功能分支先合并到 `develop`，验收通过后再合并到 `main` 并发布版本标签。

## 安全约定

- 不提交 `.env`、数据库密码、JWT 密钥或服务器密钥。
- 不提交 `node_modules/`、`dist/`、上传文件和运行日志。
- 成员资料和联系方式只有在确认可公开后才能通过公开接口返回。
- 开发阶段使用明显标注的模拟数据。

## 当前状态

- [x] 公开门户静态前端
- [x] 前端说明和公开读取接口草案
- [ ] 后端及数据库
- [ ] 内容管理后台
- [ ] 前端真实接口接入
- [ ] 测试环境部署
- [ ] 正式环境部署

