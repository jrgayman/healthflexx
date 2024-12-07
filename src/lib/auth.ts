import { supabase } from './supabase';

// Always return dev user for all auth functions
const devUser = {
  id: 'dev-1',
  name: 'John Gayman',
  email: 'john.gayman@healthflexxinc.com',
  access_level: 'Super Admin'
};

export async function loginUser() {
  return devUser;
}

export function getUser() {
  return devUser;
}

export function logout() {
  window.location.href = '/admin/manage';
}

export function requireAuth() {
  return devUser;
}

export function canAccessUserManagement() {
  return true;
}

export function canAccessContentManagement() {
  return true;
}