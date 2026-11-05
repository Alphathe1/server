import { StatusCodes } from "http-status-codes";
import { Review } from "../models/review.model.js";
import { Appointment } from "../models/appointment.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { withRefs } from "../utils/refs.js";
import { notify } from "../utils/notify.js";
/** GET /reviews?barber — public */
export async function listReviews(req, res, next) {
    try {
        const { barber } = req.query;
        const reviews = await Review.find(barber ? { barber } : {})
            .populate("client", "username avatarUrl")
            .populate("barber", "username avatarUrl")
            .sort({ createdAt: -1 })
            .limit(100);
        successResponse(res, withRefs(reviews, "client", "barber"));
    }
    catch (error) {
        next(error);
    }
}
/** POST /reviews — a client rates the barber of a completed appointment */
export async function createReview(req, res, next) {
    try {
        const user = req.user;
        const { appointment, rating, comment } = req.body;
        const appt = await Appointment.findOne({
            _id: appointment,
            client: user._id,
        });
        if (!appt) {
            errorResponse(res, "Appointment not found", StatusCodes.NOT_FOUND);
            return;
        }
        if (appt.status !== "completed") {
            errorResponse(res, "You can only review completed appointments", StatusCodes.BAD_REQUEST);
            return;
        }
        if (appt.reviewed) {
            errorResponse(res, "You already reviewed this appointment", StatusCodes.CONFLICT);
            return;
        }
        const review = await Review.create({
            client: user._id,
            barber: appt.barber,
            appointment: appt._id,
            rating,
            ...(comment ? { comment } : {}),
        });
        appt.reviewed = true;
        await appt.save();
        await notify([appt.barber], {
            type: "review",
            title: "Nouvel avis",
            message: `${user.username} vous a donné ${rating}/5`,
            link: "/dashboard/reviews",
        });
        await review.populate("client", "username avatarUrl");
        successResponse(res, review, "Thanks for your review", StatusCodes.CREATED);
    }
    catch (error) {
        next(error);
    }
}
export async function deleteReview(req, res, next) {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            errorResponse(res, "Review not found", StatusCodes.NOT_FOUND);
            return;
        }
        await Appointment.findByIdAndUpdate(review.appointment, { reviewed: false });
        successResponse(res, null, "Review deleted");
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=reviews.controller.js.map