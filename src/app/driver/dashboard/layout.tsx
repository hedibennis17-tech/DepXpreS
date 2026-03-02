import { DriverHeader } from "@/components/driver/driver-header";

export default function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <DriverHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
