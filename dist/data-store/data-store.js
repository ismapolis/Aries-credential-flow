"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStoreCustom = void 0;
const data_store_1 = require("@veramo/data-store");
const utils_js_1 = require("../utils.js");
const credentialSchema_js_1 = require("./entities/credentialSchema.js");
class DataStoreCustom extends data_store_1.DataStore {
    constructor(dbConnection) {
        super(dbConnection);
        this.dbConnectionCustom = dbConnection;
        this.methods = {
            // schema methods
            dataStoreSaveCredentialSchema: this.dataStoreSaveCredentialSchema.bind(this),
            dataStoreGetAllCredentialSchema: this.dataStoreGetAllCredentialSchema.bind(this),
            dataStoreDeleteCredentialSchema: this.dataStoreDeleteCredentialSchema.bind(this),
            // veramo base methods
            dataStoreSaveMessage: super.dataStoreSaveMessage.bind(this),
            dataStoreGetMessage: super.dataStoreGetMessage.bind(this),
            dataStoreDeleteMessage: super.dataStoreDeleteMessage.bind(this),
            dataStoreDeleteVerifiableCredential: super.dataStoreDeleteVerifiableCredential.bind(this),
            dataStoreSaveVerifiableCredential: super.dataStoreSaveVerifiableCredential.bind(this),
            dataStoreGetVerifiableCredential: super.dataStoreGetVerifiableCredential.bind(this),
            dataStoreSaveVerifiablePresentation: super.dataStoreSaveVerifiablePresentation.bind(this),
            dataStoreGetVerifiablePresentation: super.dataStoreGetVerifiablePresentation.bind(this),
        };
    }
    async dataStoreSaveCredentialSchema(credentialSchema) {
        let credSchema = credentialSchema;
        credSchema.attributes = credSchema.attributes.replace(/\s+/g, "");
        const schema = await (await (0, utils_js_1.getConnectedDb)(this.dbConnectionCustom))
            .getRepository(credentialSchema_js_1.CredentialSchema)
            .save((0, credentialSchema_js_1.createCredentialSchemaEntity)(credSchema));
        return schema.type;
    }
    async dataStoreGetAllCredentialSchema() {
        const credentialSchemaEntity = await (await (0, utils_js_1.getConnectedDb)(this.dbConnectionCustom))
            .getRepository(credentialSchema_js_1.CredentialSchema)
            .createQueryBuilder("credentialSchema")
            .getMany();
        if (!credentialSchemaEntity)
            throw new Error("not_found: CredentialSchema not found");
        return credentialSchemaEntity.map((entity) => {
            return (0, credentialSchema_js_1.createCredentialSchema)(entity);
        });
    }
    async dataStoreDeleteCredentialSchema(type) {
        const credentialSchemaEntity = await (await (0, utils_js_1.getConnectedDb)(this.dbConnectionCustom))
            .getRepository(credentialSchema_js_1.CredentialSchema)
            .findOne({
            where: { type: type },
        });
        if (!credentialSchemaEntity) {
            return false;
        }
        await (await (0, utils_js_1.getConnectedDb)(this.dbConnectionCustom))
            .getRepository(credentialSchema_js_1.CredentialSchema)
            .remove(credentialSchemaEntity);
        return true;
    }
}
exports.DataStoreCustom = DataStoreCustom;
