import { TicketPurchase } from "@/components/ticket-purchase";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketPurchase sessionId={id} />;
}
