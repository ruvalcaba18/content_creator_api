import cron from "node-cron";
import { postService } from "../services/post.service";

export const initScheduler = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running scheduler...");
    await postService.processPendingPosts();
  });
};
