import { Collection, MongoClient, ObjectId } from "mongodb";
import { Player, User, Team } from "./types";
import bcrypt from 'bcrypt';

const saltRounds : number = 10;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);
export const playersCollection: Collection<Player> = client.db("Footballdb").collection<Player>("players");
export const teamsCollection: Collection<Team> = client.db("Footballdb").collection<Team>("teams");
export const userCollection : Collection<User> = client.db("usersFootball").collection<User>("usersFootball");

async function exit() {
    try {
        await client.close();
        console.log('Disconnected from database');
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

async function createInitialUsers() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error("ADMIN_EMAIL en ADMIN_PASSWORD moeten in .env staan");
    }
    if (!userEmail || !userPassword) {
        throw new Error("USER_EMAIL en USER_PASSWORD moeten in .env staan");
    }

    await userCollection.insertOne({
        username: adminEmail,
        password: await bcrypt.hash(adminPassword, saltRounds),
        role: "ADMIN"
    });

    await userCollection.insertOne({
        username: userEmail,
        password: await bcrypt.hash(userPassword, saltRounds),
        role: "USER"
    });
}

export async function FetchPlayers():Promise<Player[]>{
     try {
        const response = await fetch("https://raw.githubusercontent.com/moriani11/dataset-project-webontwikkeling/refs/heads/main/json/players.json");

        const players: Player[] = await response.json();
        return players;
    }
    catch(error){
        console.error(error);
        return [];
    }
    
}

async function seed() {
    await playersCollection.deleteMany({});
    await teamsCollection.deleteMany({});
    console.log("Database geleegd");

    const players = await FetchPlayers();

    const teams: any[] = [];
    for (const player of players) {
        const alreadyAdded = teams.some(t => t.name === player.team?.name);
        if (player.team && !alreadyAdded) {
            teams.push(player.team);
        }
    }

    if (teams.length > 0) {
        const result = await teamsCollection.insertMany(teams);
        for (let i = 0; i < teams.length; i++) {
            teams[i]._id = result.insertedIds[i];
        }
        console.log("Teams opgeslagen");
    }

    for (const player of players) {
        const team = teams.find(t => t.name === player.team?.name);
        if (team) {
            player.teamId = team._id.toString();
        }
    }

    await playersCollection.insertMany(players);
    console.log("Spelers opgeslagen");
}

export async function GetPlayers() {
    return await playersCollection.find().toArray();
}

export async function GetTeams() {
    return await teamsCollection.find().toArray();
}

export async function GetTeamById(id: string) {
    return await teamsCollection.findOne({ _id: new ObjectId(id) });
}

export async function register(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("Gebruikersnaam en wachtwoord zijn verplicht");
    }
    let existingUser = await userCollection.findOne<User>({username: username});
    if (existingUser) {
        throw new Error("Gebruikersnaam bestaat al");
    }
    await userCollection.insertOne({
        username: username,
        password: await bcrypt.hash(password, saltRounds),
        role: "USER"
    });
}

export async function login(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("Gebruikersnaam en wachtwoord zijn verplicht");
    }
    let user : User | null = await userCollection.findOne<User>({username: username});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Wachtwoord is onjuist");
        }
    } else {
        throw new Error("Gebruiker niet gevonden");
    }
}
export async function connect() {
    try {
        await client.connect();
        await seed();
        await createInitialUsers();
        console.log('Connected to database');
        process.on('SIGINT', exit);
    } catch (error) {
        console.error(error);
    }
}