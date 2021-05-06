/* eslint-disable @typescript-eslint/camelcase */
import { Response, Request } from 'express';

import logger from '../../common/logger';

import { deleteSlackMessage } from '../SlackController';

/**
 * List of API examples.
 * @route GET /api
 */
export async function testdelete(req: Request, res: Response) {
  logger.info(`TestDelete.${req.method}`);

  await deleteSlackMessage(628023143);

  res.sendStatus(200);
}
