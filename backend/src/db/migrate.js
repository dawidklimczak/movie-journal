import { db, dbDriver, migrate } from './index.js';

try {
  await migrate();
  console.log(`Schemat gotowy (${dbDriver}).`);
} catch (err) {
  console.error('Migracja nie powiodła się:', err);
  process.exitCode = 1;
} finally {
  await db.destroy();
}
