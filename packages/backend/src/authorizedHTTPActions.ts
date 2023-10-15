 // If not listed here, the API Gateway will return a 403 Forbidden error
 export const authorizedHTTPActions = [
  'GET/friends',
  'GET/invites',
  'POST/invites',
  'DELETE/invites',
  'GET/comparisons/*',
];
