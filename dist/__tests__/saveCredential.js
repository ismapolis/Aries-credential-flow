"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_js_1 = require("./veramo/setup.js");
const main = async () => {
    const credential = await setup_js_1.agent.createVerifiableCredential({
        credential: {
            type: ["VerifiableCredential", "UniversityDegreeCredential"],
            issuer: "did:ethr:development:0x0367841231aa84e8ee82b32f127f3b7649dd3b25063057036e5bd76baff7c4eac1",
            credentialSubject: {
                id: "did:ethr:development:0x0367841231aa84e8ee82b32f127f3b7649dd3b25063057036e5bd76baff7c4eac1",
                grado: "Universitario",
                titulo: "Ingenieria Informatica",
            },
        },
        proofFormat: "EthereumEip712Signature2021",
    });
    console.log(JSON.stringify(credential, null, 2));
    const result = setup_js_1.agent.dataStoreSaveVerifiableCredential({
        verifiableCredential: credential,
    });
    console.log(result);
};
main();
