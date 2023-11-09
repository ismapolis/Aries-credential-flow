"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueCredentialHandler = void 0;
const message_handler_1 = require("@veramo/message-handler");
const types_js_1 = require("../types/types.js");
const uuid_1 = require("uuid");
const utils_js_1 = require("../utils.js");
class IssueCredentialHandler extends message_handler_1.AbstractMessageHandler {
    constructor() {
        super();
    }
    async handle(message, context) {
        const messageType = message.type;
        if (messageType == types_js_1.ariesMessageTypesCredential.PROPOSE_CREDENTIAL) {
            console.log("Recieved Message from: " + message.from);
            console.log("Message type: " + messageType);
            console.log("Propose Credential ID: " + message.id);
            let attach;
            let credentialType;
            let subject;
            let issuer;
            try {
                attach = message.data["filters~attach"][0].data;
                credentialType = attach.credential.type;
                console.log("Proposed credential type: " + credentialType);
                subject = attach.credential.credentialSubject.id;
                issuer = attach.credential.issuer;
            }
            catch (error) {
                console.log(error);
                return message;
            }
            // Create verifiable credential without proof for "attach~offer" attribute
            const offerAttachPayload = await (0, utils_js_1.createOfferCredential)(message.data["credential_preview"], attach, context);
            // IDs for message
            const offerID = (0, uuid_1.v4)();
            const offerCredential = {
                "@type": types_js_1.ariesMessageTypesCredential.OFFER_CREDENTIAL,
                "@id": offerID,
                comment: "These are the credentials we can offer",
                formats: offerAttachPayload?.formats,
                "offers~attach": offerAttachPayload?.["offers~attach"],
            };
            const offerMessage = {
                type: types_js_1.ariesMessageTypesCredential.OFFER_CREDENTIAL,
                to: subject,
                from: issuer,
                id: offerID,
                body: offerCredential,
            };
            const packedMessage = await context.agent.packDIDCommMessage({
                packing: "jws",
                message: offerMessage,
            });
            try {
                context.agent
                    .sendDIDCommMessage({
                    messageId: offerID,
                    packedMessage,
                    recipientDidUrl: subject,
                })
                    .then(() => {
                    console.log("Sent Offer Credential: " + offerID);
                });
            }
            finally {
                await (0, utils_js_1.saveMessage)(offerMessage, context);
            }
        }
        if (messageType == types_js_1.ariesMessageTypesCredential.OFFER_CREDENTIAL) {
            console.log("Recieved Message from: " + message.from);
            console.log("Message type: " + messageType);
            console.log("Offer Credential ID: " + message.id);
            let attach;
            try {
                attach = message.data["offers~attach"][0].data;
            }
            catch (error) {
                console.log(error);
                return message;
            }
            console.log("Credential offers~attach list: " + JSON.stringify(attach, null, 2));
        }
        if (messageType == types_js_1.ariesMessageTypesCredential.REQUEST_CREDENTIAL) {
            console.log("Recieved Message from: " + message.from);
            console.log("Message type: " + messageType);
            console.log("Request Credential ID: " + message.id);
            let attach;
            let credentialType;
            let subject;
            let issuer;
            try {
                attach = message.data["requests~attach"][0].data;
                credentialType = attach.credential.type;
                console.log("Requested credential type: " + credentialType);
                subject = attach.credential.credentialSubject.id;
                issuer = attach.credential.issuer;
            }
            catch (error) {
                console.log(error);
                return message;
            }
            console.log("Extracted data from message");
            const schemaFound = await (0, utils_js_1.checkResquestType)(credentialType, context);
            if (!schemaFound) {
                return message;
            }
            // Check whether the credential proposed was already issued
            const replacement_id = await (0, utils_js_1.checkPreviusCredential)(subject, credentialType, context);
            const issueAttachPayload = await (0, utils_js_1.createIssueCredential)(attach.credential, context);
            // IDs for message
            const issueID = (0, uuid_1.v4)();
            const issueCredential = {
                "@type": types_js_1.ariesMessageTypesCredential.ISSUE_CREDENTIAL,
                "@id": issueID,
                comment: "This is the credential you requested",
                replacement_id: replacement_id,
                formats: issueAttachPayload.formats,
                "credentials~attach": issueAttachPayload["credentials~attach"],
            };
            const issueMessage = {
                type: types_js_1.ariesMessageTypesCredential.ISSUE_CREDENTIAL,
                to: subject,
                from: issuer,
                id: issueID,
                body: issueCredential,
            };
            const packedMessage = await context.agent.packDIDCommMessage({
                packing: "jws",
                message: issueMessage,
            });
            try {
                context.agent
                    .sendDIDCommMessage({
                    messageId: issueID,
                    packedMessage,
                    recipientDidUrl: subject,
                })
                    .then(() => {
                    console.log("Sent Issue Credential: " + issueID);
                });
            }
            finally {
                await (0, utils_js_1.saveMessage)(issueMessage, context);
            }
        }
        if (messageType == types_js_1.ariesMessageTypesCredential.ISSUE_CREDENTIAL) {
            console.log("Recieved Message from: " + message.from);
            console.log("Message type: " + messageType);
            console.log("Issue Credential ID: " + message.id);
            if (message.data.replacement_id) {
                console.log("Overwriting previous credential: ");
                const result = await context.agent.dataStoreDeleteVerifiableCredential({
                    hash: message.data.replacement_id,
                });
                console.log(result);
            }
            let attach;
            try {
                attach = message.data["credentials~attach"][0].data;
                await context.agent.dataStoreSaveVerifiableCredential({
                    verifiableCredential: attach,
                });
            }
            catch (error) {
                console.log(error);
                return message;
            }
            console.log("Verifiable Credential: " + JSON.stringify(attach, null, 2));
        }
        return super.handle(message, context);
    }
}
exports.IssueCredentialHandler = IssueCredentialHandler;
