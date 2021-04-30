import { Request, ErrorRequestHandler } from 'express';

import logger from '~/common/logger';

export class HTTPError extends Error {
  status: number;

  constructor(message: string, status?: number) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.status = status || 500;
  }
}

function makeFragment(request: Request, selector: string) {
  if (Reflect.has(request, selector)) {
    return Object.keys(Reflect.get(request, selector)).length > 0
      ? `
  - ${selector} (${JSON.stringify(Reflect.get(request, selector))})`
      : '';
  }
}
export default function handleError(): ErrorRequestHandler {
  return function (error: HTTPError, request, response, _) {
    const bodyFragment = makeFragment(request, 'body');
    const paramsFragment = makeFragment(request, 'params');
    const stackFragment = `
  - stack (${error.stack})`;

    logger.error(
      `api.${request.method}.${request.originalUrl} -- ${error.message}`,
      stackFragment,
      bodyFragment,
      paramsFragment,
    );

    response
      .status(error.status || 500)
      .send(error.message)
      .end();
  };
}
