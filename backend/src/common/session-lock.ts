import { Prisma } from '../generated/prisma/client.js';

export async function bloquearSessao(
  tx: Prisma.TransactionClient,
  id: string,
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "Sessao" WHERE "id" = ${id} FOR UPDATE`;
}
