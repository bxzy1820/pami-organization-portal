import { reactive, ref } from 'vue'
import { portalApi } from '@/api/client'

/**
 * 站点内容配置
 * ---------------------------------------------------------------------------
 * 门户所有对外文案、链接、联系方式均集中维护在本文件，页面不硬编码内容。
 *
 * 维护约定：
 * 1. 标注「待确认」的字段为初版占位内容，上线前请替换为组织确认过的表述；
 * 2. 成员资料、电话、邮箱等信息仅在确认可公开后填写，留空时页面会自动隐藏；
 * 3. 银行账户、开户行、账户编码等财务信息不对外公示，请勿加入本文件。
 * ---------------------------------------------------------------------------
 */

export const site = reactive({
  /* 注册全称仅用于页脚权属信息与合规展示 */
  name: "AnySome组织门户",
  shortName: "葩米科技",
  brandSub: "共创空间，数字生态",
  region: "河北保定",
  park: "河北大学",
  address: "河北省保定市莲池区河北大学",
  addressNote: "保定市莲池区",

  /* 待确认：仅填写已确认可对外公开的联系邮箱，留空则不展示 */
  contact: {
    email: "",
  },

  slogan: "汇聚创新力量，共建组织未来",

  /* 首页 Hero */
  hero: {
    titleLines: ["汇聚创新力量", "共建数字生态组织"],
  },

  /* 首页开篇陈述：lead 加粗，text 常规 */
  statement: {
    eyebrow: "关于我们",
    lead: "这是一个充满活力的创新组织门户。",
    text: "我们致力于连接每一位成员，激发团队潜能。在这里，你可以了解我们的最新动态、核心项目以及我们共同坚守的使命与愿景。",
  },

  /* 待确认：组织简介 */
  intro:
    "我们的组织致力于打造开发、协作、共赢的生态平台。通过整合优质资源与前沿技术，我们不断探索行业新边界。欢迎加入我们，一起创造无限可能。",

  /* 关于我们：版式参照字节跳动官网，文案为待确认的初版占位 */
  about: {
    mission: {
      title: "我们的使命",
      lines: ["连接无限可能，", "与伙伴一起解决长期问题。"],
      text: "我们关注每一次真实的协作与成长。从发现需求、汇聚资源到反复验证，我们把每一步做实，致力于打造一个开放共赢的平台。",
    },

    culture: {
      title: "我们的文化",
      intro:
        "我们的文化由三部分组成：使命说明我们为何出发，行事准则面向每一位成员，协作方式说明我们如何把事情做成。",
      quoteLead: ["我们把「", "行事准则", "」作为对每位成员的要求。"],
      quoteTeam: ["「", "协作方式", "」说明我们如何把事做成。"],
    },

    /* 待确认：行事准则 */
    values: [
      {
        title: "求真务实",
        text: "从真实需求出发，用扎实的成果来衡量每一项工作的价值。",
        image: "/images/about/teamwork.jpg",
        points: ["以实际需求为起点", "用扎实的成果说话", "拒绝形式主义"],
      },
      {
        title: "开放协作",
        text: "打破边界，与内外部伙伴保持长期、透明、共赢的合作。",
        image: "/images/about/collaboration.jpg",
        points: [
          "长期而非一次性合作",
          "信息透明、及时同步",
          "尊重每一份专业与创意",
        ],
      },
      {
        title: "长期主义",
        text: "重视每一次的积累与沉淀，让每一次付出都能成为组织成长的基石。",
        image: "/images/about/learning.jpg",
        points: ["为长期目标留出时间", "重视积累与沉淀", "让经验可以被传承"],
      },
    ],

    /* 待确认：协作方式 */
    collaboration: [
      {
        title: "明确目标",
        text: "开始之前先对齐目标与判断标准，过程中不轻易偏移。",
      },
      {
        title: "小步验证",
        text: "把大问题拆成可以验证的小步，用阶段性结果决定下一步，而不是全部做完再评估。",
      },
      {
        title: "复盘沉淀",
        text: "每个阶段结束后复盘方法与工具，把经验留在组织里，而不是留在个人身上。",
      },
    ],

    team: {
      title: "团队",
      intro:
        "团队按职能协作，覆盖从技术研究、工程实现到场景落地的全过程。成员个人资料将在确认可公开后补充。",
    },

    journey: {
      titleLines: ["我们的", "路径"],
      paragraphs: [
        "我们的组织在创新浪潮中应运而生，致力于打造一个开发、协作的共同体。",
        "我们将目光放在真实需求上：先理解痛点，再选择方向，用扎实的成果来检证每一步。",
        "成立不是终点。未来，我们将继续聚焦每一位成员的智慧与力量，让组织在长期的协作中保持活力与稳定。",
        "我们期待与更多志同道合的伙伴一起，去创造属于我们的长期价值。",
      ],
    },

    place: {
      label: "办公地点",
      value: "河北大学",
    },
  },

  /* 待确认：团队构成（按职能展示，个人资料待确认后再公开） */
  team: [
    {
      id: "research",
      title: "战略与研究",
      text: "负责组织核心方向的探索与研究，持续关注行业前沿动态，为组织发展提供智力支持。",
      tags: ["战略规划", "行业研究", "趋势洞察"],
    },
    {
      id: "engineering",
      title: "项目与执行",
      text: "负责将规划落地为具体的项目，涵盖方案设计、落地执行与效果评估。",
      tags: ["项目管理", "落地执行", "质量把控"],
    },
    {
      id: "operation",
      title: "运营与生态",
      text: "负责组织的日常运营、成员沟通与外部生态合作，让每一项工作顺畅推进。",
      tags: ["日常运营", "伙伴沟通", "生态建设"],
    },
  ],

  /* 待确认：研究方向（第一期展示 4 项，可按实际调整数量） */
  business: [
    {
      id: "algorithm",
      title: "核心领域探索",
      summary:
        "围绕实际需求开展深度探索与应用落地，涵养从概念验证到成果转化的完整链路。",
      points: ["场景化应用", "成效评估", "成果转化"],
    },
    {
      id: "solution",
      title: "行业智能化方案探索",
      summary:
        "从行业场景出发梳理需求、设计并验证方案，重视可用性与长期可维护性。",
      points: ["场景与需求梳理", "方案设计与验证", "落地实施与维护"],
    },
    {
      id: "data",
      title: "信息与知识管理",
      summary:
        "协助组织梳理核心资源、建立信息规范，让沉淀的知识真正支撑管理与决策。",
      points: ["核心资源梳理", "信息规范建设", "决策数据支撑"],
    },
    {
      id: "co-creation",
      title: "外部合作与联合共创",
      summary: "与各类伙伴共建课题与创新项目，推动合作在实际场景中验证与转化。",
      points: ["专业咨询", "联合项目共建", "成果落地支持"],
    },
  ],
})

