import { success } from '../common/response.js';
import { getBusinessList } from '../services/business.service.js';

export async function getBusiness(req, res, next) {
  try {
    const data = await getBusinessList();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}
