// mockRepository.js — 开发阶段 Mock 数据层
// 按 v1.1 冻结的 Repository 接口实现，方法签名与赵天硕真实 Repository 完全一致
// 最终验收时只需把 import 从 './mockRepository' 改成赵天硕的真实 Repository 即可
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
