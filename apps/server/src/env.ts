import 'dotenv/config';
export const env = {
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || '0017f3d609b378e1627691378b1bdab6'
};
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
