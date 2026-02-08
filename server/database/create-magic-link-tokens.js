// Migration: Create magic_link_tokens table
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function createMagicLinkTokensTable() {
  try {
    console.log('Creating magic_link_tokens table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS magic_link_tokens (
        token VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        expires_at BIGINT NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✓ Table magic_link_tokens created successfully');
    
    // Create index on expires_at for faster cleanup
    await sql`
      CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_expires_at 
      ON magic_link_tokens(expires_at)
    `;
    
    console.log('✓ Index on expires_at created');
    
    // Create index on email for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_magic_link_tokens_email 
      ON magic_link_tokens(email)
    `;
    
    console.log('✓ Index on email created');
    
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

createMagicLinkTokensTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
