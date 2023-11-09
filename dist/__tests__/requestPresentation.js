"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_js_1 = require("./veramo/setup.js");
const main = async () => {
    await setup_js_1.agent.sendPresentationRequest({
        credentialType: "UniversityDegreeCredential",
        subject: "did:ethr:development:0x0367841231aa84e8ee82b32f127f3b7649dd3b25063057036e5bd76baff7c4eac1",
    });
};
main();
