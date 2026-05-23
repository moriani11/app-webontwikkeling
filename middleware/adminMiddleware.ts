import { NextFunction, Request, Response } from "express";

export function adminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if(req.session.user?.role === "ADMIN") {
        next();
    } else {
        res.redirect("/");
    }
}