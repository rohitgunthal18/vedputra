/**
 * Admin Authentication Utility - SERVER-SIDE SECURE VERSION
 * Uses server-side API routes with JWT tokens and httpOnly cookies
 */

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  last_login?: string | null;
}

/**
 * Verify admin credentials via server-side API
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // CRITICAL: Include cookies to receive session cookie from server
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, user: data.user };
    }

    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Check if admin is authenticated (server-side verification)
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/verify', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
}

/**
 * Get current admin user (server-side verification)
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const response = await fetch('/api/admin/verify', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (data.authenticated && data.user) {
      return data.user;
    }

    return null;
  } catch (error) {
    console.error('Get admin error:', error);
    return null;
  }
}

/**
 * Logout admin (server-side)
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

