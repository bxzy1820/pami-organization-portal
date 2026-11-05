# repositories（数据访问层）

本目录由数据层负责人主责，基于 Prisma 实现。service 层通过这里暴露的方法拿数据，**服务层不直接写 SQL / Prisma 查询**。

## 建议对外暴露的方法（与服务层对齐用）

| 方法 | 用途 | 返回 |
| --- | --- | --- |
| `siteRepository.getSiteInfo()` | 站点基础信息 | 单对象（字段名以后端契约为准） |
| `homeRepository.getHomeInfo()` | 首页内容 | 单对象 |
| `aboutRepository.getAboutInfo()` | 关于我们 | 单对象 |
| `businessRepository.listDirections()` | 研究方向列表 | 数组 |
| `postRepository.findPublishedByType(type, page, size)` | 按 type 分页查已发布文章 | `{ list, total }` |

## 约定
- 只返回 `status = published` 的文章，**过滤在 Repository 层做**，不把草稿数据交给 service。
- 数据库字段名和 API 契约字段名可能不同，service 层负责改名/组装，Repository 返回 ORModel 原始字段即可。
- 一期不返回图片路径。
