import { v4 } from "uuid";
import { agent } from "./veramo/setup.js";
async function main() {
    const argv = process.argv.slice(2);
    if (argv.length == 0) {
        console.log("Please specify port");
        return;
    }
    const port = argv[0];
    const id = v4();
    try {
        const identifier = await agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const result = await agent.didManagerAddService({
            did: identifier.did,
            service: {
                type: "DIDCommMessaging",
                id: id,
                serviceEndpoint: "http://localhost:" + port,
            },
        });
        console.log("Added DIDCommMessaging Service on port: " + port);
        console.log("txHash:" + result);
    }
    catch (error) {
        console.log(error);
    }
}
main().catch(console.log);
