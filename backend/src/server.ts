import "dotenv/config";
import { createApp } from "./app";
import { startScheduler } from "./utils/scheduler";

const PORT = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
  startScheduler();
});
