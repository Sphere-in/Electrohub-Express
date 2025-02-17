import express, { Request, Response } from "express";
const router = express.Router();

const orderChartData = [
    { date: "Jan 1", amount: 12500 },
    { date: "Jan 5", amount: 8900 },
    { date: "Jan 10", amount: 15600 },
    { date: "Jan 15", amount: 9800 },
    { date: "Jan 20", amount: 13200 },
    { date: "Jan 25", amount: 11400 },
    { date: "Jan 30", amount: 14500 },
    { date: "Feb 5", amount: 16800 },
    { date: "Feb 10", amount: 12300 },
    { date: "Feb 15", amount: 10900 }
];

router.get("/ordervalues", async (req: Request, res: Response) => {
    res.json(orderChartData);
});

export default router;