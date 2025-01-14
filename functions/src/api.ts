import * as express from "express";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

// const jsSHA = require("jssha");
/* eslint-disable */

// CODE LOGIC FOR SENDGRID IS COMMENTED OUT FOR NOW SINCE ITS NOT IN USE
// Initialize SendGrid with the API key from environment variables
// const sgMail = require('@sendgrid/mail');
// const sendGridApiKey = functions.config().sendgrid_api.telesapps_key;
// sgMail.setApiKey(sendGridApiKey);


const cors = require("cors")({ origin: true });
const app = express();
// const db = admin.firestore();
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

// The /notify-user endpoint is mostly for testing the API endpoints work
app.get("/notify-user", (req, res) => {
    console.log("/notify-user called");
    console.log("req.query: ", req.query);
    console.log("req.body.name: ", req.body.name);
    let data: any = {}
    if (req.query && req.query.email) {
        data["email"] = req.query.email;
    }
    else if (req.body) {
        data = req.body;
    }
    res.status(200).send({ message: "Response Updated", data: data });
});

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
                    Authorization: `Basic ${encodedCredentials}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        return response.data.access_token; // Return the access token
    } catch (error: any) {
        console.log("Call to TrustPilot API failed");
        console.error("Error fetching OAuth token:", error.response?.data || error.message);
        throw new Error("Failed to fetch OAuth token");
    }
};

// Middleware to validate API key and referer
const validateRequest = async (req: any, res: any, next: any) => {
    console.log("validating request");
    try {
        // Fetch allowed referer and API key from Firestore
        const doc = await admin.firestore().collection('app').doc('app-data').get();

        console.log("doc.exists: ", doc.exists);
        console.log("doc.data(): ", doc.data());
        
        if (!doc.exists) {
            return res.status(500).send({ message: "Configuration not found in Firestore" });
        }

        const config = doc.data();
        console.log("retreived config from firestore:", config);
        const allowedReferers = config?.allowed_referer || [];
        const validApiKey = config?.api_key || '';

        // Extract referer and API key from the request
        const referer = req.headers.referer || '';
        const apiKey = req.headers['teles-apps-key'];

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

// Apply the middleware to your app or specific routes
app.use(validateRequest);

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
                tags
            },
        };

        // Make the POST request to Trustpilot's API
        console.log("Making request to Trustpilot API with payload:", payload);
        const response = await axios.post(
            `https://invitations-api.trustpilot.com/v1/private/business-units/${businessUnitId}/email-invitations`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // Respond to the client with the Trustpilot API response
        res.status(200).send({
            message: "Invitation created successfully",
            data: response.data
        });
    } catch (error: any) {
        console.log("Call to TrustPilot API failed");  
        console.error("Error creating invitation:", error.response?.data || error.message);
        res.status(500).send({
            message: "Error creating invitation",
            error: error.response?.data || error.message
        });
    }
});



// app.post("/send-email", (req, res) => {
//     console.log("/send-email called");
//     console.log("SENDGRID API KEY:", functions.config().sendgrid_api.telesapps_key);

//     const msg = {
//         to: req.body.to,
//         from: req.body.from,
//         replyTo: req.body.replyTo,
//         subject: req.body.subject,
//         text: req.body.text,
//         html: req.body.html,
//     };

//     sgMail
//         .send(msg)
//         .then((sendGridRes: any) => {
//             console.log("Email sent Success")
//             console.log("sendGridRes from sendgrid:", sendGridRes);
//             res.status(200).send({ message: "Response after email sent", data: req.body });
//         })
//         .catch((error:any) => {
//             console.error("Email sent Error")
//             console.error(error)
//             res.status(500).send({ message: "Error while sending email", data: error });
//         });

//     console.log(req.body);
// });



export const Api = functions.https.onRequest(app);
