import * as express from "express";
import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// const axios = require("axios").default;
// const jsSHA = require("jssha");
/* eslint-disable */

// CODE LOGIC FOR SENDGRID IS COMMENTED OUT FOR NOW
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

app.get("/notify-user", (req, res) => {
    console.log("/notify-user called");
    console.log("req.query: ", req.query);
    res.status(200).send({ message: "Hello World From Teles Apps Server", data: req.query });
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
