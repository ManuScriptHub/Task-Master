
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const ProjectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  pinned: z.boolean().default(false),
});

export const TaskSchema = z.object({
  task_name: z.string().min(3, { message: "Task name must be at least 3 characters" }),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.date({ coerce: true }).optional(), 
  is_completed: z.boolean().default(false),
});
