import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js";
import { PortfolioItem } from "../models/portfolio.model.js";
import { Prestation } from "../models/prestation.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { withRefs } from "../utils/refs.js";

async function ratingsByBarber(ids: Types.ObjectId[]) {
  const rows = await Review.aggregate<{
    _id: Types.ObjectId;
    rating: number;
    count: number;
  }>([
    { $match: { barber: { $in: ids } } },
    {
      $group: {
        _id: "$barber",
        rating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r]));
}

/** GET /users — owner & manager */
export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { role, search } = req.query as { role?: string; search?: string };
    const filter: Record<string, unknown> = {};
    if (role) filter.role = { $in: role.split(",") };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ username: rx }, { email: rx }, { phone: rx }];
    }
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    successResponse(res, users);
  } catch (error) {
    next(error);
  }
}

/** POST /users — owner & manager create staff or clients */
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.body.role === "owner" && req.user?.role !== "owner") {
      errorResponse(res, "Only the owner can create owners", StatusCodes.FORBIDDEN);
      return;
    }
    const created = await User.create(req.body);
    const obj = created.toObject() as unknown as Record<string, unknown>;
    delete obj.password;
    successResponse(res, obj, "User created", StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
}

/** PATCH /users/:id */
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
      return;
    }
    const touchesOwner = user.role === "owner" || req.body.role === "owner";
    if (touchesOwner && req.user?.role !== "owner") {
      errorResponse(res, "Only the owner can edit owners", StatusCodes.FORBIDDEN);
      return;
    }
    // assign + save so the password hook runs
    Object.assign(user, req.body);
    await user.save();
    const obj = user.toObject() as unknown as Record<string, unknown>;
    delete obj.password;
    successResponse(res, obj, "User updated");
  } catch (error) {
    next(error);
  }
}

/** DELETE /users/:id — soft delete keeps history intact */
export async function deactivateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.params.id === req.user?._id.toString()) {
      errorResponse(res, "You can't deactivate yourself", StatusCodes.BAD_REQUEST);
      return;
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
      return;
    }
    if (user.role === "owner" && req.user?.role !== "owner") {
      errorResponse(res, "Only the owner can edit owners", StatusCodes.FORBIDDEN);
      return;
    }
    user.isActive = false;
    await user.save();
    successResponse(res, null, "User deactivated");
  } catch (error) {
    next(error);
  }
}

/** GET /users/barbers — public list with ratings */
export async function listBarbers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const barbers = await User.find({ role: "barber", isActive: true })
      .select("username avatarUrl bio specialties workingHours")
      .lean({ virtuals: false });
    const ratings = await ratingsByBarber(barbers.map((b) => b._id));
    const data = barbers.map((b) => {
      const r = ratings.get(b._id.toString());
      return {
        ...b,
        rating: r ? Math.round(r.rating * 10) / 10 : null,
        reviewCount: r?.count ?? 0,
      };
    });
    successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

/** GET /users/barbers/:id — public profile, portfolio and reviews */
export async function getBarber(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const barber = await User.findOne({
      _id: req.params.id,
      role: "barber",
    })
      .select("username avatarUrl bio specialties workingHours isActive")
      .lean({ virtuals: false });
    if (!barber) {
      errorResponse(res, "Barber not found", StatusCodes.NOT_FOUND);
      return;
    }
    const [portfolio, reviews, ratings, prestations] = await Promise.all([
      PortfolioItem.find({ barber: barber._id }).sort({ createdAt: -1 }),
      Review.find({ barber: barber._id })
        .populate("client", "username avatarUrl")
        .sort({ createdAt: -1 })
        .limit(50),
      ratingsByBarber([barber._id]),
      Prestation.countDocuments({ barber: barber._id }),
    ]);
    const r = ratings.get(barber._id.toString());
    successResponse(res, {
      ...barber,
      rating: r ? Math.round(r.rating * 10) / 10 : null,
      reviewCount: r?.count ?? 0,
      prestationCount: prestations,
      portfolio,
      reviews: withRefs(reviews, "client"),
    });
  } catch (error) {
    next(error);
  }
}
