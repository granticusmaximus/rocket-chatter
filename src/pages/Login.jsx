import LoginForm from "../components/auth/LoginForm";
import AuthWrapper from "../components/auth/AuthWrapper";

export default function Login() {
  return (
    <AuthWrapper>
      <LoginForm />
    </AuthWrapper>
  );
}