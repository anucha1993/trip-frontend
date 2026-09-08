"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/admin/login");
    }
  }, [loading, admin, router]);

  if (loading || !admin) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        กำลังโหลด...
      </div>
    );
  }

  return <>{children}</>;
}
