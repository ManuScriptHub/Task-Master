
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { JWT_TOKEN_KEY } from "./constants"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Function to decode JWT token and get user ID
export function getUserIdFromToken() {
  const token = localStorage.getItem(JWT_TOKEN_KEY);
  if (!token) return null;
  
  try {
    // Decode the JWT token to get the user ID
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const { userId } = JSON.parse(jsonPayload);
    return userId;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}
