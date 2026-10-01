import { AdminPurchasesList } from "@/components/admin/admin-purchases-list";

export default function AdminSalesPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Vendas</h1>
      <AdminPurchasesList />
    </section>
  );
}
