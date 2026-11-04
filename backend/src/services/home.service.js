// home.service.js
// TODO: 对接 C 的 repository：siteRepository + businessRepository
export async function getHomeInfo() {
  return {
    orgName: '葩米科技',
    slogan: '【测试数据】首页标语',
    briefIntro: '【测试数据】首页简短介绍。',
    directions: [
      { title: '研究方向一', desc: '【测试数据】方向描述' },
      { title: '研究方向二', desc: '【测试数据】方向描述' },
    ],
  };
}
