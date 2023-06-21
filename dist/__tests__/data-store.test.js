import { agent } from "../veramo/setup.js";
const main = async () => {
    const schema = {
        type: "UniversityDegreeCredential",
        attributes: "grado, titulo",
    };
    const addResult = await agent.dataStoreSaveCredentialSchema(schema);
    console.log("Esquema registrado: " + addResult);
    const schemas = await agent.dataStoreORMGetCredentialSchemas();
    console.log(schemas);
};
main();
