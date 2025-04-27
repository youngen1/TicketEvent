import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  isFormData?: boolean,
): Promise<Response> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined = undefined;
  
  console.log(`API Request: ${method} ${url}`);
  
  if (data) {
    if (isFormData) {
      // Don't set Content-Type for FormData, browser will set it with correct boundary
      body = data as BodyInit;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include",
  });
  
  console.log(`API Response: ${method} ${url} - Status: ${res.status}`);
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`Query request: ${queryKey[0]}`);
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });
    
    console.log(`Query response: ${queryKey[0]} - Status: ${res.status}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`Returning null due to 401 status for ${queryKey[0]}`);
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log(`Query data for ${queryKey[0]}:`, data);
    return data;
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
    mutations: {
      retry: false,
    },
  },
});
