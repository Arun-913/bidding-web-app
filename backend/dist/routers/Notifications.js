"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Users_1 = __importDefault(require("../middlewares/Users"));
const Notifications_1 = require("../controllers/Notifications");
const router = (0, express_1.Router)();
// Retrieve notifications for the logged-in user.
router.get('/', Users_1.default, Notifications_1.handleLoggedInUserNotification);
// Marking notifications as read
router.post('/mark-read', Users_1.default, Notifications_1.handleMarkNotificationAsRead);
exports.default = router;
