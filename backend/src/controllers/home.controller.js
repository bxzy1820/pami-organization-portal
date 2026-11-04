import { success } from '../common/response.js';
import { getHomeInfo } from '../services/home.service.js';

export async function getHome(req, res, next) {
  try {
    const data = await getHomeInfo();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}
