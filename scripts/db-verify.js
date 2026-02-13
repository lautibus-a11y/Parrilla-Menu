import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

async function verifyDB() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Database Verification ---');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Tables found:', res.rows.map(r => r.table_name).join(', '));

        for (const row of res.rows) {
            const TableName = row.table_name;
            const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
      `, [TableName]);

            console.log(`\nTable: ${TableName}`);
            columns.rows.forEach(c => {
                console.log(` - ${c.column_name} (${c.data_type})${c.is_nullable === 'YES' ? '' : ' NOT NULL'}`);
            });
        }

    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await client.end();
    }
}

verifyDB();
