import { IPluginMethodMap } from "@veramo/core";
import { IContext, ICredentialPreview } from "./types.js";

export interface ICredentialFlow extends IPluginMethodMap {
  sendProposeCredential(
    args: {
      credentialPreview: ICredentialPreview;
      issuer: string;
    },
    context: IContext
  ): Promise<void>;

  sendOfferCredential(
    args: {
      credentialType: string;
      holder: string;
    },
    context: IContext
  ): Promise<void>;

  sendRequestCredential(
    args: {
      credentialType: string;
      issuer: string;
    },
    context: IContext
  ): Promise<void>;

  sendProposePresentation(
    args: {
      credentialType: string;
      verifier: string;
    },
    context: IContext
  ): Promise<void>;

  sendRequestPresentation(
    args: {
      credentialType: string;
      holder: string;
    },
    context: IContext
  ): Promise<void>;
}
