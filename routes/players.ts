 import { Router } from "express";
import { ObjectId } from "mongodb";
import { playersCollection } from "../database";
import { secureMiddleware } from "../middleware/secureMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();

router.use(secureMiddleware);

function getSortValue(player: any, field: string): string {
  switch (field) {
    case "name": return player.name || "";
    case "age": return String(player.age || 0);
    case "birthDate": return player.birthDate || "";
    case "position": return player.position || "";
    case "hobbies": return (player.hobbies || []).join(", ");
    case "club": return player.team?.name || "";
    case "land": return player.team?.country || "";
    case "competitie": return player.team?.league || "";
    case "stadion": return player.team?.stadium || "";
    default: return "";
  }
}

router.get("/", async (req, res) => {
  let players = await playersCollection.find().toArray();

  const search = ((req.query.search as string) || "").toLowerCase();
  const sort = (req.query.sort as string) || "name";
  const order = (req.query.order as string) || "asc";

  if (search) {
    players = players.filter(p => p.name.toLowerCase().includes(search));
  }

  players.sort((a, b) => {
    const valueA = getSortValue(a, sort);
    const valueB = getSortValue(b, sort);
    return order === "desc"
      ? valueB.localeCompare(valueA)
      : valueA.localeCompare(valueB);
  });

  res.render("index", { players, search, sort, order, user: req.session.user });
});

router.get("/:id", async (req, res) => {
  try {
    const player = await playersCollection.findOne({
      _id: new ObjectId(req.params.id as string)
    });

    if (!player) {
      return res.status(404).send("Speler niet gevonden");
    }

    res.render("detail", { player, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Er is iets fout gegaan");
  }
});



router.get("/:id/edit", adminMiddleware, async (req, res) => {
  try {
    const player = await playersCollection.findOne({
      _id: new ObjectId(req.params.id as string)
    });

    if (!player) {
      return res.status(404).send("Speler niet gevonden");
    }

    res.render("update", { player, user: req.session.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Er is iets fout gegaan");
  }
});


router.post("/:id/edit", adminMiddleware, async (req, res) => {
  try {
    const { name, birthDate, position, imageUrl } = req.body;

    await playersCollection.updateOne(
      { _id: new ObjectId(req.params.id as string) },
      {
        $set: {
          name,
          birthDate,
          position,
          imageUrl
        }
      }
    );

    res.redirect(`/players/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Update mislukt");
  }
});


export default router;