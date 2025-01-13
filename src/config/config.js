import "dotenv/config";

/***************************
    SERVER PORT CONFIGURATIONS
***************************/

export const APP_ENV = process.env.hasOwnProperty("APP_ENV")
  ? process.env.APP_ENV
  : "local";

export const PORT = process.env.hasOwnProperty("PORT")
  ? process.env.PORT
  : "5000";

export const JWT_SECRET_TOKEN = process.env.hasOwnProperty("JWT_SECRET_TOKEN")
  ? String(process.env.JWT_SECRET_TOKEN)
  : "";

export const JWT_EXPIRES_HOUR = process.env.hasOwnProperty("JWT_EXPIRES_IN")
  ? process.env.JWT_EXPIRES_IN
  : 24;
/***************************
    DATABASE CONFIGURATIONS
***************************/

export const SEEDER_PASSWORD = process.env.hasOwnProperty("SEEDER_KEY")
  ? process.env.SEEDER_KEY
  : "softfix_connect";