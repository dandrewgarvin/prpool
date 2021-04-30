import { RequestHandler } from 'express';

import logger from '../../common/logger';

export default function (handle: RequestHandler): RequestHandler {
  return async function (req, res, next) {
    logger.info(`api.${req.method}.${req.originalUrl}`);

    try {
      await handle(req, res, next);

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
