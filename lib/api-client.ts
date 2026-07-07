/**
 * API Client with automatic token refresh
 * This helper ensures all API calls have fresh Firebase tokens
 */

import { auth } from "@/lib/firebase";

/**
 * Get a fresh Firebase ID token, forcing refresh if needed
 */
export async function getFreshToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    // Force refresh to get a fresh token
    const token = await user.getIdToken(true);

    // Update session cookie
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    return token;
  } catch (error) {
    console.error("Failed to get fresh token:", error);
    return null;
  }
}

/**
 * Enhanced fetch with automatic token refresh
 * Use this instead of native fetch for authenticated API calls
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getFreshToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401, try one more time with a force-refreshed token
  if (response.status === 401) {
    const freshToken = await getFreshToken();

    if (freshToken) {
      headers.set("Authorization", `Bearer ${freshToken}`);
      return fetch(url, {
        ...options,
        headers,
      });
    }
  }

  return response;
}

/**
 * Helper for GET requests
 */
export async function apiGet(url: string, options: RequestInit = {}) {
  return authenticatedFetch(url, { ...options, method: "GET" });
}

/**
 * Helper for POST requests
 */
export async function apiPost(
  url: string,
  data?: any,
  options: RequestInit = {}
) {
  return authenticatedFetch(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for PUT requests
 */
export async function apiPut(
  url: string,
  data?: any,
  options: RequestInit = {}
) {
  return authenticatedFetch(url, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete(url: string, options: RequestInit = {}) {
  return authenticatedFetch(url, { ...options, method: "DELETE" });
}
