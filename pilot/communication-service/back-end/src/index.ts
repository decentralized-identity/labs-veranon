import express from "express";
import knex from "knex";
import config from "../knexfile";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import { SubgraphService } from "../utils/subgraph";

dotenv.config();
const app = express();
const db = knex(config);
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined in environment variables');
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
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
        const [userId] = await db('users').insert({
            username,
            password: hashedPassword
        }).returning('id');

        const token = jwt.sign(
            { userId: userId.id, username: username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            message: "User created successfully",
            token: token
        });
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

// Authentication Middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ message: "Invalid token" });
        return;
    }
};

// Verification Middleware - to be used after authenticateToken
const requireVerified = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    try {
        const user = await db('users')
            .where('id', req.user.userId)
            .first();

        if (!user?.verified) {
            res.status(403).json({ message: "Account not verified" });
            return;
        }

        next();
    } catch (error) {
        console.error('Verification check failed:', error);
        res.status(500).json({ message: "Error checking verification status" });
        return;
    }
};

// Protected Route using middleware
app.get("/protected", authenticateToken, (req: express.Request, res: express.Response) => {
    res.json({ user: req.user });
});

app.get("/verify", authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
    const subgraphService = new SubgraphService();
    const { serviceProviderId, accountId } = req.query;

    if (!serviceProviderId || !accountId) {
        res.status(400).json({ 
            message: "Missing serviceProviderId or accountId parameter",
            isVerified: false 
        });
        return;
    }

    try {
        // Check if user is already verified in database
        const user = await db('users')
            .where('id', req.user.userId)
            .first();

        if (user?.verified) {
            res.json({
                isVerified: true,
                verificationTime: user.verificationTime
            });
            return;
        }


        // If not verified in database, check subgraph
        const verificationStatus = await subgraphService.isUserAccountVerified(
            parseInt(serviceProviderId.toString()),
            parseInt(accountId.toString())
        );

        if (verificationStatus.isVerified) {
            // Update database with verification status
            await db('users')
                .where('id', req.user.userId)
                .update({ 
                    verified: true,
                    verificationTime: verificationStatus.verificationTime
                });
        }

        res.json({
            isVerified: verificationStatus.isVerified,
            verificationTime: verificationStatus.verificationTime
        });
    } catch (error) {
        console.error('Verification check failed:', error);
        res.status(500).json({ 
            message: "Error checking verification status",
            isVerified: false 
        });
    }
});

// Get messages
app.get("/messages", authenticateToken, requireVerified, async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        const messages = await db('messages')
            .join('users', 'messages.user_id', 'users.id')
            .select('messages.*', 'users.username')
            .orderBy('messages.created_at', 'desc')
            .limit(20);
            
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: "Error fetching messages" });
    }
});

// Post message
app.post("/messages", authenticateToken, requireVerified, async (req: express.Request, res: express.Response): Promise<void> => {
    const { content } = req.body;
    
    try {
        const [message] = await db('messages').insert({
            user_id: req.user.userId,
            content
        }).returning(['id', 'content', 'created_at']);

        res.status(201).json(message);
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ message: "Error posting message" });
    }
});

app.listen(3000, "0.0.0.0", () => console.log("Server running on port 3000"));
