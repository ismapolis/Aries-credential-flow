import express from "express";
import { agent } from "./veramo/setup.js";
import { MessagingRouter, RequestWithAgentRouter } from "@veramo/remote-server";
const main = async () => {
    try {
        const identifier = await agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const messagingSvc = identifier.services[identifier.services.length - 1];
        const serviceEndpoint = messagingSvc.serviceEndpoint;
        const messagingPortArray = serviceEndpoint.split(":");
        const messagingPort = messagingPortArray[messagingPortArray.length - 1];
        const requestWithAgent = RequestWithAgentRouter({ agent });
        const messagingRouter = MessagingRouter({
            metaData: {
                type: "DIDCommMessaging",
                value: "credential-flow-demo",
            },
        });
        const app = express();
        app.use("/", requestWithAgent, messagingRouter);
        app.listen(messagingPort);
        console.log("DIDCommMessaging Service listening on port: " + messagingPort);
    }
    catch (error) {
        console.log(error);
    }
};
main();
