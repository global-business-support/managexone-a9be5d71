import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/admin-login", replace: true });
      else if (!isAdmin) navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-white/70">
        Verifying admin access…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
