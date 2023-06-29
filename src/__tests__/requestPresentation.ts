import { agent } from "./veramo/setup.js";

const main = async () => {
  await agent.sendPresentationRequest({
    credentialType: "UniversityDegreeCredential",
    subject:
      "did:ethr:development:0x0367841231aa84e8ee82b32f127f3b7649dd3b25063057036e5bd76baff7c4eac1",
  });
};

main();
