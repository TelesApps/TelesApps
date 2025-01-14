import * as express from "express";
import * as functions from "firebase-functions";

import * as cors from "cors";

const app = express();

// Apply CORS middleware
app.use(cors({origin: true}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

// The /info will simply return a JSON response with all the endpoint options
app.get("/info", (req, res) => {
    console.log("/info called");
    const data = {
        request: req.query,
        referer: req.headers.referer || "",
        message: "Hello World",
        timestamp: Date.now(),
        endpoints: [
            {endpoint: "/info", description: "Returns a JSON response with all the endpoint options"},
            {endpoint: "/notify-user", description: "Returns a JSON response with the request data"},
        ],
    };
    return res.status(200).send(data);
});

export const mockCall = functions.https.onRequest(app);
