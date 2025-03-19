require("dotenv").config();
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require("newrelic");
}
const compression = require("compression");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const routes = require("./routes");
const app = express();
const cors = require("cors");
const knex = require("./data/knex/knex.js");
const morgan = require("./middleware/morgan.js");
const logger = require("./utils/logger.js");
// const { launchCasinoTelegramBot } = require("./bot");
// const { health } = require("./controllers/health.js");
const assignId = require("./middleware/assignId.js");
// const connect = require("./mongodb/connect.js");

app.enable("trust proxy");
app.use(helmet());
app.use(compression());
app.use(express.static("public"));
app.use(assignId);
app.use(morgan);
app.use(express.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

// const allowedStatusIPs = (process.env.ALLOWED_STATUS_IPS || "")
//   .split(",")
//   .map((x) => x.trim())
//   .filter((x) => x);

// if (process.env.SHOW_STATUS === "true" && allowedStatusIPs.length) {
//   const statusMonitor = require("express-status-monitor")({ path: "_status" });
//   app.use(statusMonitor);
//   app.get("/status", (req, res) => {
//     return statusMonitor.pageRoute(req, res);
//   });
// }

app.use("/api", routes);

// app.get("/health", health);
app.use('/files', express.static(require("path").join(__dirname, 'public')));

async function migrate() {
  const migrationConfig = {
    migrations: {
      directory: [
        "./data/migrations",
        // "./data/migrations/logs",
        // "./data/migrations/triggers",
      ],
    },
  };
  logger.info("Running migrations...");
  try {
    await knex.migrate.latest(migrationConfig).then((result) => {
      const log = result[1];
      if (!log.length) {
        logger.info("Database is already up to date");
      } else {
        logger.info("Ran migrations:>> ");
        for (let i = 0; i < log.length; i++) {
          logger.info(i + 1 + "=> " + log[i]);
        }
        logger.info("Ran Migration Count: ", result[0]);
      }
    });
    logger.info("Ran migrations: Finish ");
  } catch (error) {
    logger.error("Database migration Error!!", error);
  }
}

app.listen(process.env.PORT || 5000, async () => {
  // await connect(); // Mongo Db Connection

  if (["prod"].includes(process.env.APP_ENV)) {
    migrate();
    // receive();
  }

  logger.info(`🚀 Backend Started ${process.env.PORT || 5050}`);
});

// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = app; // Export the app instance
