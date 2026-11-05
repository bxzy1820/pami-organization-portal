# database/

| 文件 | 说明 |
| --- | --- |
| `schema.sql` | 兜底 DDL，无 Prisma 时手工建表用。与 `backend/prisma/schema.prisma` 保持同步 |
| `data-dictionary.md` | 数据字典，字段/类型/约束/接口映射 |
| `scripts/import-data.js` | 导入脚本，幂等 upsert。支持 `--set=mock|initial`、`--reset` |
| `seed/mock-data.json` | 开发联调测试数据 |
| `seed/initial-data.json` | 正式初始数据（无成员/财务信息，联系邮箱为空） |

## 使用

```bash
# 方式 A：Prisma 迁移（推荐）
cd backend
npx prisma migrate deploy
node ../database/scripts/import-data.js --set=mock

# 方式 B：直接 SQL
mysql -u portal_user -p pami_portal < schema.sql
node scripts/import-data.js --set=mock
```
