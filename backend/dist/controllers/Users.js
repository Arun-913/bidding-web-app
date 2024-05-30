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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResetPassword = exports.handleGetUserProfile = exports.handleExistingUser = exports.handleNewUser = void 0;
const db_1 = require("../db");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerValidationSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
    email: zod_1.z.string().email(),
    role: zod_1.z.string()
});
const loginValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const resetPasswordValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    oldPassword: zod_1.z.string(),
    newPassword: zod_1.z.string(),
});
const handleNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email, role } = req.body;
    try {
        const validatedData = registerValidationSchema.parse({ username, password, email, role });
    }
    catch (error) {
        return res.status(401).json(error);
    }
    const existingUser = yield db_1.prismaClient.users.findFirst({
        where: {
            email
        }
    });
    if (!existingUser) {
        const newUser = yield db_1.prismaClient.users.create({
            data: {
                username,
                password: password,
                email,
                role
            }
        });
        const authToken = jsonwebtoken_1.default.sign({
            userId: newUser.id,
            email,
            role
        }, process.env.JWT_AUTH_SECRET);
        res.json({
            authToken
        });
    }
    else {
        res.status(401).json({
            message: 'User already exist, please login'
        });
    }
});
exports.handleNewUser = handleNewUser;
const handleExistingUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const validatedData = loginValidationSchema.parse({ email, password });
    }
    catch (error) {
        return res.status(401).json(error);
    }
    const existingUser = yield db_1.prismaClient.users.findFirst({
        where: {
            email
        }
    });
    if (existingUser) {
        if (existingUser.password != password) {
            return res.status(401).json({
                message: 'Password is incorrect'
            });
        }
        const authToken = jsonwebtoken_1.default.sign({
            userId: existingUser.id,
            email,
            role: existingUser.role,
        }, process.env.JWT_AUTH_SECRET);
        res.json({
            authToken
        });
    }
    else {
        res.status(404).json({
            message: 'User does not exist, please register'
        });
    }
});
exports.handleExistingUser = handleExistingUser;
const handleGetUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = yield db_1.prismaClient.users.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.handleGetUserProfile = handleGetUserProfile;
const handleResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, oldPassword, newPassword } = req.body;
    try {
        const validatedData = resetPasswordValidationSchema.parse({ email, oldPassword, newPassword });
    }
    catch (error) {
        return res.status(401).json(error);
    }
    const existingUser = yield db_1.prismaClient.users.findFirst({
        where: {
            email,
        }
    });
    if (existingUser) {
        if (existingUser.password !== oldPassword) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }
        yield db_1.prismaClient.users.update({
            where: {
                email
            },
            data: {
                password: newPassword
            }
        });
        res.json({ message: "Password reset successfully" });
    }
    else {
        res.status(401).json({ message: "User does not found, please register" });
    }
});
exports.handleResetPassword = handleResetPassword;
