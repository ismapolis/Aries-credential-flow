import { IAgentContext, IDIDManager, IKeyManager, ICredentialPlugin } from "@veramo/core";
import { IDIDComm } from "@veramo/did-comm";
import { IDataStore, IDataStoreORM } from "../data-store/index.js";
import { AbstractMessageHandler, Message } from "@veramo/message-handler";
import { ICredentialFlow } from "../index.js";
type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm & IDataStore & ICredentialPlugin & IDataStoreORM & ICredentialFlow>;
export declare class PresentProofHandler extends AbstractMessageHandler {
    constructor();
    handle(message: Message, context: IContext): Promise<Message>;
}
export {};
//# sourceMappingURL=present-proof-handler.d.ts.map