import { httpServerHandler } from "cloudflare:node";
import express, { Express } from "express";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import testRoutes from "./routes/test.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user/index.js";
import sellerRoutes from "./routes/seller/index.js";
import adminRoutes from "./routes/admin/index.js";
import categoryRoutes from "./routes/cms/category.js";
import bannerCarouselRoutes from "./routes/cms/bannerCarousel.js";
import productCarouselRoutes from "./routes/cms/productCarousel.js";
import passport from "passport";
import contactRoutes from "./routes/contact.js";
import removebg from "./routes/seller/bg-remove.js";
import sendMail from "./routes/user/sendMail.js";
config();

const app: Express = express();

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const limiter = (req: any, res: any, next: any) => {
  const ip =
    (req.headers["cf-connecting-ip"] as string) ||
    req.ip ||
    "unknown";
  const now = Date.now();
  const windowMs = 2 * 60 * 1000; // 2 minutes
  const max = 200; // limit each IP to 200 requests per windowMs

  let record = requestCounts.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    requestCounts.set(ip, record);
  } else {
    record.count++;
  }

  if (record.count > max) {
    return res
      .status(429)
      .send("Too many requests from this IP, please try again later.");
  }
  next();
};

// Middlewares
const allowedOrigins = ["http://localhost:5173", "https://electrohubb.shop","https://www.electrohubb.shop", "*" ];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());
app.use(limiter);

// Api Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banner-carousels", bannerCarouselRoutes);
app.use("/api/product-carousels", productCarouselRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/remove-bg", removebg);
app.use("/api/sendmail", sendMail);

export default httpServerHandler(app);