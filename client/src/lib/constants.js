export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"; // Backend URL

export const JWT_TOKEN_KEY = "taskmaster_jwt_token";

export const PROJECT_COLORS = [
  "bg-sky-200/70",
  "bg-emerald-200/70",
  "bg-amber-200/70",
  "bg-fuchsia-200/70",
  "bg-rose-200/70",
  "bg-cyan-200/70",
  "bg-lime-200/70",
  "bg-indigo-200/70",
  "bg-teal-200/70",
  "bg-pink-200/70",
];

export function getProjectColor(id) {
  const stringId = String(id);
  // Simple hash function to get a somewhat consistent index
  let hash = 0;
  for (let i = 0; i < stringId.length; i++) {
    const char = stringId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % PROJECT_COLORS.length;
  return PROJECT_COLORS[index];
}
