import 'dotenv/config';
import { spawnSync } from 'node:child_process';

const databaseUrl = process.env.TEST_DATABASE_URL ??
  'postgresql://usuario:senha@localhost:5433/cineverso_mvp_test';
const databaseName = new URL(databaseUrl).pathname.slice(1);
if (!databaseName.endsWith('_test')) {
  throw new Error('O banco de testes precisa ter nome terminado em _test.');
}
const env = { ...process.env, DATABASE_URL: databaseUrl };

for (const args of [
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  ['node_modules/vitest/vitest.mjs', 'run', '--config', './vitest.config.e2e.ts'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
