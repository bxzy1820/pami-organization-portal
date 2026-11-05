# Repository 接口契约（v1.1 冻结）

> 来源：后端负责人通过聊天与 `mockRepository.js` 下达的接口约定。
> 要求：数据层按这 7 个函数签名实现真实 Repository，**返回的数据结构必须与 mock 完全一致**。

---

## 1. 原始要求（聊天记录摘录）

> 这是后端冻结的 Repository 接口定义，你按这 7 个函数签名写真实 Repository，返回的数据结构要和这个 mock 一致。

附件：`mockRepository.js`（3.9K，微信传输）

> 这个做好了记得发我一份。

---

## 2. 冻结的接口签名

```js
getSite()                    // 站点基础信息
getHome()                    // 首页内容
getAbout()                   // 关于我们
getBusiness()                // 研究/业务方向列表
getProjects()                // 项目成果列表
getNews(page, pageSize)      // 公告动态（分页）
getRecruitment(page, pageSize) // 加入我们（分页）
```

全部为 `async` 函数，服务层最终只需把 import 从 `./mockRepository` 改成真实 Repository，业务代码零改动。

---

## 3. 返回数据结构

| 函数 | 返回结构 | 对应表 |
| --- | --- | --- |
| `getSite()` | `{ orgName, orgShortName, intro, mission, teamIntro, contact:{email,address}, externalLinks:[{name,url}] }` | `site_settings` + `external_links` |
| `getHome()` | `{ orgName, slogan, briefIntro, directions:[{title,desc}] }` | `site_settings` + `business_directions` |
| `getAbout()` | `{ intro, mission, teamIntro, contact:{email,address} }` | `site_settings` |
| `getBusiness()` | `{ list:[{title,desc}] }` | `business_directions` |
| `getProjects()` | `{ items, total, page, pageSize }` | `posts (type=achievement, status=published)` |
| `getNews(page,pageSize)` | `{ items, total, page, pageSize }` | `posts (type=announcement, status=published)` |
| `getRecruitment(page,pageSize)` | `{ items, total, page, pageSize }` | `posts (type=recruitment, status=published)` |

**排序与分页约定（写在接口注释里的硬性要求）**：

- `getProjects` / `getRecruitment`：`sort_order` 优先，发布时间倒序。
- `getNews`：**置顶优先**，发布时间倒序。
- 分页必须在数据层完成，**不允许查全部后内存分页**。
- 一期 mock 文章为空数组，前端显示"内容正在整理中"。

---

## 4. 参考实现（mockRepository.js 全文）

```js
// mockRepository.js — 开发阶段 Mock 数据层
// 按 v1.1 冻结的 Repository 接口实现，方法签名与真实 Repository 完全一致
// 最终验收时只需把 import 从 './mockRepository' 改成真实 Repository 即可
//
// 冻结的接口签名：
//   getSite()
//   getHome()
//   getAbout()
//   getBusiness()
//   getProjects()
//   getNews(page, pageSize)
//   getRecruitment(page, pageSize)

// ========== 模拟数据库数据 ==========

const MOCK_SITE = {
  orgName: '葩米科技',
  orgShortName: '葩米',
  intro: '【测试数据】葩米科技组织简介，正式内容待信息采集同学提供。',
  mission: '【测试数据】使命与定位。',
  teamIntro: '【测试数据】团队整体介绍（不含成员个人资料）。',
  contact: {
    email: 'contact@pami.com',
    address: '河北省保定市×××',
  },
  externalLinks: [
    { name: 'Skill Hub', url: 'http://124.223.224.129:8080/' },
  ],
};

const MOCK_HOME = {
  orgName: '葩米科技',
  slogan: '【测试数据】首页标语',
  briefIntro: '【测试数据】首页简短介绍。',
  directions: [
    { title: '研究方向一', desc: '【测试数据】方向描述' },
    { title: '研究方向二', desc: '【测试数据】方向描述' },
  ],
};

const MOCK_ABOUT = {
  intro: '【测试数据】组织简介。',
  mission: '【测试数据】使命与定位。',
  teamIntro: '【测试数据】团队整体介绍，不包含成员姓名、头像、履历等个人资料。',
  contact: {
    email: 'contact@pami.com',
    address: '河北省保定市×××',
  },
};

const MOCK_BUSINESS = [
  { title: '【测试数据】方向一', desc: '方向描述' },
  { title: '【测试数据】方向二', desc: '方向描述' },
];

// 文章表：一期 mock 为空，前端显示"内容正在整理中"
const MOCK_POSTS = {
  achievement: [],   // 项目成果
  announcement: [],  // 公告动态
  recruitment: [],   // 加入我们
};

// ========== Repository 接口实现 ==========

/**
 * 获取站点基础信息
 * 对应表：site_settings + external_links
 */
export async function getSite() {
  return { ...MOCK_SITE, externalLinks: [...MOCK_SITE.externalLinks] };
}

/**
 * 获取首页内容
 * 对应表：site_settings + business_directions
 */
export async function getHome() {
  return { ...MOCK_HOME, directions: [...MOCK_HOME.directions] };
}

/**
 * 获取关于我们
 * 对应表：site_settings
 */
export async function getAbout() {
  return { ...MOCK_ABOUT };
}

/**
 * 获取业务/研究方向列表
 * 对应表：business_directions
 */
export async function getBusiness() {
  return { list: [...MOCK_BUSINESS] };
}

/**
 * 获取项目成果列表
 * 对应表：posts (type = achievement, status = published)
 * 排序：sort_order 优先，发布时间倒序
 */
export async function getProjects() {
  const list = MOCK_POSTS.achievement;
  return {
    items: list,
    total: list.length,
    page: 1,
    pageSize: list.length || 20,
  };
}

/**
 * 获取公告动态列表（分页）
 * 对应表：posts (type = announcement, status = published)
 * 排序：置顶优先，发布时间倒序
 * 分页必须在数据层完成，不允许查全部后内存分页
 */
export async function getNews(page = 1, pageSize = 20) {
  const all = MOCK_POSTS.announcement;
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return {
    items,
    total: all.length,
    page,
    pageSize,
  };
}

/**
 * 获取招聘列表（分页）
 * 对应表：posts (type = recruitment, status = published)
 * 排序：sort_order 优先，发布时间倒序
 * 分页必须在数据层完成，不允许查全部后内存分页
 */
export async function getRecruitment(page = 1, pageSize = 20) {
  const all = MOCK_POSTS.recruitment;
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return {
    items,
    total: all.length,
    page,
    pageSize,
  };
}
```

---

## 5. 交付对照

真实实现见 [backend/src/repository.js](../backend/src/repository.js)，函数签名与返回结构逐项对齐本契约；对齐情况已由 `tests/repository.test.js` 验证（59 用例全部通过，见 [测试报告](测试报告.md)）。
