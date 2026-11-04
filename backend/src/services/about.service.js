// about.service.js
// TODO: 对接 C 的 siteRepository
export async function getAboutInfo() {
  return {
    intro: '【测试数据】组织简介。',
    mission: '【测试数据】使命与定位。',
    teamIntro: '【测试数据】团队整体介绍，不包含成员姓名、头像、履历等个人资料。',
    contact: {
      email: 'contact@pami.com',
      address: '河北省保定市×××',
    },
  };
}
