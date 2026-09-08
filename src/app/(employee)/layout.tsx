import { EmployeeAuthProvider } from "@/context/EmployeeAuthContext";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeAuthProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white shadow-sm">
        {children}
      </div>
    </EmployeeAuthProvider>
  );
}
