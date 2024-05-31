import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt,{JwtPayload} from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
}

type jwtDecodedSchema=  {
    userId: number,
    email: string,
    role: string,
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_AUTH_SECRET as string);

        if (typeof decoded !== 'string' && (decoded as JwtPayload).userId && (decoded as JwtPayload).role) {
            const decodedSchema = decoded as jwtDecodedSchema;
            req.userId = decodedSchema.userId;
            req.userRole = decodedSchema.role;
            next();
        } else {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
    } catch (error) {
        console.log('Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;
