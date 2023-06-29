import { v4 } from "uuid";
import { agent } from "./veramo/setup.js";
async function main() {
    try {
        const defaultIdentifier = await agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        await agent.didManagerSetAlias({
            did: defaultIdentifier.did,
            alias: v4(),
        });
    }
    catch (error) {
        console.log("Setting new default");
    }
    try {
        const newIdentifier = await agent.didManagerCreate({
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
