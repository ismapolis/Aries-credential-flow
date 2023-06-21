import { ariesMessageTypesCredential, ariesMessageTypesPresentation, } from "./types/message-types.js";
import { v4 } from "uuid";
export class CredentialFlow {
    constructor() {
        this.methods = {
            sendCredentialRequest: this.sendCredentialRequest.bind(this),
            sendPresentationRequest: this.sendPresentationRequest.bind(this),
        };
    }
    async sendCredentialRequest(args, context) {
        const credId = v4();
        const msgId = v4();
        const identifier = await context.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const ariesProposeCredentialPayload = {
            "@type": ariesMessageTypesCredential.REQUEST_CREDENTIAL,
            "@id": msgId,
            formats: [
                {
                    attach_id: credId,
                    format: "aries/ld-proof-vc-detail@v1.0",
                },
            ],
            "requests~attach": [
                {
                    "@id": credId,
                    "mime-type": "application/json",
                    data: {
                        credential: {
                            type: ["VerifiableCredential", args.credentialType],
                            issuer: args.issuer,
                            credentialSubject: {
                                id: identifier.did,
                            },
                        },
                        options: {
                            proofType: "",
                        },
                    },
                },
            ],
        };
        // Message envelope
        const proposeMessage = {
            type: ariesMessageTypesCredential.REQUEST_CREDENTIAL,
            to: args.issuer,
            from: identifier.did,
            id: msgId,
            body: ariesProposeCredentialPayload,
        };
        const packedMessage = await context.agent.packDIDCommMessage({
            packing: "jws",
            message: proposeMessage,
        });
        try {
            context.agent
                .sendDIDCommMessage({
                messageId: msgId,
                packedMessage,
                recipientDidUrl: proposeMessage.to,
            })
                .then(() => {
                console.log("Sent Issue Credential: " + msgId);
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async sendPresentationRequest(args, context) {
        const reqId = v4();
        const msgId = v4();
        const identifier = await context.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const ariesPresentProofPayload = {
            "@type": ariesMessageTypesPresentation.REQUEST_PRESENTATION,
            "@id": msgId,
            formats: [
                {
                    attach_id: reqId,
                    format: "dif/presentation-exchange/definitions@v1.0",
                },
            ],
            "request_presentations~attach": [
                {
                    "@id": reqId,
                    "mime-type": "application/json",
                    data: {
                        options: {
                            challenge: "test_challenge",
                            domain: "defaultDomain",
                        },
                        presentation_definition: {
                            input_descriptors: {
                                schema: {
                                    id: "UniversityDegreeCredential",
                                },
                            },
                        },
                    },
                },
            ],
        };
        // Message envelope
        const requestMessage = {
            type: ariesMessageTypesPresentation.REQUEST_PRESENTATION,
            to: args.subject,
            from: identifier.did,
            id: msgId,
            body: ariesPresentProofPayload,
        };
        const packedMessage = await context.agent.packDIDCommMessage({
            packing: "jws",
            message: requestMessage,
        });
        try {
            context.agent
                .sendDIDCommMessage({
                messageId: msgId,
                packedMessage,
                recipientDidUrl: requestMessage.to,
            })
                .then(() => {
                console.log("Sent Request Presentation: " + msgId);
            });
        }
        catch (error) {
            console.log(error);
        }
    }
}
