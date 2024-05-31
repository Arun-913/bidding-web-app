import { prismaClient } from "../db";
import { z } from 'zod';
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/Users";

const registerValidationSchema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string().email(),
    role: z.string()
});

const loginValidationSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const resetPasswordValidationSchema = z.object({
    email: z.string().email(),
    oldPassword: z.string(),
    newPassword: z.string(),
});


export const handleNewUser = async(req: Request, res: Response) =>{
    const {username, password, email, role} = req.body;
    try{
        const validatedData = registerValidationSchema.parse({username, password, email, role});
    }
    catch(error){
        return res.status(401).json(error);
    }

    const existingUser = await prismaClient.users.findFirst({
        where:{
            email
        }
    });

    if(!existingUser){
        const newUser = await prismaClient.users.create({
            data:{
                username,
                password: password,
                email,
                role
            }
        });

        const authToken = jwt.sign({
            userId: newUser.id,
            email,
            role
        }, process.env.JWT_AUTH_SECRET as string);

        res.json({
            authToken
        });
    }
    else{
        res.status(401).json({
            message: 'User already exist, please login'
        });
    }
}


export const handleExistingUser = async(req: Request, res: Response) =>{
    const {email, password} = req.body;
    try{
        const validatedData = loginValidationSchema.parse({email, password});
    } catch (error) {
        return res.status(401).json(error);
    }

    const existingUser = await prismaClient.users.findFirst({
        where:{
            email
        }
    });

    if(existingUser){
        if(existingUser.password != password){
            return res.status(401).json({
                message: 'Password is incorrect'
            });
        }

        const authToken = jwt.sign({
            userId: existingUser.id,
            email,
            role: existingUser.role,
        }, process.env.JWT_AUTH_SECRET as string);

        res.json({
            authToken
        });
    }
    else{
        res.status(404).json({
            message: 'User does not exist, please register'
        });
    }
}

export const handleGetUserProfile = async(req: AuthenticatedRequest, res: Response)=>{
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const user = await prismaClient.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const handleResetPassword = async(req: Request, res: Response)=>{
    const {email, oldPassword, newPassword} = req.body;

    try{
        const validatedData = resetPasswordValidationSchema.parse({email, oldPassword, newPassword});
    } catch (error) {
        return res.status(401).json(error);
    }

    const existingUser = await prismaClient.users.findFirst({
        where:{
            email,
        }
    });

    if(existingUser){
        if(existingUser.password !== oldPassword){
            return res.status(401).json({message: "Old password is incorrect"});
        }

        await prismaClient.users.update({
            where: {
                email
            },
            data: {
                password: newPassword
            }
        });

        res.json({message: "Password reset successfully"});
    }else{
        res.status(401).json({message: "User does not found, please register"});
    }
}