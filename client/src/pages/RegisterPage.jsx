import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { RegisterForm } from '../components/auth/RegisterForm';

const RegisterPage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground mt-2">
          Enter your details to create your account
        </p>
      </div>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;