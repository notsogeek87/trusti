import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const result = await sql`SELECT COUNT(*) as count FROM applications`;
console.log('📊 Total apps:', result[0].count);
