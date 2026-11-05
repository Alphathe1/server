import { model, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
export const DEFAULT_HOURS = [1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    start: "09:00",
    end: "19:00",
}));
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["owner", "manager", "barber", "client"],
        default: "client",
    },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    bio: { type: String },
    specialties: [{ type: String, trim: true }],
    workingHours: [
        {
            _id: false,
            day: { type: Number, min: 0, max: 6, required: true },
            start: { type: String, required: true },
            end: { type: String, required: true },
        },
    ],
    commissionRate: { type: Number, min: 0, max: 1, default: 0.5 },
    preferences: { type: String },
    staffNotes: { type: String },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    // Include virtuals when converting to JSON (API responses) or plain objects
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.virtual("isAdmin").get(function () {
    return this.role === "owner" || this.role === "manager";
});
userSchema.pre("save", async function () {
    if (this.isNew && this.role === "barber" && !this.workingHours?.length) {
        this.workingHours = DEFAULT_HOURS;
    }
    if (this.isNew || this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});
userSchema.methods.comparePassword = async function (requestedPassword) {
    return bcrypt.compare(requestedPassword, this.password);
};
export const User = model("User", userSchema);
//# sourceMappingURL=user.model.js.map