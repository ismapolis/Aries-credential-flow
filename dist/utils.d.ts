import { IAgentContext, ICredentialIssuer, ICredentialPlugin, IDIDManager, IKeyManager } from "@veramo/core";
import { IDIDComm, IDIDCommMessage } from "@veramo/did-comm";
import { OrPromise } from "@veramo/utils";
import { DataSource } from "typeorm";
import { IDataStoreORM } from "./data-store/index.js";
import { IDataStore } from "./data-store/index.js";
export declare function checkPreviusCredential(subject: string, type: string, context: IAgentContext<IDIDManager & IKeyManager & IDataStore & IDIDComm & IDataStoreORM>): Promise<string | undefined>;
export declare function createOfferCredential(preview: any, attach: any, context: IAgentContext<IDIDManager & IKeyManager & IDataStore & IDIDComm & ICredentialPlugin & IDataStoreORM>): Promise<{
    formats: any[];
    "offers~attach": any[];
} | undefined>;
export declare function getConnectedDb(dbConnection: OrPromise<DataSource>): Promise<DataSource>;
export declare function saveMessage(message: IDIDCommMessage, context: IAgentContext<IDIDManager & IKeyManager & IDataStore & IDIDComm & ICredentialPlugin & IDataStoreORM>): Promise<void>;
export declare function checkResquestType(type: any, context: IAgentContext<IDIDManager & IKeyManager & IDataStore & IDIDComm & ICredentialPlugin & IDataStoreORM>): Promise<boolean>;
export declare function createIssueCredential(credential: any, context: IAgentContext<IDIDManager & IKeyManager & IDataStore & IDIDComm & ICredentialPlugin & IDataStoreORM>): Promise<{
    formats: any[];
    "credentials~attach": any[];
}>;
export declare function createPresentation(attach: any, verifier: string, context: IAgentContext<IDIDManager & IKeyManager & IDataStore & IDIDComm & ICredentialPlugin & IDataStoreORM & ICredentialIssuer>): Promise<{
    formats: any[];
    "presentations~attach": any[];
} | undefined>;
//# sourceMappingURL=utils.d.ts.map