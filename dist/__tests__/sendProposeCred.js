"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_js_1 = require("./veramo/setup.js");
const main = async () => {
    const argv = process.argv.slice(2);
    if (argv.length == 0) {
        console.log("Please specify issuer");
        return;
    }
    const issuer = argv[0];
    const credentialPreviewPayload = {
        "@type": "https://didcomm.org/issue-credential/2.0/credential-preview",
        attributes: [
            {
                name: "grado",
                value: "Universitario",
            },
            {
                name: "titulo",
                value: "Ingenieria Informatica",
            },
        ],
    };
    setup_js_1.agent.sendProposeCredential({
        credentialPreview: credentialPreviewPayload,
        issuer,
    });
};
main();
