import { AbstractMessageHandler, Message } from "@veramo/message-handler";
import { IAgentContext, IDIDManager, IKeyManager } from "@veramo/core-types";
import { IDIDComm, IDIDCommMessage } from "@veramo/did-comm";
import { ariesMessageTypesCredential } from "../types/types.js";
import { v4 } from "uuid";
import { ICredentialPlugin } from "@veramo/core";
import {
  checkPreviusCredential,
  checkResquestType,
  createIssueCredential,
  createOfferCredential,
  saveMessage,
} from "../utils.js";
import { IDataStoreORM, IDataStore } from "../data-store/index.js";

type IContext = IAgentContext<
  IDIDManager &
    IKeyManager &
    IDIDComm &
    IDataStore &
    ICredentialPlugin &
    IDataStoreORM
>;

export class IssueCredentialHandler extends AbstractMessageHandler {
  constructor() {
    super();
  }

  async handle(message: Message, context: IContext): Promise<Message> {
    const messageType = message.type;
    if (messageType == ariesMessageTypesCredential.PROPOSE_CREDENTIAL) {
      console.log("Recieved Message from: " + message.from);
      console.log("Message type: " + messageType);
      console.log("Propose Credential: " + message.id);

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
      } catch (error) {
        console.log(error);
        return message;
      }

      console.log("Extracted data from message");

      // Create verifiable credential without proof for "attach~offer" attribute
      const offerAttachPayload = await createOfferCredential(
        message.data["credential_preview"],
        attach,
        context
      );

      // IDs for message
      const offerID = v4();

      const offerCredential = {
        "@type": ariesMessageTypesCredential.OFFER_CREDENTIAL,
        "@id": offerID,
        comment: "These are the credentials we can offer",
        formats: offerAttachPayload?.formats,
        "offer~attach": offerAttachPayload?.["offer~attach"],
      };

      const offerMessage: IDIDCommMessage = {
        type: ariesMessageTypesCredential.OFFER_CREDENTIAL,
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
      } finally {
        await saveMessage(offerMessage, context);
      }
    }

    if (messageType == ariesMessageTypesCredential.OFFER_CREDENTIAL) {
      console.log("Recieved Message from: " + message.from);
      console.log("Message type: " + messageType);
      console.log("Offer Credential: " + message.id);
      let attach;
      try {
        attach = message.data["offer~attach"][0].data;
      } catch (error) {
        console.log(error);
        return message;
      }
      console.log(
        "Credential offer~attach list: " + JSON.stringify(attach, null, 2)
      );
    }

    if (messageType == ariesMessageTypesCredential.REQUEST_CREDENTIAL) {
      console.log("Recieved Message from: " + message.from);
      console.log("Message type: " + messageType);
      console.log("Request Credential: " + message.id);
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
      } catch (error) {
        console.log(error);
        return message;
      }

      console.log("Extracted data from message");

      const schemaFound = await checkResquestType(credentialType, context);
      if (!schemaFound) {
        return message;
      }

      // Check whether the credential proposed was already issued
      const replacement_id = await checkPreviusCredential(
        subject,
        credentialType,
        context
      );

      const issueAttachPayload = await createIssueCredential(
        attach.credential,
        context
      );

      // IDs for message
      const issueID = v4();

      const issueCredential = {
        "@type": ariesMessageTypesCredential.ISSUE_CREDENTIAL,
        "@id": issueID,
        comment: "This is the credential you requested",
        replacement_id: replacement_id,
        formats: issueAttachPayload.formats,
        "credentials~attach": issueAttachPayload["credentials~attach"],
      };

      const issueMessage: IDIDCommMessage = {
        type: ariesMessageTypesCredential.ISSUE_CREDENTIAL,
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
      } finally {
        await saveMessage(issueMessage, context);
      }
    }

    if (messageType == ariesMessageTypesCredential.ISSUE_CREDENTIAL) {
      console.log("Recieved Message from: " + message.from);
      console.log("Message type: " + messageType);
      console.log("Issue Credential: " + message.id);
      let attach;
      try {
        attach = message.data["credentials~attach"][0].data;
      } catch (error) {
        console.log(error);
        return message;
      }
      console.log("Verifiable Credential: " + JSON.stringify(attach, null, 2));
    }
    return super.handle(message, context);
  }
}
