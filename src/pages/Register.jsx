import RegisterForm from "../components/auth/RegisterForm";
import AuthWrapper from "../components/auth/AuthWrapper";

export default function Register() {
  return (
    <AuthWrapper>
      <RegisterForm />
    </AuthWrapper>
  );
}