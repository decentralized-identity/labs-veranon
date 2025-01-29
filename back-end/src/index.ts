import express from "express";
import knex from "knex";
import config from "../knexfile";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const db = knex(config);
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined in environment variables');
}

// **User Registration**
app.post("/register", async (req: express.Request, res: express.Response): Promise<void> => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "Missing fields" });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db('users').insert({
            username,
            password: hashedPassword
        });
        res.status(201).json({ message: "User created successfully" });
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ message: "Username already exists" });
            return;
        }
        res.status(500).json({ message: "Internal server error" });
    }
});

// **User Login**
app.post("/login", async (req: express.Request, res: express.Response): Promise<void> => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "Missing fields" });
        return;
    }

    const user = await db('users')
        .where('username', username)
        .first();

    if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// **Protected Route**
app.get("/protected", (req: express.Request, res: express.Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: "You have access!", user: decoded });
    } catch {
        res.status(403).json({ message: "Invalid token" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
