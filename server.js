const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// --- Data paths ---
const USERS_FILE = path.join(__dirname, "data", "users.json");
const INVITES_FILE = path.join(__dirname, "data", "invites.json");

// --- Load JSON helpers ---
function loadJSON(file) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(file));
}
function saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- Hash password ---
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// --- API Routes ---

// Register
app.post("/api/register", (req, res) => {
    const { username, password, invite } = req.body;
    if (!username || !password || !invite)
        return res.status(400).json({ error: "All fields required." });

    const users = loadJSON(USERS_FILE);
    const invites = loadJSON(INVITES_FILE);

    if (users[username]) return res.status(400).json({ error: "Username already taken." });
    if (!invites[invite] && invites[invite] !== null) return res.status(400).json({ error: "Invalid or used invite key." });

    users[username] = hashPassword(password);
    invites[invite] = username;

    saveJSON(USERS_FILE, users);
    saveJSON(INVITES_FILE, invites);

    res.json({ success: true });
});

// Login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "All fields required." });

    const users = loadJSON(USERS_FILE);
    if (!users[username] || users[username] !== hashPassword(password))
        return res.status(400).json({ error: "Incorrect username or password." });

    res.json({ success: true });
});

// Admin: get users
app.get("/api/admin/users", (req, res) => {
    const users = loadJSON(USERS_FILE);
    res.json(users);
});

// Admin: delete user
app.post("/api/admin/delete", (req, res) => {
    const { username } = req.body;
    const users = loadJSON(USERS_FILE);
    if (!users[username]) return res.status(400).json({ error: "User not found." });

    delete users[username];
    saveJSON(USERS_FILE, users);
    res.json({ success: true });
});

// Admin: reset password
app.post("/api/admin/reset", (req, res) => {
    const { username, password } = req.body;
    const users = loadJSON(USERS_FILE);
    if (!users[username]) return res.status(400).json({ error: "User not found." });

    users[username] = hashPassword(password);
    saveJSON(USERS_FILE, users);
    res.json({ success: true });
});

// Download celery.zip
app.get("/celery.zip", (req, res) => {
    const filePath = path.join(__dirname, "public", "celery.zip");
    res.download(filePath, "celery.zip");
});

// Start server
app.listen(PORT, () => console.log(`Celery Portal running at http://localhost:${PORT}`));
