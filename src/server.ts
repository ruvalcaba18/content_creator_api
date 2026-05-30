import app from "./app";
import { config } from "./config/env";
import { initScheduler } from "./jobs/scheduler.job";
import { initDatabase } from "./database/postgres";

const PORT = config.port;

const startServer = async () => {
  await initDatabase();

  initScheduler();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
