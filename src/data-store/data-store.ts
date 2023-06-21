import { DataStore } from "@veramo/data-store";
import { OrPromise } from "@veramo/utils";
import { DataSource } from "typeorm";
import { getConnectedDb } from "../utils.js";
import {
  CredentialSchema,
  createCredentialSchema,
  createCredentialSchemaEntity,
} from "./entities/credentialSchema.js";
import { ICredentialSchema, IDataStore } from "./index.js";

export class DataStoreCustom extends DataStore {
  private dbConnectionCustom: OrPromise<DataSource>;
  readonly methods: IDataStore;

  constructor(dbConnection: OrPromise<DataSource>) {
    super(dbConnection);
    this.dbConnectionCustom = dbConnection;
    this.methods = {
      // schema methods
      dataStoreSaveCredentialSchema:
        this.dataStoreSaveCredentialSchema.bind(this),
      dataStoreGetAllCredentialSchema:
        this.dataStoreGetAllCredentialSchema.bind(this),
      dataStoreDeleteCredentialSchema:
        this.dataStoreDeleteCredentialSchema.bind(this),

      // veramo base methods
      dataStoreSaveMessage: super.dataStoreSaveMessage.bind(this),
      dataStoreGetMessage: super.dataStoreGetMessage.bind(this),
      dataStoreDeleteMessage: super.dataStoreDeleteMessage.bind(this),
      dataStoreDeleteVerifiableCredential:
        super.dataStoreDeleteVerifiableCredential.bind(this),
      dataStoreSaveVerifiableCredential:
        super.dataStoreSaveVerifiableCredential.bind(this),
      dataStoreGetVerifiableCredential:
        super.dataStoreGetVerifiableCredential.bind(this),
      dataStoreSaveVerifiablePresentation:
        super.dataStoreSaveVerifiablePresentation.bind(this),
      dataStoreGetVerifiablePresentation:
        super.dataStoreGetVerifiablePresentation.bind(this),
    };
  }

  public async dataStoreSaveCredentialSchema(
    credentialSchema: ICredentialSchema
  ): Promise<string> {
    let credSchema = credentialSchema;
    credSchema.attributes = credSchema.attributes.replace(/\s+/g, "");
    const schema = await (await getConnectedDb(this.dbConnectionCustom))
      .getRepository(CredentialSchema)
      .save(createCredentialSchemaEntity(credSchema));
    return schema.type;
  }

  public async dataStoreGetAllCredentialSchema(): Promise<ICredentialSchema[]> {
    const credentialSchemaEntity = await (
      await getConnectedDb(this.dbConnectionCustom)
    )
      .getRepository(CredentialSchema)
      .createQueryBuilder("credentialSchema")
      .getMany();
    if (!credentialSchemaEntity)
      throw new Error("not_found: CredentialSchema not found");

    return credentialSchemaEntity.map((entity) => {
      return createCredentialSchema(entity);
    });
  }

  public async dataStoreDeleteCredentialSchema(type: string): Promise<boolean> {
    const credentialSchemaEntity = await (
      await getConnectedDb(this.dbConnectionCustom)
    )
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
