// site.service.js
// TODO: 对接数据层的 repository 后，改为调用 siteRepository.getSiteInfo()
// 现在先用 mock 数据让接口能跑通，便于联调预览。

export async function getSiteInfo() {
  return {
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
}
