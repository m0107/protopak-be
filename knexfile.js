require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_WRITER_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
    },
    migrations: {
      directory: [
        "./data/migrations",
        // "./data/migrations/logs",
        // "./data/migrations/indexing",
        // "./data/migrations/triggers",
      ],
    },
    seeds: { directory: "./data/seeds" },
  },

  production: {
    client: "pg",
    connection: process.env.DB_URL,
    migrations: {
      directory: "./data/migrations",
    },
    seeds: { directory: "./data/seeds" },
  },
};
