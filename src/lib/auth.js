import { supabase } from './supabase';

// For development, we'll use a default admin user
const devUser = {
  id: 'dev-1',
  name: 'John Gayman',
  email: 'john.gayman@healthflexxinc.com',
  access_level: 'Super Admin'
};

export async function loginUser() {
  // In development, always return the dev user
  return devUser;
}

export function getUser() {
  // In development, always return the dev user
  return devUser;
}

export function logout() {
  // In development, just redirect to home page
  window.location.href = '/';
}

export function requireAuth() {
  // In development, always return the dev user
  return devUser;
}

export function canAccessUserManagement() {
  // In development, always return true
  return true;
}

export function canAccessContentManagement() {
  // In development, always return true
  return true;
}