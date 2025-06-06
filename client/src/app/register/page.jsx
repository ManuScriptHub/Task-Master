
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register - TaskMaster Pro",
  description: "Create your TaskMaster Pro account.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <RegisterForm />
    </div>
  );
}
