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
exports.handleMarkNotificationAsRead = exports.handleLoggedInUserNotification = void 0;
const db_1 = require("../db");
const handleLoggedInUserNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const notifications = yield db_1.prismaClient.notifications.findMany({
            where: { user_id: userId },
        });
        res.json({ notifications });
    }
    catch (error) {
        console.error('Error retrieving notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleLoggedInUserNotification = handleLoggedInUserNotification;
const handleMarkNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { notificationIds } = req.body;
        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({ message: 'Invalid request. Notification IDs array is required.' });
        }
        yield db_1.prismaClient.notifications.updateMany({
            where: { id: { in: notificationIds }, user_id: userId },
            data: { is_read: true },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleMarkNotificationAsRead = handleMarkNotificationAsRead;
