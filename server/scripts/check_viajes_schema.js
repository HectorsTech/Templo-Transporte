import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root (parent of scripts)
dotenv.config({ path: path.join(__dirname, '../.env') });

import pool from '../config/database.js';

const checkSchema = async () => {
    try {
        const [rows] = await pool.query('DESCRIBE viajes');
        console.log('Schema of "viajes" table:');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error('Failed to check schema:', error);
        process.exit(1);
    }
};

checkSchema();
