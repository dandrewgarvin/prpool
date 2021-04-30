import { Response, Request } from 'express';

import logger from '../../common/logger';
/**
 * List of API examples.
 * @route GET /api
 */
export function health(req: Request, res: Response) {
  logger.info(`health.${req.method}`);

  res.sendStatus(200);
}
