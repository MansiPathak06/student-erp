const BASE = "/api";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export async function apiFetch(path, options = {}) {
  const token = getCookie("token");
  
  // Check if the request body is FormData (for file uploads)
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  // Only set Content-Type for JSON requests (not for FormData)
  if (!isFormData && options.body && typeof options.body === 'string') {
    headers["Content-Type"] = "application/json";
  }
  
  console.log(`Making ${options.method || 'GET'} request to: ${BASE}${path}`);
  console.log("Request headers:", headers);
  if (options.body && !isFormData) {
    console.log("Request body:", options.body);
  }
  
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  console.log(`Response status: ${res.status} ${res.statusText}`);

  if (res.status === 401) {
    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "user=; Max-Age=0; path=/";
    window.location.href = "/login";
    return;
  }

  // For 204 No Content responses
  if (res.status === 204) {
    return null;
  }

  try {
    const data = await res.json();
    console.log("Response data:", data);
    
    // If response is not OK, throw an error with the message
    if (!res.ok) {
      const errorMessage = data.message || data.error || data.details || `Request failed with status ${res.status}`;
      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      // If response is not JSON but request was successful
      if (res.ok) {
        return { success: true };
      }
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error(`Server returned: ${text.substring(0, 200)}`);
    }
    throw error;
  }
}

export function getUser() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^| )user=([^;]+)/);
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match[2])); }
  catch { return null; }
}

export function logout() {
  document.cookie = "token=; Max-Age=0; path=/";
  document.cookie = "user=; Max-Age=0; path=/";
  window.location.href = "/login";
}