import { AuthorizedDIDContext, FindArgs, IDataStore, IDataStoreORM, TCredentialColumns } from "@veramo/core";
export interface ICredentialSchema {
    type: string;
    attributes: string;
}
export interface IDataStoreORMCustom extends IDataStoreORM {
    dataStoreORMGetCredentialSchemas(args: FindArgs<TCredentialColumns>, context: AuthorizedDIDContext): Promise<ICredentialSchema[]>;
    dataStoreORMGetCredentialSchemasCount(args: FindArgs<TCredentialColumns>, context: AuthorizedDIDContext): Promise<number>;
}
export interface IDataStoreCustom extends IDataStore {
    dataStoreSaveCredentialSchema(credentialSchema: ICredentialSchema): Promise<string>;
    dataStoreGetAllCredentialSchema(): Promise<ICredentialSchema[]>;
    dataStoreDeleteCredentialSchema(type: string): Promise<boolean>;
}
//# sourceMappingURL=types.d.ts.map