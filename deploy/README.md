# Deploy

部署负责人在此目录维护：

- Docker 或进程管理配置
- Nginx 配置
- HTTPS、环境变量说明
- 数据库迁移和备份步骤
- 发布与回滚说明

Vue Router 使用 History 模式，Nginx 必须将未命中的门户路由回退到 `index.html`。

## Docker Compose 部署

复制环境变量模板并填写独立密码：

```bash
cp .env.deploy.example .env.deploy
```

启动服务：

```bash
docker compose --env-file .env.deploy up -d --build
```

首次部署导入联调数据：

```bash
docker compose --env-file .env.deploy exec -T backend npm run db:reset:mock
```

正式内容确认后改用：

```bash
docker compose --env-file .env.deploy exec -T backend npm run db:reset:initial
```

默认访问地址为 `http://服务器地址:8081`。MySQL 和后端均不直接暴露公网，前端容器将 `/api/v1` 与 `/api-docs` 反向代理至后端。

查看状态和日志：

```bash
docker compose --env-file .env.deploy ps
docker compose --env-file .env.deploy logs --tail=200
```

更新版本：

```bash
git pull origin develop
docker compose --env-file .env.deploy up -d --build
```

