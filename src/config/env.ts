import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || '3000',
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY || 'mi_clave_secreta',
};
