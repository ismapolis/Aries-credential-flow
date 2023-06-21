import { AbstractMessageHandler } from "@veramo/message-handler";
import { ariesMessageTypesPresentation } from "../types/message-types.js";
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
            const ariesPresentation = await createPresentation(attach, subject, verifier, context);
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
                to: subject,
                from: verifier,
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
                    recipientDidUrl: subject,
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
            let attach;
            try {
                attach = message.data["presentations~attach"][0].data;
            }
            catch (error) { }
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
                    console.log("Found " + requestMessages.length + " Messages");
                    const messageData = requestMessages[requestMessages.length - 1]
                        .data;
                    const challenge = messageData["request_presentations~attach"][0].data.options
                        .challenge;
                    console.log("Challenge:" + challenge);
                    const result = await context.agent.verifyPresentation({
                        presentation: attach,
                        challenge: challenge,
                    });
                    console.log("Verified Presentation: " + result.verified);
                    if (!result.verified) {
                        console.log("Verification error: " + result.error);
                    }
                    else {
                        const saveResult = await context.agent.dataStoreSaveVerifiablePresentation({
                            verifiablePresentation: attach,
                        });
                        console.log("Saved Verifiable Presentation: " + saveResult);
                    }
                }
            }
            catch (error) { }
        }
        return super.handle(message, context);
    }
}
