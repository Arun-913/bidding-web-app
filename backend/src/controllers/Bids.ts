import { Request, Response } from "express";
import { prismaClient } from "../db";
import { AuthenticatedRequest } from "../middlewares/Users";
import { z } from 'zod';

const newBidValidationSchema = z.object({
    bid_amount: z.number().positive(),
});


export const handleGetAllBids = async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.itemId);
  
    if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }
  
    try {
        const bids = await prismaClient.bids.findMany({
            where: { item_id: itemId },
            select: {
                id: true,
                user_id: true,
                bid_amount: true,
                created_at: true,
            },
        });
    
        if (bids.length === 0) {
            return res.status(404).json({ message: 'No bids found for this item' });
        }
    
        res.json({ bids });
    } catch (error) {
        console.error('Error retrieving bids:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const handleCreateNewBid = async (req: AuthenticatedRequest, res: Response) => {
    const { bid_amount } = req.body;
    const itemId = parseInt(req.params.itemId);
  
    if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }
  
    try {
        const validatedData = newBidValidationSchema.parse({ bid_amount });
    
        const item = await prismaClient.items.findUnique({
            where: { id: itemId },
        });
    
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
    
        if (bid_amount <= parseFloat(item.current_price.toString())) {
            return res.status(400).json({ message: 'Bid amount must be higher than the current price' });
        }
    
        const newBid = await prismaClient.bids.create({
            data: {
                item_id: itemId,
                user_id: req.userId!,
                bid_amount: validatedData.bid_amount,
                created_at: new Date(),
            },
        });
  
        await prismaClient.items.update({
            where: { id: itemId },
            data: { current_price: validatedData.bid_amount },
        });
  
        res.status(201).json({ newBid });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', details: error.errors });
        }
        console.error('Error placing bid:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};