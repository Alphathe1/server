import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { StatusCodes } from "http-status-codes";
export async function register(req, res, next) {
    const user = req.body;
    try {
        const createdUser = await User.create(user);
        const token = jwt.sign({ id: createdUser._id.toString(), role: createdUser.role }, process.env.AUTH_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRY || "3d",
        });
        const userObj = createdUser.toObject();
        delete userObj.password;
        successResponse(res, userObj, "Registration successful", StatusCodes.CREATED, token);
    }
    catch (error) {
        next(error);
    }
}
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            errorResponse(res, "Invalid email or password", StatusCodes.UNAUTHORIZED);
            return;
        }
        const valid = await user.comparePassword(password);
        if (!valid) {
            errorResponse(res, "Invalid email or password", StatusCodes.UNAUTHORIZED);
            return;
        }
        if (!user.isActive) {
            errorResponse(res, "This account has been disabled", StatusCodes.FORBIDDEN);
            return;
        }
        const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.AUTH_SECRET, {
            expiresIn: process.env.TOKEN_EXPIRY || "3d",
        });
        const userObj = user.toObject();
        delete userObj.password;
        successResponse(res, userObj, "Login successful", StatusCodes.OK, token);
    }
    catch (err) {
        next(err);
    }
}
export async function updateProfile(req, res, next) {
    try {
        const updates = { ...req.body };
        // only barbers manage specialties and schedule
        if (req.user?.role !== "barber") {
            delete updates.specialties;
            delete updates.workingHours;
        }
        const user = await User.findByIdAndUpdate(req.user?._id, updates, {
            new: true,
            runValidators: true,
        }).select("-password");
        successResponse(res, user, "Profile updated");
    }
    catch (error) {
        next(error);
    }
}
export async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user?._id);
        if (!user || !(await user.comparePassword(currentPassword))) {
            errorResponse(res, "Current password is incorrect", StatusCodes.BAD_REQUEST, "currentPassword");
            return;
        }
        user.password = newPassword;
        await user.save();
        successResponse(res, null, "Password updated");
    }
    catch (error) {
        next(error);
    }
}
export async function checkUser(req, res, next) {
    const user = req.user;
    try {
        if (!user) {
            throw new Error("User not found");
        }
        successResponse(res, user, "User is authenticated");
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map