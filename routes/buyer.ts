import express, { Request, Response } from "express";
import { PrismaClient, User, Order, OrderItem } from "@prisma/client";


const prisma = new PrismaClient();
const router = express.Router();


router.get("/", async (req: Request, res: Response): Promise<void> => {
    console.log("Buyer API called");
    try {
        const buyers: User[] = await prisma.user.findMany({
            orderBy: {
                id: "asc"
            },
        });
        res.json(buyers);
    } catch (err) {
        console.error("Error Fetching Buyers", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    console.log("Individual Buyer API called");
    const { id } = req.params;
    const userId = Number(id);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        // Fetch orders for the user
        const orders = await prisma.order.findMany({
            where: { userId: userId }
        });

        // Fetch all order items related to the orders
        const orderItems = orders.length > 0
            ? await prisma.orderItem.findMany({
                where: { orderId: { in: orders.map(o => o.id) } }
            })
            : [];

        // Fetch cart for the user (User has only ONE cart due to unique constraint)
        const cart = await prisma.cart.findUnique({
            where: { userId: userId }
        });

        // Fetch cart items related to the cart
        const cartItems = cart
            ? await prisma.cartItem.findMany({
                where: { cartId: cart.id },
                include: { product: true } // Include product details
            })
            : [];

        // Fetch wishlist products
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: userId },
            include: { products: true } // Include wishlist products
        });

        // Send response
        res.json({
            user,
            orders,
            orderItems,
            cart,
            cartItems,
            wishlist
        });

    } catch (err) {
        console.error("Error fetching user data", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;
