import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import sellerRoutes from "../routes/seller";
import buyerRoutes from "../routes/buyer"
import dashboardRoutes from "../routes/dashboard"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // Change this to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies and authentication headers if needed
  })
);


// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use("/admin/sellers", sellerRoutes);
app.use("/admin/buyers", buyerRoutes);
app.use("/admin/dashboard", dashboardRoutes)


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
