"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = require("express");
const Users_1 = __importDefault(require("../middlewares/Users"));
const Users_2 = require("../controllers/Users");
const ResetPassword_1 = require("../middlewares/ResetPassword");
const router = (0, express_1.Router)();
// handle new user
router.post('/register', Users_2.handleNewUser);
// handle existing user
router.post('/login', Users_2.handleExistingUser);
// get the logged in user profile
router.get('/profile', Users_1.default, Users_2.handleGetUserProfile);
router.get('/password/reset', ResetPassword_1.passwordResetLimiter, Users_2.handleResetPassword);
exports.default = router;
