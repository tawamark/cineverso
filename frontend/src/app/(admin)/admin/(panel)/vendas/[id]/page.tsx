import { AdminPurchaseDetails } from "@/components/admin/admin-purchase-details";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminPurchaseDetails id={id} />;
}
