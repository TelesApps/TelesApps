import * as express from "express";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as cors from "cors";

const app = express();

// Initialize the Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}

// Apply CORS middleware
app.use(cors({ origin: true }));

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
            { endpoint: "/info", description: "Returns a JSON response with all the endpoint options" },
            { endpoint: "/notify-user", description: "Returns a JSON response with the request data" },
        ],
    };
    return res.status(200).send(data);
});

app.get("/get-public-json", async (req, res) => {
    console.log("/get-json called");
    // Fetch the json data from Firestore
    const doc = await admin.firestore().collection("mock-data").doc("public").get();
    const data = doc.data();
    console.log("data", data);
    // data is a string, so we need to parse it to JSON
    if (!data) {
        return res.status(404).send({ message: "Data not found" });
    } else {
        const jsonData = JSON.parse(data.json);
        return res.status(200).send(jsonData);
    }
});

app.post("/set-public-json", async (req, res) => {
    console.log("/set-json called");
    // body should contain a JSON and a key first verify key exists and is valid
    if (!req.body || !req.body.api_key) {
        return res.status(400).send({
            message: "Invalid request, API requires an api_key and value in the body  - HINT Lazy Login top row"
        });
    }
    const key = req.body.api_key;
    // hardcoded key for now
    if (key !== "987][p}{P") {
        return res.status(403).send({ message: "Invalid key - HINT Its the Lazy Login top row" });
    }
    // Save the JSON to Firestore
    const data = req.body.json;
    // verify data is a valid JSON
    if (!data) {
        return res.status(400).send({ message: "Invalid request, JSON data is required" });
    }
    await admin.firestore().collection("mock-data").doc("public").set({ json: JSON.stringify(data) });
    return res.status(200).send({ message: "Data saved" });
});

app.get("/get-json", async (req, res) => {
    // this will fetch specific json data from firestore so the body should contain the name or id of the json
    // body should contain a JSON and a key first verify key exists and is valid
    if (!req.body || !req.body.api_key) {
        return res.status(400).send({
            message: "Invalid request, API requires an api_key and value in the body - HINT Lazy Login top row"
        });
    }
    const key = req.body.api_key;
    // hardcoded key for now
    if (key !== "987][p}{P") {
        return res.status(403).send({ message: "Invalid api_key - HINT Its the Lazy Login top row" });
    }
    if (!req.body.id) {
        return res.status(400).send({ message: "Invalid request, JSON id is required" });
    }
    const id = req.body.id;
    // Fetch the json data from Firestore
    const doc = await admin.firestore().collection("mock-data").doc(id).get();
    const data = doc.data();
    // data is a string, so we need to parse it to JSON
    if (!data) {
        return res.status(404).send({ message: "Data not found" });
    } else {
        const jsonData = JSON.parse(data.json);
        return res.status(200).send(jsonData);
    }
});

app.post("/set-json", async (req, res) => {
    // this will fetch specific json data from firestore so the body should contain the name or id of the json
    // body should contain a JSON and a key first verify key exists and is valid
    if (!req.body || !req.body.api_key) {
        return res.status(400).send({
            message: "Invalid request, API requires an api_key and value in the body - HINT Lazy Login top row"
        });
    }
    const key = req.body.api_key;
    // hardcoded key for now
    if (key !== "987][p}{P") {
        return res.status(403).send({ message: "Invalid api_key - HINT Its the Lazy Login top row" });
    }
    if (!req.body.id) {
        return res.status(400).send({
            message: "Invalid request, JSON id is required - TIP - Name your id to something readable"
        });
    }
    if (!req.body.json) {
        return res.status(400).send({ message: "Invalid request, JSON data is required" });
    }
    const id = req.body.id;
    // Save the JSON to Firestore
    const data = {
        id: id,
        json: JSON.stringify(req.body.json)
    };
    // verify data is a valid JSON
    if (!data) {
        return res.status(400).send({ message: "Invalid request, JSON data is required" });
    }
    await admin.firestore().collection("mock-data").doc(id).set(data);
    return res.status(200).send({ message: "Data saved" });
});

export const mockCall = functions.https.onRequest(app);
