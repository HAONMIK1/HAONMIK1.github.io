import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function getAccessToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const t = token !== undefined ? token : getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof localStorage !== "undefined"
    ? localStorage.getItem(REFRESH_TOKEN_KEY)
    : null;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const body = await res.json();
    if (res.ok && body.data?.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, body.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, body.data.refreshToken);
      return body.data.accessToken;
    }
  } catch {}

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  return null;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.clone().json();
      message = body.message || body.error || message;
    } catch {}
    throw new Error(message);
  }
}

function getFullUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(url, {
      ...options,
      headers: { ...(options.headers as Record<string, string>), ...getAuthHeaders(token) },
    });

  let res = await doFetch(getAccessToken());

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    } else if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      // 리프레시도 실패 = 완전히 로그아웃된 상태. 조용히 계속 실패하는 대신 로그인 화면으로 보낸다.
      window.location.href = "/login";
    }
  }

  return res;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const fullUrl = getFullUrl(url);
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};

  const res = await fetchWithAuth(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = getFullUrl(queryKey.join("/") as string);
    const res = await fetchWithAuth(fullUrl, { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: { retry: false },
  },
});
