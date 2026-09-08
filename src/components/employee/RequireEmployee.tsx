"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEmployeeAuth } from "@/context/EmployeeAuthContext";

export default function RequireEmployee({
  children,
}: {
  children: React.ReactNode;
}) {
  const { employee, loading } = useEmployeeAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !employee) {
      router.replace("/login");
    }
  }, [loading, employee, router]);

  if (loading || !employee) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-slate-400">
        กำลังโหลด...
      </div>
    );
  }

  return <>{children}</>;
}
