import { ariesMessageTypesCredential, ariesMessageTypesPresentation, } from "./types/types.js";
import { v4 } from "uuid";
import { checkPreviusCredential, saveMessage } from "./utils.js";
export class CredentialFlow {
    constructor() {
        this.methods = {
            sendProposeCredential: this.sendProposeCredential.bind(this),
            sendOfferCredential: this.sendOfferCredential.bind(this),
            sendRequestCredential: this.sendRequestCredential.bind(this),
            sendRequestPresentation: this.sendRequestPresentation.bind(this),
            sendProposePresentation: this.sendProposePresentation.bind(this),
        };
    }
    async sendProposeCredential(args, context) {
        const credId = v4();
        const msgId = v4();
        const identifier = await context.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const credentialAttachPayload = {
            credential: {
                type: ["VerifiableCredential"],
                issuer: args.issuer,
                credentialSubject: {
                    id: identifier.did,
                },
            },
            options: {
                proofType: "EcdsaSecp256k1RecoverySignature2020",
            },
        };
        const ariesProposeCredentialMessage = {
            "@type": ariesMessageTypesCredential.PROPOSE_CREDENTIAL,
            "@id": msgId,
            credential_preview: args.credentialPreview,
            formats: [
                {
                    attach_id: credId,
                    format: "aries/ld-proof-vc-detail@v1.0",
                },
            ],
            "filters~attach": [
                {
                    "@id": credId,
                    "mime-type": "application/json",
                    data: credentialAttachPayload,
                },
            ],
        };
        // Message envelope
        const didCommMessage = {
            type: ariesMessageTypesCredential.PROPOSE_CREDENTIAL,
            to: args.issuer,
            from: identifier.did,
            id: msgId,
            body: ariesProposeCredentialMessage,
        };
        const packedMessage = await context.agent.packDIDCommMessage({
            packing: "jws",
            message: didCommMessage,
        });
        try {
            context.agent
                .sendDIDCommMessage({
                messageId: msgId,
                packedMessage,
                recipientDidUrl: args.issuer,
            })
                .then(() => {
                console.log("Sent Propose Credential: " + msgId);
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async sendOfferCredential(args, context) {
        const credId = v4();
        const msgId = v4();
        const identifier = await context.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        let schema;
        try {
            schema = await context.agent.dataStoreORMGetCredentialSchemas({
                where: [{ column: "type", value: [args.credentialType] }],
            });
        }
        catch (error) {
            console.log(error);
            return;
        }
        let credential = {
            issuer: identifier.did,
            type: ["VerifiableCredential", args.credentialType],
            credentialSubject: {
                id: args.holder,
            },
        };
        const attributes = schema[0].attributes.split(",");
        attributes.forEach((attr) => {
            if (credential.credentialSubject) {
                credential.credentialSubject[attr.toString()] = attr + "DefaultValue";
            }
        });
        const credentialAttachPayload = {
            credential: credential,
            options: {
                proofType: "EcdsaSecp256k1RecoverySignature2020",
            },
        };
        const ariesProposeCredentialMessage = {
            "@type": ariesMessageTypesCredential.PROPOSE_CREDENTIAL,
            "@id": msgId,
            replacement_id: await checkPreviusCredential(args.holder, args.credentialType, context),
            formats: [
                {
                    attach_id: credId,
                    format: "aries/ld-proof-vc-detail@v1.0",
                },
            ],
            "offers~attach": [
                {
                    "@id": credId,
                    "mime-type": "application/json",
                    data: credentialAttachPayload,
                },
            ],
        };
        // Message envelope
        const didCommMessage = {
            type: ariesMessageTypesCredential.PROPOSE_CREDENTIAL,
            to: args.holder,
            from: identifier.did,
            id: msgId,
            body: ariesProposeCredentialMessage,
        };
        const packedMessage = await context.agent.packDIDCommMessage({
            packing: "jws",
            message: didCommMessage,
        });
        try {
            context.agent
                .sendDIDCommMessage({
                messageId: msgId,
                packedMessage,
                recipientDidUrl: args.holder,
            })
                .then(() => {
                console.log("Sent Propose Credential: " + msgId);
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async sendRequestCredential(args, context) {
        const credId = v4();
        const msgId = v4();
        const identifier = await context.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const ariesRequestCredentialPayload = {
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
        const didCommMessage = {
            type: ariesMessageTypesCredential.REQUEST_CREDENTIAL,
            to: args.issuer,
            from: identifier.did,
            id: msgId,
            body: ariesRequestCredentialPayload,
        };
        const packedMessage = await context.agent.packDIDCommMessage({
            packing: "jws",
            message: didCommMessage,
        });
        try {
            context.agent
                .sendDIDCommMessage({
                messageId: msgId,
                packedMessage,
                recipientDidUrl: args.issuer,
            })
                .then(() => {
                console.log("Sent Request Credential: " + msgId);
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async sendProposePresentation(args, context) {
        const propId = v4();
        const msgId = v4();
        const identifier = await context.agent.didManagerGetByAlias({
            alias: "default",
            provider: "did:ethr:development",
        });
        const ariesProposeProofPayload = {
            "@type": ariesMessageTypesPresentation.PROPOSE_PRESENTATION,
            "@id": msgId,
            formats: [
                {
                    attach_id: propId,
                    format: "dif/presentation-exchange/definitions@v1.0",
                },
            ],
            "proposals~attach": [
                {
                    "@id": propId,
                    "mime-type": "application/json",
                    data: {
                        input_descriptors: {
                            name: args.credentialType,
                        },
                    },
                },
            ],
        };
        // Message envelope
        const didCommMessage = {
            type: ariesMessageTypesPresentation.PROPOSE_PRESENTATION,
            to: args.verifier,
            from: identifier.did,
            id: msgId,
            body: ariesProposeProofPayload,
        };
        const packedMessage = await context.agent.packDIDCommMessage({
            packing: "jws",
            message: didCommMessage,
        });
        try {
            context.agent
                .sendDIDCommMessage({
                messageId: msgId,
                packedMessage,
                recipientDidUrl: args.verifier,
            })
                .then(() => {
                console.log("Sent Request Presentation: " + msgId);
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async sendRequestPresentation(args, context) {
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
                                    id: args.credentialType,
                                },
                            },
                        },
                    },
                },
            ],
        };
        // Message envelope
        var didCommMessage = {
            type: ariesMessageTypesPresentation.REQUEST_PRESENTATION,
            to: args.holder,
            from: identifier.did,
            id: msgId,
            body: ariesPresentProofPayload,
        };
        try {
            await saveMessage(didCommMessage, context);
        }
        catch (error) {
            console.log(error);
        }
        const packedMessage = await context.agent.packDIDCommMessage({
            packing: "jws",
            message: didCommMessage,
        });
        try {
            context.agent
                .sendDIDCommMessage({
                messageId: msgId,
                packedMessage,
                recipientDidUrl: args.holder,
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
