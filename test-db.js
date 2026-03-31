require('dotenv').config({path: '.env.local'});
const postgres = require('postgres');
console.log("Connecting to:", process.env.DATABASE_URL);
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

sql`SELECT 1`
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Error:', err))
  .finally(() => process.exit(0));
