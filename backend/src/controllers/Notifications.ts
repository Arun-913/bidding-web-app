import { Request, Response } from "express";
import { prismaClient } from "../db";
import { AuthenticatedRequest } from "../middlewares/Users";


export const handleLoggedInUserNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        
        const notifications = await prismaClient.notifications.findMany({
            where: { user_id: userId },
        });

        res.json({ notifications });
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const handleMarkNotificationAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { notificationIds } = req.body;
    
        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({ message: 'Invalid request. Notification IDs array is required.' });
        }
    
        await prismaClient.notifications.updateMany({
            where: { id: { in: notificationIds }, user_id: userId },
            data: { is_read: true },
        });
    
        res.status(204).send();
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}