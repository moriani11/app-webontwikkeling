import { NextFunction, Request, Response } from "express";
import { FlashMessage } from "../types";

export function flashMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.message) {
        res.locals.message = req.session.message as FlashMessage;
        delete req.session.message;
    } else {
        res.locals.message = undefined;
    }
    next();
}
