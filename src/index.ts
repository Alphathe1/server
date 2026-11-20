import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import usersRouter from "./routes/users.routes.js";
import servicesRouter from "./routes/services.routes.js";
import appointmentsRouter from "./routes/appointments.routes.js";
import prestationsRouter from "./routes/prestations.routes.js";
import clientsRouter from "./routes/clients.routes.js";
import portfolioRouter from "./routes/portfolio.routes.js";
import reviewsRouter from "./routes/reviews.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import caisseRouter from "./routes/caisse.routes.js";
import siteRouter from "./routes/site.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { startReminderJob } from "./jobs/reminders.js";
const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.set("trust proxy", true);

// middleware
app.use(
  cors({
    credentials: true,
    origin: new RegExp(process.env.CORS_ORIGIN || "http://localhost:5173"),
  }),
);

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// photos are sent as compressed data URLs
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "L'Empire Barber API is running" });
});
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/services", servicesRouter);
app.use("/appointments", appointmentsRouter);
app.use("/prestations", prestationsRouter);
app.use("/clients", clientsRouter);
app.use("/portfolio", portfolioRouter);
app.use("/reviews", reviewsRouter);
app.use("/notifications", notificationsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/caisse", caisseRouter);
app.use("/site", siteRouter);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  startReminderJob();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
