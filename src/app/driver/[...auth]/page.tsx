import AuthLayout from "@/app/auth/layout";
import DriverLoginPage from "../login/page";
import DriverSignupPage from "../signup/page";

export default function DriverAuthPages({ params }: { params: { auth: string[] } }) {
  const page = params.auth?.[0];

  return (
    <AuthLayout>
      {page === 'login' && <DriverLoginPage />}
      {page === 'signup' && <DriverSignupPage />}
    </AuthLayout>
  );
}
