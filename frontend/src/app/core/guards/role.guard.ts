import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../signals/auth.store';

export const roleGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const user = authStore.currentUser();

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  // Redirect to dashboard on access failure
  return router.createUrlTree(['/dashboard']);
};
