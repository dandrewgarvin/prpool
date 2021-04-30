import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const POSTGRES_DATABASE = process.env.DB_NAME || 'postgres';
export const POSTGRES_HOST = process.env.DB_HOST || 'pg';
export const POSTGRES_PASSWORD = process.env.DB_PASSWORD || '';
export const POSTGRES_USERNAME = process.env.DB_USERNAME || 'postgres';
