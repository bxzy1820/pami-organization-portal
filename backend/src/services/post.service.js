// post.service.js
// projects / news / recruitment 共用：按 type 查文章，分页，只返回 published
// TODO: 对接 C 的 postRepository.findPublishedByType(type, page, size)

// mock 数据：一期三类文章暂不导正式记录，默认返回空列表，前端显示"内容正在整理中"
const MOCK_DB = {
  achievement: [], // 项目成果
  announcement: [], // 公告动态
  recruitment: [], // 加入我们
};

export async function getPostList(type, page, size) {
  // 一期 mock：空数据，返回契约规定的分页空结构
  const list = MOCK_DB[type] || [];
  return {
    list,
    total: list.length,
    page,
    size,
  };
}
