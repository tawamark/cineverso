import { AdminRoomsList } from "@/components/admin/admin-rooms-list";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function AdminRoomsPage() {
  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Salas</h1></div><Link href="/admin/salas/novo" className="flex h-11 items-center gap-2 self-start rounded-xl bg-primary px-5 text-sm font-bold text-white sm:self-center"><Plus className="size-4" />Cadastrar sala</Link></div>
      <AdminRoomsList />
    </section>
  );
}
