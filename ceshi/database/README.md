# Database · 数据文件与脚本说明

负责人：赵天硕（`feature/data-layer`）

```text
database/
├─ schema.sql                  # MySQL 手工建表脚本（与 Prisma 迁移一致）
├─ data-dictionary.md          # 数据字典：表、字段、类型、API 映射
├─ seed/
│  ├─ mock-data.json           # 开发联调模拟数据（全部标注为测试内容）
│  └─ initial-data.json        # 正式初始数据（组织公开信息，无成员资料）
└─ scripts/
   └─ import-data.js           # 数据导入脚本（Prisma upsert）
```

## 两条建库路径

1. 推荐：`backend` 目录执行 `npx prisma migrate deploy`，由 `backend/prisma/migrations` 建表。
2. 兜底：MySQL 直接执行 `database/schema.sql`。

两条路径的字段完全一致，不要同时使用后手工改表以免结构漂移。

## 导入数据

```bash
cd backend
node ../database/scripts/import-data.js --set=mock --reset      # 开发/联调
node ../database/scripts/import-data.js --set=initial --reset   # 正式初始数据
```

约定了幂等行为：`site_settings` 固定 id = 1，`business_directions` 按 `code`、`posts` 按 `slug` upsert，
`external_links` 每次先清空再写入。

## 一期不做的内容

- 不建 `members`、`admins` 表，不导入成员姓名、头像、履历和个人联系方式
- 不导入银行账户、开户行、账户编码等财务信息
- 公告、成果、招聘暂不导入正式记录，`initial-data.json` 中 `posts` 保持空数组
- 图片不进入数据库：`logo_path` / `hero_bg_path` / `cover_path` 只是前端静态路径的预留字段，
  公开接口不返回，一期图片仍由前端 `frontend/public/assets/` 管理
