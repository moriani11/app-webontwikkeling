import dotenv from "dotenv";
dotenv.config();

import express from "express";
import playersRoutes from "./routes/players";
import teamsRoutes from "./routes/teams";
import { connect } from "./database";
import session from "./sessions";
import authRoutes from "./routes/auth";
import { flashMiddleware } from "./middleware/flashMiddleware";

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(flashMiddleware);

app.use(authRoutes);
app.use("/players", playersRoutes);
app.use("/teams", teamsRoutes);

app.get("/", (req, res) => {
  res.redirect("/players");
});

connect().then(() => {
  app.listen(3001, () => {
    console.log("Server runt op http://localhost:3001 !");
  });
});