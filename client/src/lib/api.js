
import { API_BASE_URL, JWT_TOKEN_KEY } from "./constants";

async function request(endpoint, options = {}) {
  const currentTokenInStorage = typeof window !== "undefined" ? localStorage.getItem(JWT_TOKEN_KEY) : null;
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (currentTokenInStorage) {
    headers.set("Authorization", `Bearer ${currentTokenInStorage}`);
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(JWT_TOKEN_KEY);
      // Redirect to login page
      window.location.href = '/login';
    }
    // Throw an error so React Query (or other callers) can handle it
    const errorData = await response.json().catch(() => ({ message: "Unauthorized due to 401 status" }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  if (response.status === 204) { // No Content
    return null;
  }

  return response.json();
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: "DELETE" }),
};

// Specific auth calls
export const loginUser = (credentials) => {
  return api.post("/auth/login", credentials);
};

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const getCurrentUser = () => {
  // Since there's no /auth/me endpoint in the server, we'll use the token to get the user ID
  // and then fetch the user data from the users endpoint
  const token = localStorage.getItem(JWT_TOKEN_KEY);
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  
  try {
    // Decode the JWT token to get the user ID
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const { userId } = JSON.parse(jsonPayload);
    
    // Fetch the user data using the user ID
    return api.get(`/user/${userId}`);
  } catch (error) {
    return Promise.reject(new Error('Failed to decode token'));
  }
};
