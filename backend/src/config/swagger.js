// swagger.js — 硬编码完整 OpenAPI 3.0 规范
// 对照 docs/API接口契约_v1.0.md 写，所有接口已定义
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: '葩米科技组织门户 API',
    version: '1.0.0',
    description: '一期公开只读接口，无鉴权，统一返回 {code,message,data}',
  },
  servers: [
    { url: 'http://localhost:3000', description: '本地开发' },
  ],
  paths: {
    '/api/v1/site': {
      get: {
        tags: ['站点'],
        summary: '获取站点基础信息',
        description: '组织名称、简介、使命、团队介绍、联系方式、外部链接',
        responses: {
          200: {
            description: '统一返回',
            content: {
              'application/json': {
                example: {
                  code: 0,
                  message: 'ok',
                  data: {
                    orgName: '葩米科技',
                    orgShortName: '葩米',
                    intro: '组织简介',
                    mission: '使命与定位',
                    teamIntro: '团队整体介绍',
                    contact: { email: 'contact@pami.com', address: '河北省保定市×××' },
                    externalLinks: [{ name: 'Skill Hub', url: 'http://124.223.224.129:8080/' }],
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/home': {
      get: {
        tags: ['首页'],
        summary: '获取首页内容',
        description: '标语、首页简介、研究方向预览',
        responses: {
          200: {
            description: '统一返回',
            content: {
              'application/json': {
                example: {
                  code: 0,
                  message: 'ok',
                  data: {
                    orgName: '葩米科技',
                    slogan: '首页标语',
                    briefIntro: '首页简短介绍',
                    directions: [{ title: '研究方向一', desc: '描述' }],
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/about': {
      get: {
        tags: ['关于我们'],
        summary: '获取关于我们',
        description: '组织简介、使命与定位、团队整体介绍、联系方式',
        responses: {
          200: {
            description: '统一返回',
            content: {
              'application/json': {
                example: {
                  code: 0,
                  message: 'ok',
                  data: {
                    intro: '组织简介',
                    mission: '使命与定位',
                    teamIntro: '团队整体介绍',
                    contact: { email: 'contact@pami.com', address: '河北省保定市×××' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/business': {
      get: {
        tags: ['研究方向'],
        summary: '获取业务/研究方向',
        responses: {
          200: {
            description: '统一返回',
            content: {
              'application/json': {
                example: {
                  code: 0,
                  message: 'ok',
                  data: {
                    list: [{ title: '方向一', desc: '描述' }],
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/projects': {
      get: {
        tags: ['项目成果'],
        summary: '获取项目成果列表（分页）',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '页码' },
          { name: 'size', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 }, description: '每页条数，最大50' },
        ],
        responses: {
          200: {
            description: '统一返回',
            content: {
              'application/json': {
                example: {
                  code: 0,
                  message: 'ok',
                  data: {
                    list: [
                      { id: 1, title: '项目成果标题', summary: '摘要', content: '正文', publishedAt: '2026-11-04 10:00:00' },
                    ],
                    total: 1,
                    page: 1,
                    size: 10,
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/news': {
      get: {
        tags: ['公告动态'],
        summary: '获取公告动态列表（分页）',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '页码' },
          { name: 'size', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 }, description: '每页条数，最大50' },
        ],
        responses: {
          200: {
            description: '统一返回',
            content: {
              'application/json': {
                example: {
                  code: 0,
                  message: 'ok',
                  data: {
                    list: [
                      { id: 2, title: '公告标题', summary: '摘要', content: '正文', publishedAt: '2026-11-04 10:00:00' },
                    ],
                    total: 1,
                    page: 1,
                    size: 10,
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/recruitment': {
      get: {
        tags: ['加入我们'],
        summary: '获取招聘列表（分页）',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '页码' },
          { name: 'size', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 }, description: '每页条数，最大50' },
        ],
        responses: {
          200: {
            description: '统一返回',
            content: {
              'application/json': {
                example: {
                  code: 0,
                  message: 'ok',
                  data: {
                    list: [
                      { id: 3, title: '岗位名称', summary: '岗位要求', content: '岗位详情', publishedAt: '2026-11-04 10:00:00' },
                    ],
                    total: 1,
                    page: 1,
                    size: 10,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
