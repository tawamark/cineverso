import { AdminSessionDetails } from "@/components/admin/admin-session-details";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminSessionDetails id={id} />;
}
