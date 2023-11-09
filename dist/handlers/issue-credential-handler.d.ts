import { AbstractMessageHandler, Message } from "@veramo/message-handler";
import { IAgentContext, IDIDManager, IKeyManager } from "@veramo/core-types";
import { IDIDComm } from "@veramo/did-comm";
import { ICredentialPlugin } from "@veramo/core";
import { IDataStoreORM, IDataStore } from "../data-store/index.js";
type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm & IDataStore & ICredentialPlugin & IDataStoreORM>;
export declare class IssueCredentialHandler extends AbstractMessageHandler {
    constructor();
    handle(message: Message, context: IContext): Promise<Message>;
}
export {};
//# sourceMappingURL=issue-credential-handler.d.ts.map