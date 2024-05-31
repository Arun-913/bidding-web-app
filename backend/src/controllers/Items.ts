import 'dotenv/config';
import { Request, Response} from 'express';
import { AuthenticatedRequest } from '../middlewares/Users';
import { z } from 'zod';
import multer from 'multer';

import { prismaClient } from "../db";

const ITEMS_PER_PAGE = 10;

const newAuctionValidationSchema = z.object({
    name: z.string(),
    description: z.string(),
    starting_price: z.number(),
    current_price: z.number(),
    image_url: z.string().optional(),
    end_time: z.date().optional(),
});

const updateAuctionValidationSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    starting_price: z.number().optional(),
    current_price: z.number().optional(),
    image_url: z.string().optional(),
    end_time: z.date().optional(),
});

export const handleRetrieveAllItems = async(req: Request, res: Response) =>{
    try {
        const page = parseInt(req.query.page as string) || 1;
        const offset = (page - 1) * ITEMS_PER_PAGE;
    
        const items = await prismaClient.items.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
        });
    
        const totalItems = await prismaClient.items.count();
    
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
        const pagination = {
            currentPage: page,
            totalPages,
            totalItems,
        };
    
        res.json({ items, pagination });
    } catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const handleRetrieveSingleItem = async(req:Request, res:Response) =>{
    try {
        const itemId = parseInt(req.params.id);
    
        const item = await prismaClient.items.findUnique({
            where: { id: itemId },
        });
    
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
    
        res.json(item);
    } catch (error) {
        console.error('Error retrieving item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const handleCreateAuction = async(req: AuthenticatedRequest, res: Response)=>{
    const {name, description, starting_price, current_price, end_time} = req.body;
    console.log("body: ", req.body);
    const image_url = req.file ? req.file.path : null;
    console.log("image: ", image_url);

    try {
        const validatedData = newAuctionValidationSchema.parse({
            name, 
            description, 
            starting_price: parseFloat(starting_price), 
            current_price: parseFloat(current_price), 
            // image_url, 
            // end_time: new Date(end_time)
        });
    } catch (error) {
        return res.status(401).json(error);
    }

    const newItem = await prismaClient.items.create({
        // @ts-ignore again check here
        data: {
          name,
          user_id: req.userId,
          description,
          starting_price: parseFloat(starting_price),
          current_price: parseFloat(starting_price), // Initialize current price to starting price
        //   image_url: image_url,
          end_time: new Date(),
          created_at: new Date(),
        },
    });

    res.json({
        message: "Auction Created successfully",
        newItem,
    });
}


export const handleUpdateAuctionById = async(req: AuthenticatedRequest, res:Response)=>{
    const { id } = req.params;
    const { userId, userRole } = req;
    const updateData = req.body;

    try {
        const validatedData = updateAuctionValidationSchema.parse(updateData);
    
        const item = await prismaClient.items.findUnique({
            where: { id: parseInt(id) },
        });
    
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if(item.user_id === userId || userRole === 'admin'){
            const updatedItem = await prismaClient.items.update({
                where: { id: parseInt(id) },
                data: validatedData,
            });
        
            res.json(updatedItem);
        }
        else{
            res.status(403).json({ message: 'You are not authorized to update this item' });
        }
    
        
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const handleDeleteAuctionById = async (req: AuthenticatedRequest, res: Response) => {
    const itemId = parseInt(req.params.id);
  
    if (!req.userId || !req.userRole) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
        const item = await prismaClient.items.findUnique({
            where: { id: itemId },
        });
    
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await prismaClient.bids.deleteMany({
            where: {
                item_id: itemId,
            }
        })

        if(item.user_id === req.userId || req.userRole === 'admin'){
            await prismaClient.items.delete({
                where: { id: itemId },
            });
        
            res.status(200).json({ message: 'Item deleted successfully' });
        }
        else{
            res.status(403).json({ message: 'Forbidden' });
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}