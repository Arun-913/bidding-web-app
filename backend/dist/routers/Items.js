"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
const express_1 = require("express");
const Users_1 = __importDefault(require("../middlewares/Users"));
const multer_1 = __importDefault(require("multer"));
const Items_1 = require("../controllers/Items");
const Bids_1 = require("../controllers/Bids");
const prismaClient = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Retrieving all the auction item with pagination
router.get('/', Items_1.handleRetrieveAllItems);
// Retrieving a single auction item by ID
router.get('/:id', Items_1.handleRetrieveSingleItem);
// function for the file upload
const storage = multer_1.default.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
// creating a new auction item
router.post('/', Users_1.default, upload.any(), Items_1.handleCreateAuction);
// Updating an auction by id
router.put('/:id', Users_1.default, Items_1.handleUpdateAuctionById);
// Deleting an auction by Id
router.delete('/:id', Users_1.default, Items_1.handleDeleteAuctionById);
// Retrieving all bids for a specific items
router.get('/:itemId/bids', Bids_1.handleGetAllBids);
// placing a new bid on a specific item
router.post('/:itemId/bids', Users_1.default, Bids_1.handleCreateNewBid);
exports.default = router;
