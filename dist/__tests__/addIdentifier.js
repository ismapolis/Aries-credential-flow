"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const setup_js_1 = require("./veramo/setup.js");
async function main() {
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
}
main().catch(console.log);
