import { v4 } from "uuid";
export async function checkPreviusCredential(subject, type, context) {
    console.log("Cheking for previous credentials...");
    try {
        const credentials = await context.agent.dataStoreORMGetVerifiableCredentials({
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
        }
        else {
            return undefined;
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
}
export async function createOfferCredential(preview, attach, context) {
    try {
        // Check whether we have a compatible schema with attributes from credential preview
        // 1. Get all credentialSchemas
        const schemas = await context.agent.dataStoreGetAllCredentialSchema();
        // 2. Get attributes from preview
        const previewAttributes = preview.attributes.map((attribute) => {
            return attribute.name;
        });
        console.log("Attributes from credential_preview: " + previewAttributes.toString());
        // 3. Get compatibles schemas with preview attributes
        const compatibleSchemas = schemas.map((schema) => {
            const schemaAttributes = schema.attributes.split(",");
            if (previewAttributes.every((attr) => schemaAttributes.includes(attr))) {
                return schema;
            }
            return;
        });
        console.log("Compatible credentialSchemas: " + JSON.stringify(compatibleSchemas));
        if (compatibleSchemas.length == 0) {
            return undefined;
        }
        else {
            const offerAttachPayload = {
                formats: new Array(),
                "offer~attach": new Array(),
            };
            // 4. Add corresponding "formats" and "offer~attach" entries for every compatible
            compatibleSchemas.forEach(async (schema) => {
                const attachID = v4();
                // Add "formats" entry
                const format = {
                    attach_id: attachID,
                    format: "aries/ld-proof-vc-detail@v1.0",
                };
                offerAttachPayload.formats.push(format);
                // Add "offer~attach" entry
                let credential = {
                    issuer: attach.credential.issuer,
                    type: ["VerifiableCredential", schema.type],
                    credentialSubject: {
                        id: attach.credential.credentialSubject.id,
                    },
                };
                const attributes = schema.attributes.split(",");
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
    }
    catch (error) {
        console.log(error);
    }
    return;
}
export async function getConnectedDb(dbConnection) {
    if (dbConnection instanceof Promise) {
        return await dbConnection;
    }
    else if (!dbConnection.isInitialized) {
        return await dbConnection.initialize();
    }
    else {
        return dbConnection;
    }
}
export async function saveMessage(message, context) {
    let saveMessagePayload = {
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
export async function checkResquestType(type, context) {
    console.log("Looking for credentialSchema: " + type[1]);
    let result;
    try {
        result = await context.agent.dataStoreORMGetCredentialSchemas({
            where: [{ column: "type", value: [type[1]] }],
        });
        if (result.length > 0) {
            console.log("Found credentialSchema.");
            return true;
        }
        else {
            console.log("Not found credentialSchema.");
            return false;
        }
    }
    catch (error) {
        console.log(error);
    }
    return false;
}
export async function createIssueCredential(credential, context) {
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
    let credentialPayload;
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
        attributes.forEach((attr) => {
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
    }
    catch (error) {
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
export async function createPresentation(attach, subject, verifier, context) {
    // 1. Get credential type requested from Verifier
    const credentialType = attach.presentation_definition.input_descriptors.schema.id;
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
        }
        else {
            throw "Not found credential requested";
        }
    }
    catch (error) {
        console.log(error);
        return undefined;
    }
    // 3. Get corresponding verifiable credential and generate presentation payload
    let ariesPresentationPayload;
    if (!(verifiableCredential === null || verifiableCredential === void 0 ? void 0 : verifiableCredential.verifiableCredential)) {
        return undefined;
    }
    else {
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
    }
    catch (error) {
        console.log(error);
    }
    return undefined;
}
