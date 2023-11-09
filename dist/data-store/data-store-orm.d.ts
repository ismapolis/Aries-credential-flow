import { DataStoreORM } from "@veramo/data-store";
import { DataSource } from "typeorm";
import { OrPromise } from "@veramo/utils";
import { FindArgs, TCredentialColumns, AuthorizedDIDContext } from "@veramo/core";
import { ICredentialSchema, IDataStoreORM } from "./index.js";
export declare class DataStoreORMCustom extends DataStoreORM {
    private dbConnectionCustom;
    readonly methods: IDataStoreORM;
    constructor(dbConnection: OrPromise<DataSource>);
    private credentialSchemasQuery;
    dataStoreORMGetCredentialSchemas(args: FindArgs<TCredentialColumns>, context: AuthorizedDIDContext): Promise<ICredentialSchema[]>;
    dataStoreORMGetCredentialSchemasCount(args: FindArgs<TCredentialColumns>, context: AuthorizedDIDContext): Promise<number>;
    private decorateQB;
    private createWhereObject;
}
//# sourceMappingURL=data-store-orm.d.ts.map