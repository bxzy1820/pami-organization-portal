import { success } from '../common/response.js';
import { getAboutInfo } from '../services/about.service.js';

export async function getAbout(req, res, next) {
  try {
    const data = await getAboutInfo();
    return success(res, data);
  } catch (err) {
    next(err);
  }
}
