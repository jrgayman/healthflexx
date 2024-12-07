import { defineMiddleware } from 'astro/middleware';

export const authMiddleware = defineMiddleware(async ({ request, redirect }, next) => {
  const url = new URL(request.url);
  
  // Check if the route requires authentication
  if (url.pathname.startsWith('/admin')) {
    const user = sessionStorage.getItem('user');
    
    if (!user) {
      return redirect('/?unauthorized=true');
    }

    const { role } = JSON.parse(user);
    
    // Role-based access control
    if (url.pathname === '/admin/manage') {
      const allowedRoles = ['Super Admin', 'Admin'];
      if (!allowedRoles.includes(role)) {
        return redirect('/?unauthorized=true');
      }
    }
  }

  return next();
});