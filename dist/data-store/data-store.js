import { DataStore } from "@veramo/data-store";
import { getConnectedDb } from "../utils.js";
import { CredentialSchema, createCredentialSchema, createCredentialSchemaEntity, } from "./entities/credentialSchema.js";
export class DataStoreCustom extends DataStore {
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
        const schema = await (await getConnectedDb(this.dbConnectionCustom))
            .getRepository(CredentialSchema)
            .save(createCredentialSchemaEntity(credSchema));
        return schema.type;
    }
    async dataStoreGetAllCredentialSchema() {
        const credentialSchemaEntity = await (await getConnectedDb(this.dbConnectionCustom))
            .getRepository(CredentialSchema)
            .createQueryBuilder("credentialSchema")
            .getMany();
        if (!credentialSchemaEntity)
            throw new Error("not_found: CredentialSchema not found");
        return credentialSchemaEntity.map((entity) => {
            return createCredentialSchema(entity);
        });
    }
    async dataStoreDeleteCredentialSchema(type) {
        const credentialSchemaEntity = await (await getConnectedDb(this.dbConnectionCustom))
            .getRepository(CredentialSchema)
            .findOne({
            where: { type: type },
        });
        if (!credentialSchemaEntity) {
            return false;
        }
        await (await getConnectedDb(this.dbConnectionCustom))
            .getRepository(CredentialSchema)
            .remove(credentialSchemaEntity);
        return true;
    }
}
