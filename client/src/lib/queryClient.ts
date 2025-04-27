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

// Build URL from query key
function buildUrlFromQueryKey(queryKey: unknown[]): string {
  if (!queryKey.length) return '';
  
  // Handle base URL (first element)
  if (typeof queryKey[0] !== 'string') {
    return String(queryKey[0] || '');
  }
  
  const baseUrl = queryKey[0];
  
  // If only one element, return it directly
  if (queryKey.length === 1) {
    return baseUrl;
  }
  
  // Handle query parameters (if second element is an object)
  if (typeof queryKey[1] === 'object' && queryKey[1] !== null && !Array.isArray(queryKey[1])) {
    const queryParams = new URLSearchParams();
    const paramsObj = queryKey[1] as Record<string, any>;
    
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      return `${baseUrl}?${queryString}`;
    }
    return baseUrl;
  }
  
  // Handle path parameters (rest of elements as URL segments)
  // Filter out undefined/null segments
  const validSegments = queryKey.filter(segment => 
    segment !== undefined && segment !== null
  );
  
  // Build URL with segments
  return validSegments.reduce((path, segment, index) => {
    if (index === 0) return String(segment);
    return `${path}/${String(segment)}`;
  }, '');
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Construct URL from query key
    const url = buildUrlFromQueryKey(queryKey);
    
    console.log(`Query request: ${url}`);
    
    try {
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
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
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
