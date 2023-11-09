import { DataStore } from "@veramo/data-store";
import { OrPromise } from "@veramo/utils";
import { DataSource } from "typeorm";
import { ICredentialSchema, IDataStore } from "./index.js";
export declare class DataStoreCustom extends DataStore {
    private dbConnectionCustom;
    readonly methods: IDataStore;
    constructor(dbConnection: OrPromise<DataSource>);
    dataStoreSaveCredentialSchema(credentialSchema: ICredentialSchema): Promise<string>;
    dataStoreGetAllCredentialSchema(): Promise<ICredentialSchema[]>;
    dataStoreDeleteCredentialSchema(type: string): Promise<boolean>;
}
//# sourceMappingURL=data-store.d.ts.map