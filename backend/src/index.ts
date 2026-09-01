// Must be the first import: app.ts and utils/jwt.ts read process.env at module
// load, and ES import hoisting would run them before a dotenv.config() call here.
import 'dotenv/config';

import app from './app';
import { prisma } from './db/prisma';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(PORT, () => {
    console.log(`HairsUp API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
