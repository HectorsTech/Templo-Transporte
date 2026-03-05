import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root (parent of scripts)
dotenv.config({ path: path.join(__dirname, '../.env') });

import pool from '../config/database.js';
import fs from 'fs';

const runMigration = async () => {
    try {
        const migrationPath = path.join(__dirname, '../database/migration_fix_viajes.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Remove comments and split
        const statements = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join(' ')
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            try {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await pool.query(statement);
                console.log('Success.');
            } catch (err) {
                if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipping (already done or field missing): ${err.message}`);
                } else {
                    console.error('Error:', err.message);
                    // We might want to stop if rename fails, but let's try next command
                }
            }
        }
        console.log('Migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
