"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setup_js_1 = require("./veramo/setup.js");
const remote_server_1 = require("@veramo/remote-server");
const main = async () => {
    try {
        const identifier = await setup_js_1.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const messagingSvc = identifier.services[identifier.services.length - 1];
        const serviceEndpoint = messagingSvc.serviceEndpoint;
        const messagingPortArray = serviceEndpoint.split(":");
        const messagingPort = messagingPortArray[messagingPortArray.length - 1];
        const requestWithAgent = (0, remote_server_1.RequestWithAgentRouter)({ agent: setup_js_1.agent });
        const messagingRouter = (0, remote_server_1.MessagingRouter)({
            metaData: {
                type: "DIDCommMessaging",
                value: "credential-flow-demo",
            },
        });
        const app = (0, express_1.default)();
        app.use("/", requestWithAgent, messagingRouter);
        app.listen(messagingPort);
        console.log("DIDCommMessaging Service listening on port: " + messagingPort);
    }
    catch (error) {
        console.log(error);
    }
};
main();
