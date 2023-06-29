import { agent } from "./veramo/setup.js";
const main = async () => {
    const argv = process.argv.slice(2);
    if (argv.length == 0) {
        console.log("Please specify issuer and type");
        return;
    }
    const issuer = argv[0];
    const type = argv[1];
    agent.sendRequestCredential({
        credentialType: type,
        issuer,
    });
};
main();
