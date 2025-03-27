import { query } from '../../utils/database.js';
import { encryptMobile, decryptMobile } from '../utils/crypto.js';

const migrateUsers = async () => {
  const conn = await getDatabaseConnection(); // Implement your connection
  try {
    console.log('Starting migration...');
    const [users] = await query('SELECT id, mob_no FROM users');

    for (const user of users) {
      // Skip if already in new format
      if (user.mob_no && user.mob_no.length === 32 && !user.mob_no.includes(':')) {
        continue;
      }

      let decrypted;
      if (!user.mob_no) {
        console.log(`User ${user.id} has no mobile number`);
        continue;
      }

      if (user.mob_no.includes(':')) {
        // Old encrypted format
        decrypted = decryptMobile(user.mob_no);
      } else if (/^\d+$/.test(user.mob_no)) {
        // Plain text number
        decrypted = user.mob_no;
      } else {
        console.log(`User ${user.id} has invalid mobile format`);
        continue;
      }

      const encrypted = encryptMobile(decrypted);
      await query('UPDATE users SET mob_no = ? WHERE id = ?', [encrypted, user.id]);
      console.log(`Migrated user ${user.id}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    conn.end();
  }
};

migrateUsers();