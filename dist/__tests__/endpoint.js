import express from "express";
import { agent } from "../veramo/setup.js";
import { MessagingRouter, RequestWithAgentRouter } from "@veramo/remote-server";
const requestWithAgent = RequestWithAgentRouter({ agent });
const messagingRouter = MessagingRouter({
    metaData: {
        type: "DIDCommMessaging",
        value: "credential agent",
    },
});
const app = express();
app.use("/", requestWithAgent, messagingRouter);
app.listen(7777);
