
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login - TaskMaster Pro",
  description: "Login to your TaskMaster Pro account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <LoginForm />
    </div>
  );
}
