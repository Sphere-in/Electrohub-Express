import express, { Request, Response } from "express";
import prisma from "../src/prisma";

const app = express();
app.use(express.json());

app.get("/users", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(5000, () => console.log("Server running on port 5000"));
