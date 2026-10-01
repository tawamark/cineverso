import { AdminOverviewContent } from "@/components/admin/admin-overview";

export default function AdminHomePage() {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
        Visão geral
      </h1>
      <AdminOverviewContent />
    </section>
  );
}
