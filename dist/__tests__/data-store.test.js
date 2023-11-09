"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_js_1 = require("./veramo/setup.js");
const main = async () => {
    const schema = {
        type: "UniversityDegreeCredential",
        attributes: "grado,titulo",
    };
    const addResult = await setup_js_1.agent.dataStoreSaveCredentialSchema(schema);
    console.log("Esquema registrado: " + addResult);
    const schemas = await setup_js_1.agent.dataStoreORMGetCredentialSchemas();
    console.log(schemas);
};
main();
