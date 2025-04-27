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
    // Handle array-based query keys by constructing the full URL
    let url: string;
    
    if (typeof queryKey[0] === 'string' && queryKey.length > 1) {
      // Filter out undefined or null segments before reducing
      const validSegments = queryKey.filter(segment => 
        segment !== undefined && segment !== null
      );
      
      // Convert query key array to path segments
      url = validSegments.reduce((path: string, segment: any, index: number) => {
        // First segment is the base path
        if (index === 0) return String(segment);
        
        // Add subsequent segments with slashes
        return `${path}/${String(segment)}`;
      }, '');
    } else {
      // Simple string-based query key
      url = queryKey[0] as string;
    }
    
    console.log(`Query request: ${url}`);
    
    const res = await fetch(url, {
      credentials: "include",
    });
    
    console.log(`Query response: ${url} - Status: ${res.status}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`Returning null due to 401 status for ${url}`);
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log(`Query data for ${url}:`, data);
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
