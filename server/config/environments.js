// Configurações de ambiente
const environments = {
  development: {
    API_URL: 'http://localhost:3002/api',
    FRONTEND_URL: 'http://localhost:5173',
    PORT: 3002,
    DATABASE_URL: 'postgresql://neondb_owner:npg_84GYtriPbVpn@ep-bold-bar-aedo5ydc-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    CLOUDINARY_CLOUD_NAME: 'dy2vtcsog',
    CLOUDINARY_API_KEY: '711442689722133',
    CLOUDINARY_API_SECRET: 'ZjamkE3_IdSFjYAmoCvk_zfXVVU'
  },
  production: {
    API_URL: 'https://filazero-sistema-de-gestao.onrender.com/api',
    FRONTEND_URL: 'https://filazeroapp.online',
    PORT: process.env.PORT || 3002,
    DATABASE_URL: 'postgresql://neondb_owner:npg_84GYtriPbVpn@ep-bold-bar-aedo5ydc-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dy2vtcsog',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '711442689722133',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'ZjamkE3_IdSFjYAmoCvk_zfXVVU'
  }
};

const currentEnv = process.env.NODE_ENV || 'development';
const config = environments[currentEnv];

export default config;
