import { agent } from "./veramo/setup.js";
const main = async () => {
    const argv = process.argv.slice(2);
    if (argv.length == 0) {
        console.log("Please specify holder and type");
        return;
    }
    const holder = argv[0];
    const type = argv[1];
    await agent.sendRequestPresentation({
        credentialType: type,
        holder: holder,
    });
};
main();
