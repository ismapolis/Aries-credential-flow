import { agent } from "./veramo/setup.js";

const main = async () => {
  const argv = process.argv.slice(2);
  if (argv.length == 0) {
    console.log("Please specify message ID");
    return;
  }
  const message = await agent.dataStoreGetMessage({
    id: argv[0],
  });
  console.log(JSON.stringify(message, null, 2));
};

main();
