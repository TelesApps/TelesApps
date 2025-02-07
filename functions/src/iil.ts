import * as express from "express";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
const { Analytics } = require("@segment/analytics-node");
const cors = require("cors")({ origin: true });
const app = express();

app.use(cors);

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

// Initialize the Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
// instantiation of the Analytics client
const analytics = new Analytics({ writeKey: "p0D6uv6kPHMP0UfI6Hpls5lIgbRGmT3n" });

// Middleware to validate API key and referer
const validateRequest = async (req: any, res: any, next: any) => {
    console.log("validating request");
    try {
        // Fetch allowed referer and API key from Firestore
        const doc = await admin.firestore().collection("app").doc("app-data").get();

        console.log("doc.exists: ", doc.exists);
        console.log("doc.data(): ", doc.data());

        if (!doc.exists) {
            return res.status(500).send({ message: "Configuration not found in Firestore" });
        }

        const config = doc.data();
        console.log("retreived config from firestore:", config);
        const allowedReferers = config?.allowed_referer || [];
        const validApiKey = config?.api_key || "";

        // Extract referer and API key from the request
        const referer = req.headers.referer || "";
        const apiKey = req.headers["teles-apps-key"];

        console.log("req.headers.referer:", req.headers.referer);
        console.log("allowedReferers:", allowedReferers);

        // Validate referer (check if the referer matches any value in the array)
        const isRefererValid = allowedReferers.some((allowed: any) => referer.startsWith(allowed));
        console.log("isRefererValid:", isRefererValid);
        // Validate referer
        if (!isRefererValid) {
            return res.status(403).send({ message: "Forbidden: Invalid referer" });
        }

        // Validate API key
        if (apiKey !== validApiKey) {
            return res.status(403).send({ message: "Forbidden: Invalid API key" });
        }

        // Proceed if both validations pass
        next();
    } catch (error) {
        console.error("Error validating request:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Helper function to get OAuth token
const getOAuthToken = async () => {
    const clientId = "rqRWE07fI6ZZZasK"; // Your Trustpilot API Key
    const clientSecret = "YOUR_API_SECRET"; // Replace with your Trustpilot API Secret
    const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    try {
        console.log("Making requers to Trustpilot API with encodedCredentials:", encodedCredentials);
        const response = await axios.post(
            "https://api.trustpilot.com/v1/oauth/oauth-business-users-for-applications/accesstoken",
            "grant_type=client_credentials", // Form-urlencoded body
            {
                headers: {
                    "Authorization": `Basic ${encodedCredentials}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        return response.data.access_token; // Return the access token
    } catch (error: any) {
        console.log("Call to TrustPilot API failed");
        console.error("Error fetching OAuth token:", error.response?.data || error.message);
        throw new Error("Failed to fetch OAuth token");
    }
};

// Apply the middleware to your app or specific routes
app.use(validateRequest);

// Test Call to API
app.get("/test", async (req, res) => {
    res.status(200).send({ message: "API is working" });
});

// POST endpoint for creating Trustpilot invitations
app.post("/create-invitation", async (req, res) => {
    console.log("/create-invitation called");
    try {
        // Replace with your Trustpilot Business Unit ID
        const businessUnitId = "IIL-BUSSINESS-UNIT-ID";

        // Get OAuth token
        const accessToken = await getOAuthToken();

        // Extract the invitation details from the request body
        const {
            replyTo,
            locale,
            recipientEmail,
            recipientName,
            referenceId,
            source,
            templateId,
            tags,
        } = req.body;

        // Construct the payload for the Trustpilot API
        const payload = {
            replyTo,
            locale: locale || "en-US", // Default to English if locale is not provided
            recipientEmail,
            recipientName,
            referenceId,
            source,
            type: "email",
            serviceReviewInvitation: {
                templateId,
                redirectUri: "https://telesapps.com", // Update with your redirect URI
                tags,
            },
        };

        // Make the POST request to Trustpilot"s API
        console.log("Making request to Trustpilot API with payload:", payload);
        const response = await axios.post(
            `https://invitations-api.trustpilot.com/v1/private/business-units/${businessUnitId}/email-invitations`,
            payload,
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Respond to the client with the Trustpilot API response
        res.status(200).send({
            message: "Invitation created successfully",
            data: response.data,
        });
    } catch (error: any) {
        console.log("Call to TrustPilot API failed");
        console.error("Error creating invitation:", error.response?.data || error.message);
        res.status(500).send({
            message: "Error creating invitation",
            error: error.response?.data || error.message,
        });
    }
});

app.post("/send-segment-event", async (req, res) => {
    // Identify the user
    // console.log("calling to identify user");
    // try {
    //     analytics.identify({
    //         userId: "f4ca124298",
    //         traits: {
    //             name: "Claudio Teles",
    //             email: "claudioteles85@gmail.com",
    //             createdAt: new Date("2025-01-29T15:09:16+00:00")
    //         }
    //     });
    //     console.log("analytics.identify fisnished calling");
    // }
    // catch (error: any) {
    //     console.log("error identifying user");
    //     console.error("Error identifying user:", error);
    // }

    console.log("/send-segment-event called");
    try {
        analytics.track({
            "writeKey": "qXa7qkgaGp9sabrBEXDku6t8tIUKSVAG",
            "type": "track",
            "email": "telesapps85@gmail.com",
            "order_id": "testingID0002",
            "courseId": "012345678905",
            "name": "Order Completed",
            "userId": "f4ca124298",
            "event": "Order Completed",
            "properties": {
                "checkout_id": "kdjfadslfjingbvsdjahfosa",
                "order_id": "testingID0002",
                "email": "claudioteles85@gmail.com",
                "name": "Claudio",
                "surname": "Teles",
                "affiliation": "Google Store",
                "total": 27.50,
                "revenue": 25.00,
                "shipping": 3,
                "tax": 2,
                "discount": 2.5,
                "coupon": "hasbros",
                "currency": "EUR",
                "products": [
                    {
                        "product_id": "012345678901",
                        "sku": "TOY-CAR-1",
                        "name": "Toy car",
                        "price": 9.90,
                        "quantity": 1,
                        "category": "toycars",
                        "url": "https://example.com/toy-car.html",
                        "image_url": "https://example.com/toy-car-1.jpg",
                    }
                ]

            }
        });
        console.log("analytics.track finished calling");
        res.status(200).send({ message: "Event sent to Segment" });
    } catch (error: any) {
        console.error("Error sending segment event:", error);
        res.status(500).send({ message: "Internal server error", error: error });
    }
});
export const IIL = functions.https.onRequest(app);
