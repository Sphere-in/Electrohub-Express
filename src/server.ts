
import { httpServerHandler } from "cloudflare:node";
import express, { Request, Response } from "express";
import cors from "cors";

import sellerRoutes from "../routes/seller";
import buyerRoutes from "../routes/buyer";
import dashboardRoutes from "../routes/dashboard";

const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://electrohub.web-crafters.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, ElectroHub API is running on Cloudflare Workers!");
});

// Routes
app.use("/admin/sellers", sellerRoutes);
app.use("/admin/buyers", buyerRoutes);
app.use("/admin/dashboard", dashboardRoutes);

// Cloudflare Workers Express integration
app.listen(3000);

export default httpServerHandler({ port: 3000 });
