import { IAgentPlugin } from "@veramo/core";
import { ICredentialFlow } from "./types/ICredentialFlow.js";
import { IContext, ICredentialPreview } from "./types/types.js";
export declare class CredentialFlow implements IAgentPlugin {
    readonly methods: ICredentialFlow;
    constructor();
    sendProposeCredential(args: {
        credentialPreview: ICredentialPreview;
        issuer: string;
    }, context: IContext): Promise<void>;
    sendOfferCredential(args: {
        credentialType: string;
        holder: string;
    }, context: IContext): Promise<void>;
    sendRequestCredential(args: {
        credentialType: string;
        issuer: string;
    }, context: IContext): Promise<void>;
    sendProposePresentation(args: {
        credentialType: string;
        verifier: string;
    }, context: IContext): Promise<void>;
    sendRequestPresentation(args: {
        credentialType: string;
        holder: string;
    }, context: IContext): Promise<void>;
}
//# sourceMappingURL=credentialFlow.d.ts.map