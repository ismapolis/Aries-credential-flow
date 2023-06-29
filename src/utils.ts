import {
  CredentialPayload,
  IAgentContext,
  ICredentialIssuer,
  ICredentialPlugin,
  IDIDManager,
  IKeyManager,
  IMessage,
  PresentationPayload,
} from "@veramo/core";
import { IDIDComm, IDIDCommMessage } from "@veramo/did-comm";
import { OrPromise } from "@veramo/utils";
import { DataSource } from "typeorm";
import { ICredentialSchema, IDataStoreORM } from "./data-store/index.js";
import { v4 } from "uuid";
import { IDataStore } from "./data-store/index.js";

export async function checkPreviusCredential(
  subject: string,
  type: string,
  context: IAgentContext<
    IDIDManager & IKeyManager & IDataStore & IDIDComm & IDataStoreORM
  >
) {
  console.log("Cheking for previous credentials...");
  try {
    const credentials =
      await context.agent.dataStoreORMGetVerifiableCredentials({
        where: [
          { column: "subject", value: [subject] },
          { column: "type", value: [`${type[0]},${type[1]}`] },
        ],
      });
    console.log("Found: " + credentials.length);
    if (credentials.length > 0) {
      const id = credentials[credentials.length - 1].verifiableCredential.id;
      console.log("Adding ID from last generated credential:" + id);
      return id;
    } else {
      return undefined;
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function createOfferCredential(
  preview: any,
  attach: any,
  context: IAgentContext<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDIDComm &
      ICredentialPlugin &
      IDataStoreORM
  >
) {
  try {
    // Check whether we have a compatible schema with attributes from credential preview
    // 1. Get all credentialSchemas
    const schemas = await context.agent.dataStoreGetAllCredentialSchema();

    // 2. Get attributes from preview
    const previewAttributes = preview.attributes.map((attribute: any) => {
      return attribute.name;
    });
    console.log(
      "Attributes from credential_preview: " + previewAttributes.toString()
    );

    // 3. Get compatibles schemas with preview attributes
    const compatibleSchemas = schemas.map((schema: any) => {
      const schemaAttributes = schema.attributes.split(",");
      if (
        previewAttributes.every((attr: any) => schemaAttributes.includes(attr))
      ) {
        return schema;
      }
      return;
    });
    console.log(
      "Compatible credentialSchemas: " + JSON.stringify(compatibleSchemas)
    );

    if (compatibleSchemas.length == 0) {
      return undefined;
    } else {
      const offerAttachPayload = {
        formats: new Array(),
        "offer~attach": new Array(),
      };

      // 4. Add corresponding "formats" and "offer~attach" entries for every compatible
      compatibleSchemas.forEach(async (schema: any) => {
        const attachID = v4();

        // Add "formats" entry
        const format = {
          attach_id: attachID,
          format: "aries/ld-proof-vc-detail@v1.0",
        };
        offerAttachPayload.formats.push(format);

        // Add "offer~attach" entry
        let credential: CredentialPayload = {
          issuer: attach.credential.issuer,
          type: ["VerifiableCredential", (schema as ICredentialSchema).type],
          credentialSubject: {
            id: attach.credential.credentialSubject.id,
          },
        };
        const attributes = (schema as ICredentialSchema).attributes.split(",");
        attributes.forEach((attr) => {
          if (credential.credentialSubject) {
            credential.credentialSubject[attr.toString()] =
              attr + "DefaultValue";
          }
        });

        const offerAttach = {
          "@id": attachID,
          "mime-type": "application/json",
          data: {
            credential: credential,
            options: {
              proofType: "EcdsaSecp256k1RecoverySignature2020",
            },
          },
        };
        offerAttachPayload["offer~attach"].push(offerAttach);
      });
      return offerAttachPayload;
    }
  } catch (error) {
    console.log(error);
  }
  return;
}

export async function getConnectedDb(
  dbConnection: OrPromise<DataSource>
): Promise<DataSource> {
  if (dbConnection instanceof Promise) {
    return await dbConnection;
  } else if (!dbConnection.isInitialized) {
    return await (<DataSource>dbConnection).initialize();
  } else {
    return dbConnection;
  }
}

export async function saveMessage(
  message: IDIDCommMessage,
  context: IAgentContext<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDIDComm &
      ICredentialPlugin &
      IDataStoreORM
  >
) {
  let saveMessagePayload: IMessage = {
    id: message.id,
    type: message.type,
    data: message.body,
    from: message.from,
    to: message.to,
  };
  let result = await context.agent.dataStoreSaveMessage({
    message: saveMessagePayload,
  });
  console.log("Saved Message: " + result);
}

export async function checkResquestType(
  type: any,
  context: IAgentContext<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDIDComm &
      ICredentialPlugin &
      IDataStoreORM
  >
) {
  console.log("Looking for credentialSchema: " + type[1]);
  let result;
  try {
    result = await context.agent.dataStoreORMGetCredentialSchemas({
      where: [{ column: "type", value: [type[1]] }],
    });
    if (result.length > 0) {
      console.log("Found credentialSchema.");
      return true;
    } else {
      console.log("Not found credentialSchema.");
      return false;
    }
  } catch (error) {
    console.log(error);
  }
  return false;
}

export async function createIssueCredential(
  credential: any,
  context: IAgentContext<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDIDComm &
      ICredentialPlugin &
      IDataStoreORM
  >
) {
  console.log("Creating verifiable credential.");
  const type = credential.type;
  const attachID = v4();

  const issueAttachPayload = {
    formats: new Array(),
    "credentials~attach": new Array(),
  };

  const format = {
    attach_id: attachID,
    format: "aries/ld-proof-vc@v1.0",
  };

  issueAttachPayload.formats.push(format);

  let schema;
  let credentialPayload: CredentialPayload;
  let verifiableCredential;

  try {
    schema = await context.agent.dataStoreORMGetCredentialSchemas({
      where: [{ column: "type", value: [type[1]] }],
    });

    credentialPayload = {
      id: v4(),
      issuer: credential.issuer,
      type: credential.type,
      credentialSubject: {
        id: credential.credentialSubject.id,
      },
    };

    const attributes = schema[0].attributes.split(",");
    attributes.forEach((attr: string) => {
      if (credential.credentialSubject) {
        credential.credentialSubject[attr.toString()] = attr + "DefaultValue";
      }
    });

    verifiableCredential = await context.agent.createVerifiableCredential({
      credential: credentialPayload,
      proofFormat: "lds",
    });

    await context.agent.dataStoreSaveVerifiableCredential({
      verifiableCredential: verifiableCredential,
    });
  } catch (error) {
    console.log(error);
  }

  const issueAttach = {
    "@id": attachID,
    "mime-type": "application/ld+json",
    data: verifiableCredential,
  };

  issueAttachPayload["credentials~attach"].push(issueAttach);

  return issueAttachPayload;
}

export async function createPresentation(
  attach: any,
  subject: string,
  verifier: string,
  context: IAgentContext<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDIDComm &
      ICredentialPlugin &
      IDataStoreORM &
      ICredentialIssuer
  >
) {
  // 1. Get credential type requested from Verifier
  const credentialType =
    attach.presentation_definition.input_descriptors.schema.id;

  // 2. Check wether holder has any compatible credential stored
  let credentials;
  let verifiableCredential;
  try {
    credentials = await context.agent.dataStoreORMGetVerifiableCredentials({
      where: [
        { column: "type", value: ["VerifiableCredential," + credentialType] },
      ],
    });
    if (credentials.length > 0) {
      verifiableCredential = credentials[0];
    } else {
      throw "Not found credential requested";
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }

  // 3. Get corresponding verifiable credential and generate presentation payload
  let ariesPresentationPayload: PresentationPayload;
  if (!verifiableCredential?.verifiableCredential) {
    return undefined;
  } else {
    ariesPresentationPayload = {
      holder: subject,
      issuanceDate: new Date(),
      verifiableCredential: [verifiableCredential.verifiableCredential],
      verifier: [verifier],
    };
  }

  // 4. Generate verifiable presentation
  let presentation;
  try {
    presentation = await context.agent.createVerifiablePresentation({
      challenge: attach.options.challenge,
      presentation: ariesPresentationPayload,
      proofFormat: "EthereumEip712Signature2021",
    });
    // 5. Format attach attribute
    const presentationAttachPayload = {
      formats: new Array(),
      "presentations~attach": new Array(),
    };

    const attachID = v4();

    const format = {
      attach_id: attachID,
      format: "dif/presentation-exchange/submission@v1.0",
    };
    presentationAttachPayload.formats.push(format);

    const presentationAttach = {
      "@id": attachID,
      "mime-type": "application/ld+json",
      data: presentation,
    };
    presentationAttachPayload["presentations~attach"].push(presentationAttach);

    return presentationAttachPayload;
  } catch (error) {
    console.log(error);
  }
  return undefined;
}
