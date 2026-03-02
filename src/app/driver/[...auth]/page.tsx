import AuthLayout from "@/app/auth/layout";
import DriverLoginPage from "../login/page";
import DriverSignupPage from "../signup/page";

interface Props {
  params: Promise<{ auth: string[] }>;
}

export default async function DriverAuthPages({ params }: Props) {
  const { auth } = await params;
  const page = auth?.[0];
  return (
    <AuthLayout>
      {page === 'login' && <DriverLoginPage />}
      {page === 'signup' && <DriverSignupPage />}
    </AuthLayout>
  );
}
