"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_js_1 = require("./veramo/setup.js");
const main = async () => {
    const argv = process.argv.slice(2);
    if (argv.length == 0) {
        console.log("Please specify holder and type");
        return;
    }
    const holder = argv[0];
    const type = argv[1];
    setup_js_1.agent.sendOfferCredential({
        credentialType: type,
        holder,
    });
};
main();
