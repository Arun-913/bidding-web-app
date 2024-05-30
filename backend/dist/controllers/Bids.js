"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateNewBid = exports.handleGetAllBids = void 0;
const db_1 = require("../db");
const zod_1 = require("zod");
const newBidValidationSchema = zod_1.z.object({
    bid_amount: zod_1.z.number().positive(),
});
const handleGetAllBids = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }
    try {
        const bids = yield db_1.prismaClient.bids.findMany({
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
    }
    catch (error) {
        console.error('Error retrieving bids:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleGetAllBids = handleGetAllBids;
const handleCreateNewBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bid_amount } = req.body;
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }
    try {
        const validatedData = newBidValidationSchema.parse({ bid_amount });
        const item = yield db_1.prismaClient.items.findUnique({
            where: { id: itemId },
        });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (bid_amount <= parseFloat(item.current_price.toString())) {
            return res.status(400).json({ message: 'Bid amount must be higher than the current price' });
        }
        const newBid = yield db_1.prismaClient.bids.create({
            data: {
                item_id: itemId,
                user_id: req.userId,
                bid_amount: validatedData.bid_amount,
                created_at: new Date(),
            },
        });
        yield db_1.prismaClient.items.update({
            where: { id: itemId },
            data: { current_price: validatedData.bid_amount },
        });
        res.status(201).json({ newBid });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation error', details: error.errors });
        }
        console.error('Error placing bid:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleCreateNewBid = handleCreateNewBid;
