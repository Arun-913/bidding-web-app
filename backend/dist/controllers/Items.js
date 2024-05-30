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
exports.handleDeleteAuctionById = exports.handleUpdateAuctionById = exports.handleCreateAuction = exports.handleRetrieveSingleItem = exports.handleRetrieveAllItems = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const db_1 = require("../db");
const ITEMS_PER_PAGE = 10;
const newAuctionValidationSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    starting_price: zod_1.z.number().refine(val => {
        return val % 1 !== 0;
    }, {
        message: 'Value must be a decimal',
    }),
    current_price: zod_1.z.number().refine(val => {
        return val % 1 !== 0;
    }, {
        message: 'Value must be a decimal',
    }),
    image_url: zod_1.z.string().optional(),
    end_time: zod_1.z.date().optional(),
});
const updateAuctionValidationSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    starting_price: zod_1.z.number().optional(),
    current_price: zod_1.z.number().optional(),
    image_url: zod_1.z.string().optional(),
    end_time: zod_1.z.date().optional(),
});
const handleRetrieveAllItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const items = yield db_1.prismaClient.items.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
        });
        const totalItems = yield db_1.prismaClient.items.count();
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const pagination = {
            currentPage: page,
            totalPages,
            totalItems,
        };
        res.json({ items, pagination });
    }
    catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleRetrieveAllItems = handleRetrieveAllItems;
const handleRetrieveSingleItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = parseInt(req.params.id);
        const item = yield db_1.prismaClient.items.findUnique({
            where: { id: itemId },
        });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Error retrieving item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleRetrieveSingleItem = handleRetrieveSingleItem;
const handleCreateAuction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, starting_price, current_price, end_time } = req.body;
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
    }
    catch (error) {
        return res.status(401).json(error);
    }
    const newItem = yield db_1.prismaClient.items.create({
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
});
exports.handleCreateAuction = handleCreateAuction;
const handleUpdateAuctionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId, userRole } = req;
    const updateData = req.body;
    console.log(userId, "  ", userRole);
    console.log(updateData);
    try {
        const validatedData = updateAuctionValidationSchema.parse(updateData);
        const item = yield db_1.prismaClient.items.findUnique({
            where: { id: parseInt(id) },
        });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (item.user_id === userId || userRole === 'admin') {
            const updatedItem = yield db_1.prismaClient.items.update({
                where: { id: parseInt(id) },
                data: validatedData,
            });
            res.json(updatedItem);
        }
        else {
            res.status(403).json({ message: 'You are not authorized to update this item' });
        }
    }
    catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleUpdateAuctionById = handleUpdateAuctionById;
const handleDeleteAuctionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const itemId = parseInt(req.params.id);
    if (!req.userId || !req.userRole) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const item = yield db_1.prismaClient.items.findUnique({
            where: { id: itemId },
        });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (item.user_id === req.userId || req.userRole === 'admin') {
            yield db_1.prismaClient.items.delete({
                where: { id: itemId },
            });
            res.status(200).json({ message: 'Item deleted successfully' });
        }
        else {
            res.status(403).json({ message: 'Forbidden' });
        }
    }
    catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleDeleteAuctionById = handleDeleteAuctionById;
