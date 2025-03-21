// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// admin.initializeApp();
import {Api} from "./api";
import {mockCall} from "./mock";
import {IIL} from "./iil";

// export { onUserCreated } from "./onUserCreated";
// export { onUserDeleted } from "./onUserDeleted";


// APIs
export const api = Api;
export const mock = mockCall;
export const iil = IIL;

