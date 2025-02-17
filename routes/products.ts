import express, { Request, Response } from "express";
import { PrismaClient, User, Order, OrderItem } from "@prisma/client";


const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req: Request, res: Response)=>{
    
})