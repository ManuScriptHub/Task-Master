
// Using "type" for imports as per guidelines
// import type { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  name: string;
  email: string;
}

// This can be used if Firebase Auth's User object is directly relevant
// export interface AppUser extends FirebaseUser {}

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  project_id: string;
  task_name: string;
  priority: Priority;
  due_date: string; // ISO string date
  is_completed: boolean;
  // Optional: To hold a temporary client-side ID during creation
  temp_id?: string; 
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  pinned: boolean;
  tasks?: Task[]; // Tasks might be fetched with the project or separately
  // Optional: To hold a temporary client-side ID during creation
  temp_id?: string; 
  // For client-side generated color
  displayColor?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
