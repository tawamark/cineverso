import { AdminResourceForm } from "@/components/admin/admin-resource-form";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminResourceForm kind="cinema" id={id} />; }
