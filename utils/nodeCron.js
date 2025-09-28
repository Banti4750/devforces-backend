import cron from "node-cron";
import { prisma } from "../config/db.js";
import { ContestStatus } from "@prisma/client";


async function updateContestStatuses() {
    const now = new Date(); // UTC

    // Log IST for debugging
    console.log("IST time:", now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

    // Upcoming
    await prisma.contest.updateMany({
        where: { startTime: { gt: now } },
        data: { status: ContestStatus.UPCOMING },
    });

    // Live
    await prisma.contest.updateMany({
        where: { startTime: { lte: now }, endTime: { gt: now } },
        data: { status: ContestStatus.LIVE },
    });

    // Completed
    await prisma.contest.updateMany({
        where: { endTime: { lte: now } },
        data: { status: ContestStatus.COMPLETED },
    });

}

// Run immediately once
updateContestStatuses().catch(console.error);

// Run every minute
cron.schedule("* * * * *", async () => {
    console.log("⏳ Running contest status updater...");
    await updateContestStatuses();
});
