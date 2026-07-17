import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const storeId = localStorage.getItem('selected_store_id');
  const baseUrl = 'http://localhost:3000/api';

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (storeId) {
    headers = headers.set('x-store-id', storeId);
  }

  // Prepend Base API URL for relative requests
  let apiReq = req;
  if (!req.url.startsWith('http') && !req.url.endsWith('.json')) {
    apiReq = req.clone({
      url: `${baseUrl}/${req.url}`,
      headers
    });
  } else {
    apiReq = req.clone({ headers });
  }

  return next(apiReq);
};
