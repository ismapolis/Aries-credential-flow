import { v4 } from "uuid";
import { agent } from "./veramo/setup.js";
import { RequestWithAgentRouter, MessagingRouter } from "@veramo/remote-server";
import express from "express";

async function main() {
  // addIdentifier.ts
  try {
    const defaultIdentifier = await agent.didManagerGetByAlias({
      alias: "default",
      provider: "did:ethr:development",
    });

    await agent.didManagerSetAlias({
      did: defaultIdentifier.did,
      alias: v4(),
    });
  } catch (error) {
    console.log("Setting new default");
  }

  try {
    const newIdentifier = await agent.didManagerCreate({
      kms: "local",
      provider: "did:ethr:development",
      alias: "default",
    });
    console.log(`New identifier created: ` + newIdentifier.did);
  } catch (error) {
    console.log(error);
  }

  // addMessagingSvc.ts
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
    console.log("Result:" + result);
  } catch (error) {
    console.log(error);
  }

  // startMeessagingSvc.ts
  try {
    const identifier = await agent.didManagerGetByAlias({
      alias: "default",
      provider: "did:ethr:development",
    });

    const messagingSvc = identifier.services[identifier.services.length - 1];
    const serviceEndpoint = messagingSvc.serviceEndpoint as string;
    const messagingPortArray = serviceEndpoint.split(":");
    const messagingPort = messagingPortArray[messagingPortArray.length - 1];

    const requestWithAgent = RequestWithAgentRouter({ agent });
    const messagingRouter = MessagingRouter({
      metaData: {
        type: "DIDCommMessaging",
        value: "credential-flow-demo",
      },
    });
    const app = express();
    app.use("/", requestWithAgent, messagingRouter);
    app.listen(messagingPort);
    console.log("DIDCommMessaging Service listening on port: " + messagingPort);
  } catch (error) {
    console.log(error);
  }
}

main().catch(console.log);