/* 顶部导航 */
export const navigation = [
  { label: "首页", to: "/" },
  { label: "关于我们", to: "/about" },
  { label: "研究方向", to: "/business" },
  { label: "项目成果", to: "/projects" },
  { label: "动态", to: "/news" },
  { label: "加入我们", to: "/recruitment" },
];

/* 外部链接 */
export const externalLinks = reactive([
  {
    label: "河北省保定市",
    desc: "河北大学AnySome",
    url: "https://www.baoding.gov.cn/",
  },
])

export const siteLoading = ref(false)
export const siteError = ref('')

let siteRequest

export function loadSite() {
  if (siteRequest) return siteRequest

  siteLoading.value = true
  siteError.value = ''
  siteRequest = portalApi.getSite()
    .then((data) => {
      if (!data) throw new Error('站点信息为空')

      site.name = data.orgName || site.name
      site.shortName = data.orgShortName || site.shortName
      site.intro = data.intro || site.intro
      site.contact.email = data.contact?.email || ''
      site.address = data.contact?.address || site.address

      if (data.mission) site.about.mission.text = data.mission
      if (data.teamIntro) site.about.team.intro = data.teamIntro
      if (data.contact?.address) site.about.place.value = data.contact.address

      externalLinks.splice(
        0,
        externalLinks.length,
        ...(data.externalLinks || []).map((link) => ({
          label: link.name,
          url: link.url,
          desc: ''
        }))
      )

      return data
    })
    .catch((error) => {
      siteError.value = error.message || '站点信息加载失败'
      siteRequest = null
      throw error
    })
    .finally(() => {
      siteLoading.value = false
    })

  return siteRequest
}

/* 预留栏目说明：第一期仅展示栏目状态，后续填充内容即可 */
export const sections = {
  projects: {
    eyebrow: "项目成果",
    title: "项目与成果",
    description: "记录已开展的项目、技术成果与伙伴合作实践。",
    plans: ["项目案例", "技术成果", "合作实践"],
    empty: "相关材料正在核对，确认后在此发布，敬请关注。",
  },
};
