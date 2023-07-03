import { AbstractMessageHandler } from "@veramo/message-handler";
import { ariesMessageTypesPresentation } from "../types/types.js";
import { createPresentation, saveMessage } from "../utils.js";
import { v4 } from "uuid";
export class PresentProofHandler extends AbstractMessageHandler {
    constructor() {
        super();
    }
    async handle(message, context) {
        const messageType = message.type;
        if (messageType == ariesMessageTypesPresentation.PROPOSE_PRESENTATION) {
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
        if (messageType == ariesMessageTypesPresentation.REQUEST_PRESENTATION) {
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
            const ariesPresentation = await createPresentation(attach, verifier, context);
            if (ariesPresentation == undefined) {
                return message;
            }
            const msgId = v4();
            const offerCredential = {
                "@type": ariesMessageTypesPresentation.PRESENTATION,
                "@id": msgId,
                comment: "Here you have the presentation requested",
                formats: ariesPresentation === null || ariesPresentation === void 0 ? void 0 : ariesPresentation.formats,
                "presentations~attach": ariesPresentation === null || ariesPresentation === void 0 ? void 0 : ariesPresentation["presentations~attach"],
            };
            const offerMessage = {
                type: ariesMessageTypesPresentation.PRESENTATION,
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
                await saveMessage(offerMessage, context);
            }
        }
        if (messageType == ariesMessageTypesPresentation.PRESENTATION) {
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
                            value: [ariesMessageTypesPresentation.REQUEST_PRESENTATION],
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
                    const challenge = messageData["presentations~attach"][0].data.options.challenge;
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
