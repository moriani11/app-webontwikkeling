import express from "express";
import { login, register } from "../database";
import { User } from "../types";

const router = express.Router();


router.get("/register", async (req, res) => {
    if (req.session.user) {
        return res.redirect("/players");
    }
    res.render("register", { message: res.locals.message });
});


router.post("/register", async (req, res) => {
    const username: string = req.body.username;
    const password: string = req.body.password;
    try {
        await register(username, password);
        req.session.message = { type: "success", message: "Registratie geslaagd. Log nu in." };
        res.redirect("/login");
    } catch (e: any) {
        req.session.message = { type: "error", message: e.message };
        res.redirect("/register");
    }
});



router.get("/login", async (req, res) => {
    if (req.session.user) {
        return res.redirect("/players");
    }
    res.render("login", { message: res.locals.message });
});


router.post("/login", async (req, res) => { 
    const username: string = req.body.username;
    const password: string = req.body.password;
    try {
        let user: User = await login(username, password);
        delete (user as any).password;
        req.session.user = user;
        req.session.message = { type: "success", message: "Login geslaagd" };
        res.redirect("/players");
    } catch (e: any) {
        req.session.message = { type: "error", message: e.message };
        res.redirect("/login");
    }
});


router.post("/logout", async (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

export default router;
