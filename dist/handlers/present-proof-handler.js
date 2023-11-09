"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentProofHandler = void 0;
const message_handler_1 = require("@veramo/message-handler");
const types_js_1 = require("../types/types.js");
const utils_js_1 = require("../utils.js");
const uuid_1 = require("uuid");
class PresentProofHandler extends message_handler_1.AbstractMessageHandler {
    constructor() {
        super();
    }
    async handle(message, context) {
        const messageType = message.type;
        if (messageType == types_js_1.ariesMessageTypesPresentation.PROPOSE_PRESENTATION) {
            console.log("Recieved Message from: " + message.from);
            console.log("Message type: " + messageType);
            console.log("Propose Presentation: " + message.id);
            let attach;
            let subject;
            try {
                attach = message.data["proposals~attach"][0].data;
                subject = message.from;
            }
            catch (error) {
                console.log(error);
                return message;
            }
            const credentialType = attach.input_descriptors.name;
            let result;
            try {
                result = await context.agent.dataStoreORMGetCredentialSchemas({
                    where: [{ column: "type", value: [credentialType] }],
                });
            }
            catch (error) {
                console.log(error);
                return message;
            }
            if (result.length == 0) {
                console.log("Credential type: " + credentialType + " not supported");
                return message;
            }
            else {
                console.log("Credential type: " + credentialType + " supported");
            }
            await context.agent.sendRequestPresentation({
                credentialType,
                holder: subject,
            });
        }
        if (messageType == types_js_1.ariesMessageTypesPresentation.REQUEST_PRESENTATION) {
            console.log("Recieved Message from: " + message.from);
            console.log("Message type: " + messageType);
            console.log("Request Presentation: " + message.id);
            let attach;
            let subject;
            let verifier;
            try {
                attach = message.data["request_presentations~attach"][0].data;
                subject = message.to;
                verifier = message.from;
            }
            catch (error) {
                console.log(error);
                return message;
            }
            const ariesPresentation = await (0, utils_js_1.createPresentation)(attach, verifier, context);
            if (ariesPresentation == undefined) {
                return message;
            }
            const msgId = (0, uuid_1.v4)();
            const offerCredential = {
                "@type": types_js_1.ariesMessageTypesPresentation.PRESENTATION,
                "@id": msgId,
                comment: "Here you have the presentation requested",
                formats: ariesPresentation?.formats,
                "presentations~attach": ariesPresentation?.["presentations~attach"],
            };
            const offerMessage = {
                type: types_js_1.ariesMessageTypesPresentation.PRESENTATION,
                to: verifier,
                from: subject,
                id: msgId,
                body: offerCredential,
            };
            const packedMessage = await context.agent.packDIDCommMessage({
                packing: "jws",
                message: offerMessage,
            });
            try {
                context.agent
                    .sendDIDCommMessage({
                    messageId: msgId,
                    packedMessage,
                    recipientDidUrl: verifier,
                })
                    .then(() => {
                    console.log("Sent Presentation: " + msgId);
                });
            }
            finally {
                await (0, utils_js_1.saveMessage)(offerMessage, context);
            }
        }
        if (messageType == types_js_1.ariesMessageTypesPresentation.PRESENTATION) {
            console.log("Recieved Message from: " + message.from);
            console.log("Message type: " + messageType);
            console.log("Presentation: " + message.id);
            var attach;
            try {
                attach = message.data["presentations~attach"][0].data;
            }
            catch (error) {
                console.log(error);
            }
            // Get challenge from previous request message
            let requestMessages;
            try {
                requestMessages = await context.agent.dataStoreORMGetMessages({
                    where: [
                        { column: "from", value: [message.to] },
                        {
                            column: "type",
                            value: [types_js_1.ariesMessageTypesPresentation.REQUEST_PRESENTATION],
                        },
                    ],
                });
                if (requestMessages.length == 0) {
                    console.log("Not found previous Request Presentation");
                }
                else {
                    console.log("Found previous Request Presentation");
                    const messageData = requestMessages[requestMessages.length - 1]
                        .data;
                    const challenge = messageData["request_presentations~attach"][0].data.options
                        .challenge;
                    console.log("Challenge: " + challenge);
                    const result = await context.agent.verifyPresentation({
                        presentation: attach,
                        challenge: challenge,
                    });
                    console.log("Verified Presentation: " + result.verified);
                    if (!result.verified) {
                        console.log("Verification error: " + result.error);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        return super.handle(message, context);
    }
}
exports.PresentProofHandler = PresentProofHandler;
