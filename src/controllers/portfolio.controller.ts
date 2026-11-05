import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { PortfolioItem } from "../models/portfolio.model.js";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { withRefs } from "../utils/refs.js";

/** GET /portfolio?barber&cutType — public gallery */
export async function listPortfolio(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { barber, cutType } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = {};
    if (barber) filter.barber = barber;
    if (cutType) filter.cutType = cutType;
    const [items, cutTypes] = await Promise.all([
      PortfolioItem.find(filter)
        .populate("barber", "username avatarUrl")
        .sort({ createdAt: -1 })
        .limit(200),
      PortfolioItem.distinct("cutType", barber ? { barber } : {}),
    ]);
    successResponse(res, { items: withRefs(items, "barber"), cutTypes });
  } catch (error) {
    next(error);
  }
}

/** POST /portfolio — barbers add to their own gallery */
export async function createPortfolioItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user!;
    const barber = user.role === "barber" ? user._id : req.body.barber;
    if (!barber) {
      errorResponse(res, "Barber is required", StatusCodes.BAD_REQUEST, "barber");
      return;
    }
    const item = await PortfolioItem.create({ ...req.body, barber });
    await item.populate("barber", "username avatarUrl");
    successResponse(res, item, "Photo added", StatusCodes.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function deletePortfolioItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const item = await PortfolioItem.findById(req.params.id);
    const user = req.user!;
    if (
      !item ||
      (!user.isAdmin && item.barber.toString() !== user._id.toString())
    ) {
      errorResponse(res, "Photo not found", StatusCodes.NOT_FOUND);
      return;
    }
    await item.deleteOne();
    successResponse(res, null, "Photo deleted");
  } catch (error) {
    next(error);
  }
}
