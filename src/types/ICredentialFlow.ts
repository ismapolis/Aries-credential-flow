import {
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
} from "@veramo/core";
import { ICredentialPreview } from "./types.js";

export interface ICredentialFlow extends IPluginMethodMap {
  sendProposeCredential(
    args: {
      credentialPreview: ICredentialPreview;
      issuer: string;
    },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>
  ): Promise<void>;

  sendOfferCredential(
    args: {
      credentialType: string;
      issuer: string;
    },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>
  ): Promise<void>;

  sendRequestCredential(
    args: {
      credentialType: string;
      issuer: string;
    },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>
  ): Promise<void>;

  sendPresentationRequest(
    args: {
      credentialType: string;
      subject: string;
    },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>
  ): Promise<void>;
}
