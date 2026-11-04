import { Router } from 'express';
import { siteRouter } from './site.routes.js';
import { homeRouter } from './home.routes.js';
import { aboutRouter } from './about.routes.js';
import { businessRouter } from './business.routes.js';
import { projectsRouter } from './projects.routes.js';
import { newsRouter } from './news.routes.js';
import { recruitmentRouter } from './recruitment.routes.js';

export const apiRouter = Router();

apiRouter.use('/site', siteRouter);
apiRouter.use('/home', homeRouter);
apiRouter.use('/about', aboutRouter);
apiRouter.use('/business', businessRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/news', newsRouter);
apiRouter.use('/recruitment', recruitmentRouter);
