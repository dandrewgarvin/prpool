import { Response, Request } from 'express'

interface ResponseSignature {
  locals?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function buildResponse(base: ResponseSignature): Response {
  const response: Partial<Response> = {
    send: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    end: jest.fn(),
    ...base,
  }

  return response as Response
}

interface RequestSignature {
  body?: { [key: string]: string | number };
  query?: { [key: string]: string };
  [key: string]: string | unknown;
}

export function buildRequest({
  body,
  query,
  ...rest
}: RequestSignature): Request {
  const request: Partial<Request> = {
    query: { ...query },
    body: { ...body },
    ...rest,
  }

  return request as Request
}
