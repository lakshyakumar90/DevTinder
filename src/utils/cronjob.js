const cron = require('node-cron');
const ConnectionRequest = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const { cronEmail } = require("../utils/sendEmail");

//sending email at 8 am in the morning
cron.schedule("0 8 * * * ", async () => {
    try {
        const yesterday = subDays(new Date(), 1); // Corrected to get yesterday's date
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);
        const pendingRequests = await ConnectionRequest.find({
            status: "interested", // Removed trailing space
            createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
        }).populate("fromUserId").populate("toUserId");

        if (pendingRequests.length > 0) {
            const listOfEmails = [...new Set(pendingRequests.map((request) => request.toUserId.email))];
            for (const email of listOfEmails) {
                try {
                    const emailContent = `Hello,\n\nYou have some pending connection requests from yesterday. Please review them when you have a moment.\n\nBest regards,\nTinder for Devs Team`;
                    await cronEmail(email, "Daily Pending Connection Requests", emailContent); // Improved email subject and content
                } catch (err) {
                    throw new Error(`Error sending email to ${email}: ${err.message}`); // Changed console.log to console.error for errors
                }
            }
        } else {
            console.log("No pending connection requests from yesterday. No emails sent.");
        }

    } catch (err) {
        throw new Error(`Error sending emails: ${err.message}`); // Changed console.log to console.error for errors
    }
})