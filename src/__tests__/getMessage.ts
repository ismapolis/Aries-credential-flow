import { agent } from "../veramo/setup.js";

const main = async () => {
  const message = await agent.dataStoreGetMessage({
    id: "a0e4ed31-5ea8-4c99-b13a-89316d4bfd99",
  });
  console.log(JSON.stringify(message, null, 2));
};

main();
