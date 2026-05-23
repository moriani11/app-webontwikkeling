import { Router } from "express";
import { ObjectId } from "mongodb";
import { teamsCollection, playersCollection } from "../database";
import { secureMiddleware } from "../middleware/secureMiddleware";

const router = Router();

router.use(secureMiddleware);

router.get("/", async (req, res) => {
  const teams = await teamsCollection.find().toArray();

  const sort = (req.query.sort as string) || "name";
  const order = (req.query.order as string) || "asc";

  teams.sort((a: any, b: any) => {
    const valueA = (a[sort] || "").toString();
    const valueB = (b[sort] || "").toString();
    return order === "desc"
      ? valueB.localeCompare(valueA)
      : valueA.localeCompare(valueB);
  });

  res.render("teams", { teams, sort, order, user: req.session.user });
});

router.get("/:id", async (req, res) => {
  try {
    const team = await teamsCollection.findOne({
      _id: new ObjectId(req.params.id as string)
    });

    if (!team) {
      return res.status(404).send("Team niet gevonden");
    }

    const players = await playersCollection.find({ teamId: req.params.id }).toArray();

    res.render("teamsdetails", { team, players, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Er is iets fout gegaan");
  }
});

export default router;
