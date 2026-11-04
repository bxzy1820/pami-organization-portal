// business.service.js
// TODO: 对接 C 的 businessRepository
export async function getBusinessList() {
  return {
    list: [
      { title: '【测试数据】方向一', desc: '方向描述' },
      { title: '【测试数据】方向二', desc: '方向描述' },
    ],
  };
}
