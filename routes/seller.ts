import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router()


// Route to get all sellers
type Seller = {
    id: number;
    name: string;
    email: string;
    address: string | null;
    pfp: string;
    phone: string | null;
};

router.get("/", async (req: Request, res: Response) => {
    try {
        const sellers = await prisma.seller.findMany({
            orderBy: {
              id: "asc", // Fetch in ascending order
            },
          });
        res.json(sellers);
    } catch (error) {
        console.error("Error fetching sellers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



router.get("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const sellerId = Number(id);
  
      // Fetch seller details
      const seller = await prisma.seller.findUnique({
        where: { id: sellerId },
        include: {
          products: true, // Get all products listed by the seller
        },
      });
  
      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }
  
      async function getSellerProductsWithReviews(sellerId: number) {
        try {
          // Fetch all products of the seller
          const products = await prisma.product.findMany({
            where: { seller: { id: sellerId } }, // Ensure proper relation-based filtering
            include: {
              reviews: { select: { rating: true } }, // Fetch only ratings
            },
          });
      
          // Calculate average rating for each product
          const productsWithAvgRatings = products.map((product) => {
            const totalReviews = product.reviews.length;
            const averageRating =
              totalReviews > 0
                ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                : 0;
      
            return {
              id: product.id,
              name: product.name,
              price: product.price,
            //   image: product.image,
              totalReviews,
              averageRating: averageRating.toFixed(2), // Round to 2 decimal places
            };
          });
      
          return productsWithAvgRatings;
        } catch (error) {
          console.error("Error fetching seller products & reviews:", error);
          throw new Error("Failed to fetch seller products and reviews");
        }
      }
  

  
      res.json({
        seller,
        // totalCompletedOrders: completedOrdersCount,
        getSellerProductsWithReviews,
        // averageRating: averageRating.toFixed(2),
        // totalReviews,
        products: seller.products, // List of products by seller
      });
    } catch (error) {
      console.error("Error fetching seller details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

export default router;
