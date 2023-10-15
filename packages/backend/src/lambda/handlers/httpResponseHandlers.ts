import { COOKIE_SETTINGS, WEB_BASE_URI } from "../../model/constants";


export interface Headers {
  [key: string]: string;
}

export interface HttpResponse {
  statusCode: number;
  headers: Headers;
  body?: string;
}

export function handle200OK(allowedMethods: string, data: any) {
  return handle2XX(200, allowedMethods, data, null)
}

export function handle201Created(allowedMethods: string, data: any) {
  return handle2XX(201, allowedMethods, data, null)
}

export function handle202Accepted(allowedMethods: string, message: string) {
  return handle2XX(202, allowedMethods, null, message)
}

function handle2XX(httpCode: number, allowedMethods: string, data: any, message: string | null) {
  return {
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": WEB_BASE_URI,
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": allowedMethods,
    },
    statusCode: httpCode,
    body: JSON.stringify({data, message}),
  };
}

export interface SessionCookie {
  sessionId: string | null;
  expiresAt: Date;
}

export function handle302Redirect(location: string, session?: SessionCookie) {
  const headers: Headers = {
    'Location': location,
  }

  if (session) {
    headers['Set-Cookie'] = `session=${session.sessionId}; Expires=${session.expiresAt.toUTCString()}; ${COOKIE_SETTINGS}`;
  }

  return {
    statusCode: 302,
    headers: headers,
    body: '',
  };
}

export function handle400BadRequest(error: unknown, errorMessage?: string) {
  const message = errorMessage || 'Bad request';
  return handleError(400, error, message);
}

export function handle401Unauthorized(error: unknown, errorMessage?: string) {
  const message = errorMessage || 'Forbidden';
  return handleError(401, error, message);
}

export function handle404NotFound(error: unknown, errorMessage?: string) {
  const message = errorMessage || 'Not found';
  return handleError(404, error, message);
}

export function handle500ServerError(error: unknown, errorMessage?: string) {
  const message = errorMessage || 'Internal server error';
  return handleError(500, error, message);
}

function handleError(httpCode: number, error: unknown, errorMessage: string) {
  console.error(error);

  return {
    statusCode: httpCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: errorMessage })
  };
}
