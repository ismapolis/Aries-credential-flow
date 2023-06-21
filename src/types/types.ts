import { CredentialPayload } from "@veramo/core";

export enum ariesMessageTypesCredential {
  PROPOSE_CREDENTIAL = "https://didcomm.org/issue-credential/2.0/propose-credential",
  OFFER_CREDENTIAL = "https://didcomm.org/issue-credential/2.0/offer-credential",
  REQUEST_CREDENTIAL = "https://didcomm.org/issue-credential/2.0/request-credential",
  ISSUE_CREDENTIAL = "https://didcomm.org/issue-credential/2.0/issue-credential",
}

export enum ariesMessageTypesPresentation {
  PROPOSE_PRESENTATION = "https://didcomm.org/present-proof/2.0/propose-presentation",
  REQUEST_PRESENTATION = "https://didcomm.org/present-proof/2.0/request-presentation",
  PRESENTATION = "https://didcomm.org/present-proof/2.0/presentation",
}

export interface IAriesJsonLDAttachPayload {
  credential: CredentialPayload;
  options: {
    proofType: string;
    proofPurpose?: string;
    created?: string;
    challenge?: string;
    domain?: string;
    credentialStatus?: {
      type: string;
    };
  };
}

export interface ICredentialPreview {
  "@type": "https://didcomm.org/issue-credential/2.0/credential-preview";
  attributes: [
    {
      name: string;
      "mime-type": string;
      value: string;
    }
  ];
}
