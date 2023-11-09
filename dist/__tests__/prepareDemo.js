"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const setup_js_1 = require("./veramo/setup.js");
const remote_server_1 = require("@veramo/remote-server");
const express_1 = __importDefault(require("express"));
async function main() {
    // addIdentifier.ts
    try {
        const defaultIdentifier = await setup_js_1.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        await setup_js_1.agent.didManagerSetAlias({
            did: defaultIdentifier.did,
            alias: (0, uuid_1.v4)(),
        });
    }
    catch (error) {
        console.log("Setting new default");
    }
    try {
        const newIdentifier = await setup_js_1.agent.didManagerCreate({
            kms: "local",
            provider: "did:ethr:development",
            alias: "default",
        });
        console.log(`New identifier created: ` + newIdentifier.did);
    }
    catch (error) {
        console.log(error);
    }
    // addMessagingSvc.ts
    const argv = process.argv.slice(2);
    if (argv.length == 0) {
        console.log("Please specify port");
        return;
    }
    const port = argv[0];
    const id = (0, uuid_1.v4)();
    try {
        const identifier = await setup_js_1.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const result = await setup_js_1.agent.didManagerAddService({
            did: identifier.did,
            service: {
                type: "DIDCommMessaging",
                id: id,
                serviceEndpoint: "http://localhost:" + port,
            },
        });
        console.log("Added DIDCommMessaging Service on port: " + port);
        console.log("Result:" + result);
    }
    catch (error) {
        console.log(error);
    }
    // startMeessagingSvc.ts
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
}
main().catch(console.log);
