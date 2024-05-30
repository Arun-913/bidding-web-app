import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import {Router, Request, Response} from 'express';
import authMiddleware, { AuthenticatedRequest } from '../middlewares/Users';
import { z } from 'zod';
import multer from 'multer';
import { handleCreateAuction, handleDeleteAuctionById, handleRetrieveAllItems, handleRetrieveSingleItem, handleUpdateAuctionById } from '../controllers/Items';
import { handleCreateNewBid, handleGetAllBids } from '../controllers/Bids';

const prismaClient = new PrismaClient();

const router = Router();
  
// Retrieving all the auction item with pagination
router.get('/', handleRetrieveAllItems);

// Retrieving a single auction item by ID
router.get('/:id', handleRetrieveSingleItem);

// function for the file upload
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// creating a new auction item
router.post('/', authMiddleware, upload.any(), handleCreateAuction);

// Updating an auction by id
router.put('/:id', authMiddleware, handleUpdateAuctionById);

// Deleting an auction by Id
router.delete('/:id', authMiddleware, handleDeleteAuctionById);

// Retrieving all bids for a specific items
router.get('/:itemId/bids', handleGetAllBids);

// placing a new bid on a specific item
router.post('/:itemId/bids', authMiddleware, handleCreateNewBid);

export default router;