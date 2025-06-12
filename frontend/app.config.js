import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    API_BASE_URL: process.env.API_BASE_URL,
    DETECTFACE_BASE_URL: process.env.DETECTFACE_BASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  },
});
