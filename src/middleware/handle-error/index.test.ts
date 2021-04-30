import { Request, Response } from 'express';

import { buildResponse, buildRequest } from '~/../utils/test-helpers';
import handleErrorBuilder, { HTTPError } from '.';

describe('Middleware:handleError', () => {
  const handleError = handleErrorBuilder();
  const request = buildRequest({
    method: 'GET',
    originalUrl: '/api/test',
  });
  const response = buildResponse({});
  const next = jest.fn();

  it('returns an error with a status', () => {
    handleError(new HTTPError('testing', 420), request, response, next);

    expect(response.status).toHaveBeenCalledWith(420);
    expect(response.send).toHaveBeenCalledWith('testing');
    expect(next).not.toHaveBeenCalled();
  });

  it('defaults to a 500 error', () => {
    handleError(
      new Error('testing'),
      {} as Request,
      response as Response,
      next,
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith('testing');
  });
});
