import { success } from '../common/response.js';
import { getSiteInfo } from '../services/site.service.js';

export async function getSite(req, res, next) {
  try {
    const data = await getSiteInfo();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}
