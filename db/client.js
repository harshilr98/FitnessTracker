const { Pool } = require('pg');
require("dotenv").config();

const connectionString = process.env.DATABASE_URL

const client = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

module.exports = client;
