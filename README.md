# Documentation Aries Credential Flow Plugin

An implementation prototype for the issue-credential and present-proof Aries standards for [Veramo Agent](https://veramo.io/docs/veramo_agent/introduction/). This implementation allows you to send and handle [DIDComm](https://identity.foundation/didcomm-messaging/spec/) messages based on these [Aries RFCs](https://github.com/hyperledger/aries-rfcs/tree/main).

In addition, this plugin comes with a custom DataStore plugin that extends the original Veramo DataStore and adds support for registering and verifying credential schemas.

### Supported RFCs

- [Aries RFC 0453](https://github.com/hyperledger/aries-rfcs/tree/main/features/0453-issue-credential-v2): Issue Credential Protocol 2.0
- [Aries RFC 0454](https://github.com/hyperledger/aries-rfcs/tree/main/features/0454-present-proof-v2): Present Proof Protocol 2.0

### Other used RFCs

These are the attachment format standards used for the messages:

- [Aries RFC 0593](https://github.com/hyperledger/aries-rfcs/blob/main/features/0593-json-ld-cred-attach/README.md#ld-proof-vc-detail-attachment-format): JSON-LD Credential Attachment format for requesting and issuing credentials.
- [Aries RFC 0510](https://github.com/hyperledger/aries-rfcs/blob/main/features/0510-dif-pres-exch-attach/README.md#reference): Presentation-Exchange Attachment format for requesting and presenting proofs.

## Setup

Add the corresponding plugins. Two new MessageHandlers, custom datastores and CredentialFlow.

```typescript
export const veramoAgent = createAgent<VeramoAgent>({
  plugins: [
    new MessageHandler({
      messageHandlers: [
        new DIDCommMessageHandler(),
        new IssueCredentialHandler(),
        new PresentProofHandler(),
      ],
    }),
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new CredentialFlow(),
  ],
});
```

## Usage

In this section, we are going to explain how this plugin works and the differences it may have with the respective specification.

### IssueCredentialHanlder

This handler supports the four message types defined in the specification.

- propose-credential
- offer-credential
- request-credential
- issue-credential

Here we are going to explain how each one works.

#### Propose and Offer

Holder sends a `propose-credential` message to credential Issuer. The Issuer retrieves the `credential_preview` attribute from received message and checks whether any credential schema with strict compatible claims is registered. The attributes from the credential_preview must be a subset of the attributes from a credential schema.

If there is any compatible schema, Issuer generates corresponding verifiable credentials without proof and send `offer-credential` to Holder.

**_Note:_**
The mechanism used in the specification may not be very useful when discussing the claims a credential should have. In the `offer-credential` message, the specification introduces the attribute `multiple_available`. This attribute is used to communicate to the Holder that there are multiple credentials of the same type available to be issued, but it does not provide information about the specific claim values associated with each credential.

#### Request and Issue

Once Holder has received offer message from Issuer, he can receive the list of available credentials to request. If Holder already knows what type of credentials wants he can start the communication with a `request-credential` message.

Issuer recieves `request-credential` chekcs whether credential type requested is one he can issue and then creates the verifiable credential. In this process, the issuer also checks whether he has already issued the same credential type for the specific holder's did. If this is the case, the issuer adds a `replacement_id` attribute to the message. This attribute contains the hash of the previously issued credential, allowing the holder to overwrite it in their wallet.

**_Note:_**
As this is a prototype, the Issuer uses `default-values` for the different claims. In a production environment, the Issuer would retrieve this information from the database for accurate values.

### PresentProofHanlder

This handler supports the three message types defined in the specification.

- propose-presentation
- request-presentation
- presentation

Here we are going to explain how each one works.

#### Flow

These message types serve as communication starters for this standard. "Propose" is used when a holder wants to initiate the communication flow with a verifier. In this case, the holder does not need to know which schemas the verifier supports, so they can propose a credential type. If the verifier accepts the received credential type, he proceeds to send a `presentation-request` and wait for the holder to generate a verifiable presentation. Once the presentation is received, the verifier checks both the signatures from the holder and the issuer.

**_Note:_**
When generating a request, the verifier specefies and saves a challenge for the holder to generate the presentation. Once recieved the presentation, the verifier retrieves last `presentation-request` sent to presentation holder.

### CredentialFlow Plugin

The CredentialFlow class is the element that allows to send the different message types. You can only send the messages that the especification define as communication starters.
Holder to Issuer: propose and request, and Issuer to Hoder: offer.

**_Note:_**
This is CredentialFlow plugin interface.

```typescript
sendProposeCredential(
    args: {
      credentialPreview: ICredentialPreview;
      issuer: string;
    },
    context: IContext
  ): Promise<void>;

  sendOfferCredential(
    args: {
      credentialType: string;
      holder: string;
    },
    context: IContext
  ): Promise<void>;

  sendRequestCredential(
    args: {
      credentialType: string;
      issuer: string;
    },
    context: IContext
  ): Promise<void>;

  sendProposePresentation(
    args: {
      credentialType: string;
      verifier: string;
    },
    context: IContext
  ): Promise<void>;

  sendRequestPresentation(
    args: {
      credentialType: string;
      holder: string;
    },
    context: IContext
  ): Promise<void>;
```

## Preparation

We have prepared some npm scripts in case a demonstration is needed to showcase how this plugin works and how to initiate communication.

The demo is deployed locally and uses Ganache blockchain as verifiable registry. Therefore, it is necesary to start a [Ganache](https://trufflesuite.com/ganache/) node on the localhost. The demo agent connects to [ws://localhost:8545](ws://localhost:8545), which is the default endpoint when a Ganache network is started.

In addition,this demo generates and uses `did:ethr` identifiers. The Ethereum DID method adds an extra part for identifying the network on which the [smart contract](https://github.com/uport-project/ethr-did-registry/blob/develop/contracts/EthereumDIDRegistry.sol) is deployed. In the case of working on localhost, the identifiers will start with: `did:ethr:development:`.

### Prerequisites

In order to send and receive any DIDComm messages, there are some prerequisites that need to be fulfilled. The user must have:

- A decentralized identifier.
- A DIDComm Messaging endpoint defined in that DID document.
- A functioning endpoint listening to the specified address.

### Agent setup for communication

In order to meet the needs listed above follow the next steps.

#### 1. Generate did

Veramo allows to register new identifiers with an alias. For this case every new identifier is set to `default` and previous default did alias is changed to a random uuid.

```console
iillan@iillan-lap:~/code/veramo/credential-flow-plugin$ npm run addIdentifier

> veramo-agent@1.0.0 addIdentifier
> node dist/__tests__/addIdentifier.js

New identifier created: did:ethr:development:0x03fd13a4619968dbcef148d7c39de98773dfe7439d800eaa7e72dec85327493d68
```

#### 2. Add messaging service to did document

For this demo endpoints are deployed on local host so user just have to especify desired port.

```console
iillan@iillan-lap:~/code/veramo/credential-flow-plugin$ npm run addMessagingSvc 9999

> veramo-agent@1.0.0 addMessagingSvc
> node dist/__tests__/addMessagingSvc.js "9999"

Added DIDCommMessaging Service on port: 9999
txHash:0xe7f46db78d44f26d599bed12ce7399d9b32353164ca17179b70e8fb786436498
```

#### 3. Start listening endpoint

Now it is time to deploy the endpoint and wait for new messages.

**_Note:_**
To reproduce the demo, you will need two agents, which implies having two terminal endpoints, as well as two additional terminals for executing the scripts.

```console
iillan@iillan-lap:~/code/veramo/credential-flow-plugin$ npm run startMessagingSvc

> veramo-agent@1.0.0 startMessagingSvc
> node dist/__tests__/startMessagingSvc.js

DIDCommMessaging Service listening on port: 9999
```

## Communication flow demo

First, we are going to demonstrate how a user can acquire a credential, and then we will explain the process of presenting and verifying that credential.

For the next scenarios, you will need two different agents to fulfill different roles. This can be as simple as cloning the repository and then copying the generated directory into a new one. Take note of the working directory where you should execute the scripts.

**_Note:_**
At any moment, if you want to check the structure of the complete message, you can use the script `npm run getMessage`. This script receives the message ID as an argument and retrieves it from the SQLite database used by Veramo.

### Credential issuance

#### 1. Propose

The user may not know exactly which credential type they want, so he generates a `credential_preview` with the desired attributes and values he would like to receive.

<details>
<summary>Example credential_preview</summary>

```json
{
  "@type": "https://didcomm.org/issue-credential/2.0/credential-preview",
  "attributes": [
    {
      "name": "grado",
      "value": "Universitario"
    },
    {
      "name": "titulo",
      "value": "Ingenieria Informatica"
    }
  ]
}
```

</details>

<br>

```
iillan@iillan-lap:~/holder$ npm run sendProposeVC did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143

> veramo-agent@1.0.0 sendProposeVC
> node dist/__tests__/sendProposeCred.js "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143"

Sent Propose Credential: bb526ae7-f005-4350-9f8d-045649d008a2
```

<details>
<summary>Propose-credential message</summary>

```json
{
  "id": "bb526ae7-f005-4350-9f8d-045649d008a2",
  "type": "https://didcomm.org/issue-credential/2.0/propose-credential",
  "raw": "{\"protected\":\"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiNjb250cm9sbGVyIiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1zaWduZWQranNvbiJ9\",\"payload\":\"eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9pc3N1ZS1jcmVkZW50aWFsLzIuMC9wcm9wb3NlLWNyZWRlbnRpYWwiLCJ0byI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDJhN2I0OTg0ZWNiMTliN2M1YTI5ODY3MzVlNWQ1MTkyNGE5NzY3MzIzZjVkMGUzNzUxNmRkMjU2ZTg3NDIwMTQzIiwiZnJvbSI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDI1ODYyYmFmMmNkYjY5MzdmOWZlZjQ1NGRhM2RhOTZmZTkyNTc2NGI5YjkzNjI1MDdmNzMyZDFiZDA5ZTk3MDJmIiwiaWQiOiJiYjUyNmFlNy1mMDA1LTQzNTAtOWY4ZC0wNDU2NDlkMDA4YTIiLCJib2R5Ijp7IkB0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9pc3N1ZS1jcmVkZW50aWFsLzIuMC9wcm9wb3NlLWNyZWRlbnRpYWwiLCJAaWQiOiJiYjUyNmFlNy1mMDA1LTQzNTAtOWY4ZC0wNDU2NDlkMDA4YTIiLCJjcmVkZW50aWFsX3ByZXZpZXciOnsiQHR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL2lzc3VlLWNyZWRlbnRpYWwvMi4wL2NyZWRlbnRpYWwtcHJldmlldyIsImF0dHJpYnV0ZXMiOlt7Im5hbWUiOiJncmFkbyIsInZhbHVlIjoiVW5pdmVyc2l0YXJpbyJ9LHsibmFtZSI6InRpdHVsbyIsInZhbHVlIjoiSW5nZW5pZXJpYSBJbmZvcm1hdGljYSJ9XX0sImZvcm1hdHMiOlt7ImF0dGFjaF9pZCI6IjFkN2M2MWU4LWVjNWMtNDNhZC1iMjI5LWE3ZmU2MTFmNWY2MCIsImZvcm1hdCI6ImFyaWVzL2xkLXByb29mLXZjLWRldGFpbEB2MS4wIn1dLCJmaWx0ZXJzfmF0dGFjaCI6W3siQGlkIjoiMWQ3YzYxZTgtZWM1Yy00M2FkLWIyMjktYTdmZTYxMWY1ZjYwIiwibWltZS10eXBlIjoiYXBwbGljYXRpb24vanNvbiIsImRhdGEiOnsiY3JlZGVudGlhbCI6eyJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImlzc3VlciI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDJhN2I0OTg0ZWNiMTliN2M1YTI5ODY3MzVlNWQ1MTkyNGE5NzY3MzIzZjVkMGUzNzUxNmRkMjU2ZTg3NDIwMTQzIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiJ9fSwib3B0aW9ucyI6eyJwcm9vZlR5cGUiOiJFY2RzYVNlY3AyNTZrMVJlY292ZXJ5U2lnbmF0dXJlMjAyMCJ9fX1dfX0\",\"signature\":\"a6YH_Jpu1z8uGByCQfAst1ry6AmT4ZmeJF-CYTuKCx5U05PYajYswpWffp7m4AiDyb9ULCDg-lYYbJfLwqJrfA\"}",
  "data": {
    "@type": "https://didcomm.org/issue-credential/2.0/propose-credential",
    "@id": "bb526ae7-f005-4350-9f8d-045649d008a2",
    "credential_preview": {
      "@type": "https://didcomm.org/issue-credential/2.0/credential-preview",
      "attributes": [
        {
          "name": "grado",
          "value": "Universitario"
        },
        {
          "name": "titulo",
          "value": "Ingenieria Informatica"
        }
      ]
    },
    "formats": [
      {
        "attach_id": "1d7c61e8-ec5c-43ad-b229-a7fe611f5f60",
        "format": "aries/ld-proof-vc-detail@v1.0"
      }
    ],
    "filters~attach": [
      {
        "@id": "1d7c61e8-ec5c-43ad-b229-a7fe611f5f60",
        "mime-type": "application/json",
        "data": {
          "credential": {
            "type": ["VerifiableCredential"],
            "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
            "credentialSubject": {
              "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f"
            }
          },
          "options": {
            "proofType": "EcdsaSecp256k1RecoverySignature2020"
          }
        }
      }
    ]
  },
  "metaData": [
    {
      "type": "DIDCommMessaging",
      "value": "credential-flow-demo"
    },
    {
      "type": "didCommMetaData",
      "value": "{\"packing\":\"jws\"}"
    }
  ],
  "from": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
  "to": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143"
}
```

</details>

#### 2. Offer

Once Holder sends propose message, we should see something like this on Issuer endpoint terminal.

```
// Issuer terminal
Recieved Message from: did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f
Message type: https://didcomm.org/issue-credential/2.0/propose-credential
Propose Credential ID: bb526ae7-f005-4350-9f8d-045649d008a2
Proposed credential type: VerifiableCredential
Attributes from credential_preview: grado,titulo
Compatible credentialSchemas: [{"type":"UniversityDegreeCredential","attributes":"grado,titulo"}]
Saved Message: 9dd200dc-3333-4306-bef6-1559f6c645b7
Sent Offer Credential: 9dd200dc-3333-4306-bef6-1559f6c645b7
```

The issuer checks whether he can issue that specific type of credential. If he is able to do so, he proceeds to generate and send the offer.

Holder receives an offer with the possible credentials he can request. In this example, he proposed attributes that match the UniversityDegreeCredential schema. What the holder receives are the potential credentials, which are not verifiable because they are sent without the proof attribute.

```
// Holder terminal
Recieved Message from: did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143
Message type: https://didcomm.org/issue-credential/2.0/offer-credential
Offer Credential ID: 9dd200dc-3333-4306-bef6-1559f6c645b7
Credential offers~attach list: {
  "credential": {
    "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
    "type": [
      "VerifiableCredential",
      "UniversityDegreeCredential"
    ],
    "credentialSubject": {
      "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
      "grado": "gradoDefaultValue",
      "titulo": "tituloDefaultValue"
    }
  },
  "options": {
    "proofType": "EcdsaSecp256k1RecoverySignature2020"
  }
}
```

<details>
<summary>Offer-credential message</summary>

```json
{
  "id": "9dd200dc-3333-4306-bef6-1559f6c645b7",
  "type": "https://didcomm.org/issue-credential/2.0/offer-credential",
  "raw": "{\"protected\":\"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyYTdiNDk4NGVjYjE5YjdjNWEyOTg2NzM1ZTVkNTE5MjRhOTc2NzMyM2Y1ZDBlMzc1MTZkZDI1NmU4NzQyMDE0MyNjb250cm9sbGVyIiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1zaWduZWQranNvbiJ9\",\"payload\":\"eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9pc3N1ZS1jcmVkZW50aWFsLzIuMC9vZmZlci1jcmVkZW50aWFsIiwidG8iOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiIsImZyb20iOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyYTdiNDk4NGVjYjE5YjdjNWEyOTg2NzM1ZTVkNTE5MjRhOTc2NzMyM2Y1ZDBlMzc1MTZkZDI1NmU4NzQyMDE0MyIsImlkIjoiOWRkMjAwZGMtMzMzMy00MzA2LWJlZjYtMTU1OWY2YzY0NWI3IiwiYm9keSI6eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvaXNzdWUtY3JlZGVudGlhbC8yLjAvb2ZmZXItY3JlZGVudGlhbCIsIkBpZCI6IjlkZDIwMGRjLTMzMzMtNDMwNi1iZWY2LTE1NTlmNmM2NDViNyIsImNvbW1lbnQiOiJUaGVzZSBhcmUgdGhlIGNyZWRlbnRpYWxzIHdlIGNhbiBvZmZlciIsImZvcm1hdHMiOlt7ImF0dGFjaF9pZCI6IjNiODAwZGM4LWQ4YTMtNDhlOC04ZjQ4LTRmMWIyYmM3YWNhOCIsImZvcm1hdCI6ImFyaWVzL2xkLXByb29mLXZjLWRldGFpbEB2MS4wIn1dLCJvZmZlcnN-YXR0YWNoIjpbeyJAaWQiOiIzYjgwMGRjOC1kOGEzLTQ4ZTgtOGY0OC00ZjFiMmJjN2FjYTgiLCJtaW1lLXR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIiwiZGF0YSI6eyJjcmVkZW50aWFsIjp7Imlzc3VlciI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDJhN2I0OTg0ZWNiMTliN2M1YTI5ODY3MzVlNWQ1MTkyNGE5NzY3MzIzZjVkMGUzNzUxNmRkMjU2ZTg3NDIwMTQzIiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMjU4NjJiYWYyY2RiNjkzN2Y5ZmVmNDU0ZGEzZGE5NmZlOTI1NzY0YjliOTM2MjUwN2Y3MzJkMWJkMDllOTcwMmYiLCJncmFkbyI6ImdyYWRvRGVmYXVsdFZhbHVlIiwidGl0dWxvIjoidGl0dWxvRGVmYXVsdFZhbHVlIn19LCJvcHRpb25zIjp7InByb29mVHlwZSI6IkVjZHNhU2VjcDI1NmsxUmVjb3ZlcnlTaWduYXR1cmUyMDIwIn19fV19fQ\",\"signature\":\"a2A63ccVc5D4hSH2B3riZ3hHDa70T3x6_f76lnfOUMd8EmmCsRclznJ4cMLTn0LRh7JVPsjQB5M6sp62y-YZJA\"}",
  "data": {
    "@type": "https://didcomm.org/issue-credential/2.0/offer-credential",
    "@id": "9dd200dc-3333-4306-bef6-1559f6c645b7",
    "comment": "These are the credentials we can offer",
    "formats": [
      {
        "attach_id": "3b800dc8-d8a3-48e8-8f48-4f1b2bc7aca8",
        "format": "aries/ld-proof-vc-detail@v1.0"
      }
    ],
    "offers~attach": [
      {
        "@id": "3b800dc8-d8a3-48e8-8f48-4f1b2bc7aca8",
        "mime-type": "application/json",
        "data": {
          "credential": {
            "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
            "type": ["VerifiableCredential", "UniversityDegreeCredential"],
            "credentialSubject": {
              "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
              "grado": "gradoDefaultValue",
              "titulo": "tituloDefaultValue"
            }
          },
          "options": {
            "proofType": "EcdsaSecp256k1RecoverySignature2020"
          }
        }
      }
    ]
  },
  "metaData": [
    {
      "type": "DIDCommMessaging",
      "value": "credential-flow-demo"
    },
    {
      "type": "didCommMetaData",
      "value": "{\"packing\":\"jws\"}"
    }
  ],
  "from": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
  "to": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f"
}
```

</details>

#### 3. Request

Now that Holder knows which verifiable credential he can request, he proceeds to do so.

```
iillan@iillan-lap:~/holder$ npm run sendRequestVC did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143 UniversityDegreeCredential

> veramo-agent@1.0.0 sendRequestVC
> node dist/__tests__/sendRequestCred.js "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143" "UniversityDegreeCredential"

Sent Request Credential: 11f027ca-d0bc-4fb2-bb3a-6c5269cd6949

```

Holder receives an offer with the possible credentials he can request. In this example, he proposed attributes that match the UniversityDegreeCredential schema. What the holder receives are the potential credentials, which are not verifiable because they are sent without the proof attribute.

```
// Issuer terminal
Recieved Message from: did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f
Message type: https://didcomm.org/issue-credential/2.0/request-credential
Request Credential ID: 11f027ca-d0bc-4fb2-bb3a-6c5269cd6949
Requested credential type: VerifiableCredential,UniversityDegreeCredential
Extracted data from message
Looking for credentialSchema: UniversityDegreeCredential
Found credentialSchema.
Cheking for previous credentials...
Found: 0
Creating verifiable credential.
Saved Message: fb7c1e52-22e0-463b-af42-70d71dc16225
Sent Issue Credential: fb7c1e52-22e0-463b-af42-70d71dc16225
```

<details>
<summary>Request-credential message</summary>

```json
{
  "id": "11f027ca-d0bc-4fb2-bb3a-6c5269cd6949",
  "type": "https://didcomm.org/issue-credential/2.0/request-credential",
  "raw": "{\"protected\":\"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiNjb250cm9sbGVyIiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1zaWduZWQranNvbiJ9\",\"payload\":\"eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9pc3N1ZS1jcmVkZW50aWFsLzIuMC9yZXF1ZXN0LWNyZWRlbnRpYWwiLCJ0byI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDJhN2I0OTg0ZWNiMTliN2M1YTI5ODY3MzVlNWQ1MTkyNGE5NzY3MzIzZjVkMGUzNzUxNmRkMjU2ZTg3NDIwMTQzIiwiZnJvbSI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDI1ODYyYmFmMmNkYjY5MzdmOWZlZjQ1NGRhM2RhOTZmZTkyNTc2NGI5YjkzNjI1MDdmNzMyZDFiZDA5ZTk3MDJmIiwiaWQiOiIxMWYwMjdjYS1kMGJjLTRmYjItYmIzYS02YzUyNjljZDY5NDkiLCJib2R5Ijp7IkB0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9pc3N1ZS1jcmVkZW50aWFsLzIuMC9yZXF1ZXN0LWNyZWRlbnRpYWwiLCJAaWQiOiIxMWYwMjdjYS1kMGJjLTRmYjItYmIzYS02YzUyNjljZDY5NDkiLCJmb3JtYXRzIjpbeyJhdHRhY2hfaWQiOiIzMWU2ZWU5My1jM2UxLTRkNzMtYjg1Zi1hMmM2NTZhMDg0YzQiLCJmb3JtYXQiOiJhcmllcy9sZC1wcm9vZi12Yy1kZXRhaWxAdjEuMCJ9XSwicmVxdWVzdHN-YXR0YWNoIjpbeyJAaWQiOiIzMWU2ZWU5My1jM2UxLTRkNzMtYjg1Zi1hMmM2NTZhMDg0YzQiLCJtaW1lLXR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIiwiZGF0YSI6eyJjcmVkZW50aWFsIjp7InR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJVbml2ZXJzaXR5RGVncmVlQ3JlZGVudGlhbCJdLCJpc3N1ZXIiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyYTdiNDk4NGVjYjE5YjdjNWEyOTg2NzM1ZTVkNTE5MjRhOTc2NzMyM2Y1ZDBlMzc1MTZkZDI1NmU4NzQyMDE0MyIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMjU4NjJiYWYyY2RiNjkzN2Y5ZmVmNDU0ZGEzZGE5NmZlOTI1NzY0YjliOTM2MjUwN2Y3MzJkMWJkMDllOTcwMmYifX0sIm9wdGlvbnMiOnsicHJvb2ZUeXBlIjoiIn19fV19fQ\",\"signature\":\"q2MRC6xtbqQRTuhgAvzr-b0pBEmLPW6p5lO_UO6VD2RR3uXpn_RCtDPWWisjU_luJC_vT_AreExX43TehEi-Og\"}",
  "data": {
    "@type": "https://didcomm.org/issue-credential/2.0/request-credential",
    "@id": "11f027ca-d0bc-4fb2-bb3a-6c5269cd6949",
    "formats": [
      {
        "attach_id": "31e6ee93-c3e1-4d73-b85f-a2c656a084c4",
        "format": "aries/ld-proof-vc-detail@v1.0"
      }
    ],
    "requests~attach": [
      {
        "@id": "31e6ee93-c3e1-4d73-b85f-a2c656a084c4",
        "mime-type": "application/json",
        "data": {
          "credential": {
            "type": ["VerifiableCredential", "UniversityDegreeCredential"],
            "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
            "credentialSubject": {
              "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f"
            }
          },
          "options": {
            "proofType": ""
          }
        }
      }
    ]
  },
  "metaData": [
    {
      "type": "DIDCommMessaging",
      "value": "credential-flow-demo"
    },
    {
      "type": "didCommMetaData",
      "value": "{\"packing\":\"jws\"}"
    }
  ],
  "from": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
  "to": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143"
}
```

</details>

#### 4. Issue

Once the holder has received the requested verifiable credential, he can retrieve it from the message and verify it. The credential is then stored in the "wallet" for future use.

```
// Holder terminal
Recieved Message from: did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143
Message type: https://didcomm.org/issue-credential/2.0/issue-credential
Issue Credential ID: fb7c1e52-22e0-463b-af42-70d71dc16225
Verifiable Credential: ...
```

<details>
<summary>Verifiable Credential</summary>

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    {
      "grado": "https://schema.org/",
      "titulo": "https://schema.org/"
    },
    "https://w3id.org/security/suites/secp256k1recovery-2020/v2"
  ],
  "id": "0a5c496a-6981-4dd6-9708-3edd5b4f321f",
  "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
  "type": ["VerifiableCredential", "UniversityDegreeCredential"],
  "credentialSubject": {
    "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
    "grado": "gradoDefaultValue",
    "titulo": "tituloDefaultValue"
  },
  "issuanceDate": "2023-07-04T06:56:15.947Z",
  "proof": {
    "type": "EcdsaSecp256k1RecoverySignature2020",
    "created": "2023-07-04T06:56:15Z",
    "verificationMethod": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143#controller",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..3YvBe4kvP3uao97-QMBquYWTjbsCHlbV8fuZHiw2hY1UAAur0y5Zv_coDmjCdPLX_G7zGUs9DeAccC7hvFrCQQE"
  }
}
```

</details>

<details>
<summary>Issue-credential message</summary>

```json
{
  "id": "fb7c1e52-22e0-463b-af42-70d71dc16225",
  "type": "https://didcomm.org/issue-credential/2.0/issue-credential",
  "raw": "{\"protected\":\"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyYTdiNDk4NGVjYjE5YjdjNWEyOTg2NzM1ZTVkNTE5MjRhOTc2NzMyM2Y1ZDBlMzc1MTZkZDI1NmU4NzQyMDE0MyNjb250cm9sbGVyIiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1zaWduZWQranNvbiJ9\",\"payload\":\"eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9pc3N1ZS1jcmVkZW50aWFsLzIuMC9pc3N1ZS1jcmVkZW50aWFsIiwidG8iOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiIsImZyb20iOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyYTdiNDk4NGVjYjE5YjdjNWEyOTg2NzM1ZTVkNTE5MjRhOTc2NzMyM2Y1ZDBlMzc1MTZkZDI1NmU4NzQyMDE0MyIsImlkIjoiZmI3YzFlNTItMjJlMC00NjNiLWFmNDItNzBkNzFkYzE2MjI1IiwiYm9keSI6eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvaXNzdWUtY3JlZGVudGlhbC8yLjAvaXNzdWUtY3JlZGVudGlhbCIsIkBpZCI6ImZiN2MxZTUyLTIyZTAtNDYzYi1hZjQyLTcwZDcxZGMxNjIyNSIsImNvbW1lbnQiOiJUaGlzIGlzIHRoZSBjcmVkZW50aWFsIHlvdSByZXF1ZXN0ZWQiLCJmb3JtYXRzIjpbeyJhdHRhY2hfaWQiOiJlYWY5Y2Y4Yi1mMGNiLTQ0YmQtODlmZC0yMzIyMmY1NTlhMDEiLCJmb3JtYXQiOiJhcmllcy9sZC1wcm9vZi12Y0B2MS4wIn1dLCJjcmVkZW50aWFsc35hdHRhY2giOlt7IkBpZCI6ImVhZjljZjhiLWYwY2ItNDRiZC04OWZkLTIzMjIyZjU1OWEwMSIsIm1pbWUtdHlwZSI6ImFwcGxpY2F0aW9uL2xkK2pzb24iLCJkYXRhIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIix7ImdyYWRvIjoiaHR0cHM6Ly9zY2hlbWEub3JnLyIsInRpdHVsbyI6Imh0dHBzOi8vc2NoZW1hLm9yZy8ifSwiaHR0cHM6Ly93M2lkLm9yZy9zZWN1cml0eS9zdWl0ZXMvc2VjcDI1NmsxcmVjb3ZlcnktMjAyMC92MiJdLCJpZCI6IjBhNWM0OTZhLTY5ODEtNGRkNi05NzA4LTNlZGQ1YjRmMzIxZiIsImlzc3VlciI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDJhN2I0OTg0ZWNiMTliN2M1YTI5ODY3MzVlNWQ1MTkyNGE5NzY3MzIzZjVkMGUzNzUxNmRkMjU2ZTg3NDIwMTQzIiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlVuaXZlcnNpdHlEZWdyZWVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMjU4NjJiYWYyY2RiNjkzN2Y5ZmVmNDU0ZGEzZGE5NmZlOTI1NzY0YjliOTM2MjUwN2Y3MzJkMWJkMDllOTcwMmYiLCJncmFkbyI6ImdyYWRvRGVmYXVsdFZhbHVlIiwidGl0dWxvIjoidGl0dWxvRGVmYXVsdFZhbHVlIn0sImlzc3VhbmNlRGF0ZSI6IjIwMjMtMDctMDRUMDY6NTY6MTUuOTQ3WiIsInByb29mIjp7InR5cGUiOiJFY2RzYVNlY3AyNTZrMVJlY292ZXJ5U2lnbmF0dXJlMjAyMCIsImNyZWF0ZWQiOiIyMDIzLTA3LTA0VDA2OjU2OjE1WiIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDJhN2I0OTg0ZWNiMTliN2M1YTI5ODY3MzVlNWQ1MTkyNGE5NzY3MzIzZjVkMGUzNzUxNmRkMjU2ZTg3NDIwMTQzI2NvbnRyb2xsZXIiLCJwcm9vZlB1cnBvc2UiOiJhc3NlcnRpb25NZXRob2QiLCJqd3MiOiJleUpoYkdjaU9pSkZVekkxTmtzdFVpSXNJbUkyTkNJNlptRnNjMlVzSW1OeWFYUWlPbHNpWWpZMElsMTkuLjNZdkJlNGt2UDN1YW85Ny1RTUJxdVlXVGpic0NIbGJWOGZ1WkhpdzJoWTFVQUF1cjB5NVp2X2NvRG1qQ2RQTFhfRzd6R1VzOURlQWNjQzdodkZyQ1FRRSJ9fX1dfX0\",\"signature\":\"TaZHqerTMvp2O_NW1Snwn-MXCeDZb_Ti7NFa3Xe7b02mVZuVEyPbpos8Ufyb8DrdO7XD7u7iM9W1B9H3jMnCpQ\"}",
  "data": {
    "@type": "https://didcomm.org/issue-credential/2.0/issue-credential",
    "@id": "fb7c1e52-22e0-463b-af42-70d71dc16225",
    "comment": "This is the credential you requested",
    "formats": [
      {
        "attach_id": "eaf9cf8b-f0cb-44bd-89fd-23222f559a01",
        "format": "aries/ld-proof-vc@v1.0"
      }
    ],
    "credentials~attach": [
      {
        "@id": "eaf9cf8b-f0cb-44bd-89fd-23222f559a01",
        "mime-type": "application/ld+json",
        "data": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            {
              "grado": "https://schema.org/",
              "titulo": "https://schema.org/"
            },
            "https://w3id.org/security/suites/secp256k1recovery-2020/v2"
          ],
          "id": "0a5c496a-6981-4dd6-9708-3edd5b4f321f",
          "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
          "type": ["VerifiableCredential", "UniversityDegreeCredential"],
          "credentialSubject": {
            "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
            "grado": "gradoDefaultValue",
            "titulo": "tituloDefaultValue"
          },
          "issuanceDate": "2023-07-04T06:56:15.947Z",
          "proof": {
            "type": "EcdsaSecp256k1RecoverySignature2020",
            "created": "2023-07-04T06:56:15Z",
            "verificationMethod": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143#controller",
            "proofPurpose": "assertionMethod",
            "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..3YvBe4kvP3uao97-QMBquYWTjbsCHlbV8fuZHiw2hY1UAAur0y5Zv_coDmjCdPLX_G7zGUs9DeAccC7hvFrCQQE"
          }
        }
      }
    ]
  },
  "metaData": [
    {
      "type": "DIDCommMessaging",
      "value": "credential-flow-demo"
    },
    {
      "type": "didCommMetaData",
      "value": "{\"packing\":\"jws\"}"
    }
  ],
  "from": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
  "to": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f"
}
```

</details>

### Credential verification

For this scenario we dont need to prepare another pair of terminals for the verifier. Even thought there is three different roles, each agent support all of them, so we can reutilize the issuer and use it as verifier now.

#### 1. Propose

Similar to the propose step in the issuance process, the holder does not need to know which schemas the verifier supports in order to initiate the communication. The holder can indicate the credential type he would like to use without prior knowledge of the verifier's supported schemas.

```
iillan@iillan-lap:~/code/veramo/credential-flow-plugin$ npm run sendProposeVP did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143 UniversityDegreeCredential

> veramo-agent@1.0.0 sendProposeVP
> node dist/__tests__/sendProposeVP.js "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143" "UniversityDegreeCredential"

Sent Request Presentation: 5bbc054b-db3c-44fc-928a-bb8e86980b7d
```

```
// Verifier terminal
Recieved Message from: did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f
Message type: https://didcomm.org/present-proof/2.0/propose-presentation
Propose Presentation: 5bbc054b-db3c-44fc-928a-bb8e86980b7d
Credential type: UniversityDegreeCredential supported
Saved Message: 4c50d784-c9d9-4151-99ef-a8cc4075d441
Sent Request Presentation: 4c50d784-c9d9-4151-99ef-a8cc4075d441
```

<details>
<summary>Propose-presentation message</summary>

```json
{
  "id": "5bbc054b-db3c-44fc-928a-bb8e86980b7d",
  "type": "https://didcomm.org/present-proof/2.0/propose-presentation",
  "raw": "{\"protected\":\"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiNjb250cm9sbGVyIiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1zaWduZWQranNvbiJ9\",\"payload\":\"eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9wcmVzZW50LXByb29mLzIuMC9wcm9wb3NlLXByZXNlbnRhdGlvbiIsInRvIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMmE3YjQ5ODRlY2IxOWI3YzVhMjk4NjczNWU1ZDUxOTI0YTk3NjczMjNmNWQwZTM3NTE2ZGQyNTZlODc0MjAxNDMiLCJmcm9tIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMjU4NjJiYWYyY2RiNjkzN2Y5ZmVmNDU0ZGEzZGE5NmZlOTI1NzY0YjliOTM2MjUwN2Y3MzJkMWJkMDllOTcwMmYiLCJpZCI6IjViYmMwNTRiLWRiM2MtNDRmYy05MjhhLWJiOGU4Njk4MGI3ZCIsImJvZHkiOnsiQHR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL3ByZXNlbnQtcHJvb2YvMi4wL3Byb3Bvc2UtcHJlc2VudGF0aW9uIiwiQGlkIjoiNWJiYzA1NGItZGIzYy00NGZjLTkyOGEtYmI4ZTg2OTgwYjdkIiwiZm9ybWF0cyI6W3siYXR0YWNoX2lkIjoiNTNjYzgwZTYtYTM5Zi00YzZjLWEzMDctZThjMWU4ZTVlYTYzIiwiZm9ybWF0IjoiZGlmL3ByZXNlbnRhdGlvbi1leGNoYW5nZS9kZWZpbml0aW9uc0B2MS4wIn1dLCJwcm9wb3NhbHN-YXR0YWNoIjpbeyJAaWQiOiI1M2NjODBlNi1hMzlmLTRjNmMtYTMwNy1lOGMxZThlNWVhNjMiLCJtaW1lLXR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIiwiZGF0YSI6eyJpbnB1dF9kZXNjcmlwdG9ycyI6eyJuYW1lIjoiVW5pdmVyc2l0eURlZ3JlZUNyZWRlbnRpYWwifX19XX19\",\"signature\":\"bMpWzSsw6aJmgAWwSdVP3YDWed5KvGp_zvS-XAcOS5nUn3dr23w19UY2Bjt3DZ1Qm9jnL0LsIf8GBlqxL4CZsQ\"}",
  "data": {
    "@type": "https://didcomm.org/present-proof/2.0/propose-presentation",
    "@id": "5bbc054b-db3c-44fc-928a-bb8e86980b7d",
    "formats": [
      {
        "attach_id": "53cc80e6-a39f-4c6c-a307-e8c1e8e5ea63",
        "format": "dif/presentation-exchange/definitions@v1.0"
      }
    ],
    "proposals~attach": [
      {
        "@id": "53cc80e6-a39f-4c6c-a307-e8c1e8e5ea63",
        "mime-type": "application/json",
        "data": {
          "input_descriptors": {
            "name": "UniversityDegreeCredential"
          }
        }
      }
    ]
  },
  "metaData": [
    {
      "type": "DIDCommMessaging",
      "value": "credential-flow-demo"
    },
    {
      "type": "didCommMetaData",
      "value": "{\"packing\":\"jws\"}"
    }
  ],
  "from": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
  "to": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143"
}
```

</details>

#### 2. Request

The holder receives the request message and searches his wallet for the requested credential. If the holder has it, he proceeds to generate the presentation with the challenge specified by the verifier.

```
// Holder terminal
Recieved Message from: did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143
Message type: https://didcomm.org/present-proof/2.0/request-presentation
Request Presentation: 4c50d784-c9d9-4151-99ef-a8cc4075d441
Got credential for presentation
Generating verifiable presentation
Saved Message: 4a98be03-f5eb-45c1-a60b-e5a05b0ac17a
Sent Presentation: 4a98be03-f5eb-45c1-a60b-e5a05b0ac17a
```

<details>
<summary>Request-presentation message</summary>

```json
{
  "id": "4c50d784-c9d9-4151-99ef-a8cc4075d441",
  "type": "https://didcomm.org/present-proof/2.0/request-presentation",
  "raw": "{\"protected\":\"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyYTdiNDk4NGVjYjE5YjdjNWEyOTg2NzM1ZTVkNTE5MjRhOTc2NzMyM2Y1ZDBlMzc1MTZkZDI1NmU4NzQyMDE0MyNjb250cm9sbGVyIiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1zaWduZWQranNvbiJ9\",\"payload\":\"eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9wcmVzZW50LXByb29mLzIuMC9yZXF1ZXN0LXByZXNlbnRhdGlvbiIsInRvIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMjU4NjJiYWYyY2RiNjkzN2Y5ZmVmNDU0ZGEzZGE5NmZlOTI1NzY0YjliOTM2MjUwN2Y3MzJkMWJkMDllOTcwMmYiLCJmcm9tIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMmE3YjQ5ODRlY2IxOWI3YzVhMjk4NjczNWU1ZDUxOTI0YTk3NjczMjNmNWQwZTM3NTE2ZGQyNTZlODc0MjAxNDMiLCJpZCI6IjRjNTBkNzg0LWM5ZDktNDE1MS05OWVmLWE4Y2M0MDc1ZDQ0MSIsImJvZHkiOnsiQHR5cGUiOiJodHRwczovL2RpZGNvbW0ub3JnL3ByZXNlbnQtcHJvb2YvMi4wL3JlcXVlc3QtcHJlc2VudGF0aW9uIiwiQGlkIjoiNGM1MGQ3ODQtYzlkOS00MTUxLTk5ZWYtYThjYzQwNzVkNDQxIiwiZm9ybWF0cyI6W3siYXR0YWNoX2lkIjoiMTNlMDgzNWUtN2VlMy00YjI3LTg4ZGEtMTc4MTcxODliNjhlIiwiZm9ybWF0IjoiZGlmL3ByZXNlbnRhdGlvbi1leGNoYW5nZS9kZWZpbml0aW9uc0B2MS4wIn1dLCJyZXF1ZXN0X3ByZXNlbnRhdGlvbnN-YXR0YWNoIjpbeyJAaWQiOiIxM2UwODM1ZS03ZWUzLTRiMjctODhkYS0xNzgxNzE4OWI2OGUiLCJtaW1lLXR5cGUiOiJhcHBsaWNhdGlvbi9qc29uIiwiZGF0YSI6eyJvcHRpb25zIjp7ImNoYWxsZW5nZSI6InRlc3RfY2hhbGxlbmdlIiwiZG9tYWluIjoiZGVmYXVsdERvbWFpbiJ9LCJwcmVzZW50YXRpb25fZGVmaW5pdGlvbiI6eyJpbnB1dF9kZXNjcmlwdG9ycyI6eyJzY2hlbWEiOnsiaWQiOiJVbml2ZXJzaXR5RGVncmVlQ3JlZGVudGlhbCJ9fX19fV19fQ\",\"signature\":\"Td8nOxMTc-WiwQmUXHxpf9nQETGsSwcN4eoAWLaQV82Sui6CLrwEEw2IKgLwBzbeZ5Vjm0zu9cbYie_b2KuCYw\"}",
  "data": {
    "@type": "https://didcomm.org/present-proof/2.0/request-presentation",
    "@id": "4c50d784-c9d9-4151-99ef-a8cc4075d441",
    "formats": [
      {
        "attach_id": "13e0835e-7ee3-4b27-88da-17817189b68e",
        "format": "dif/presentation-exchange/definitions@v1.0"
      }
    ],
    "request_presentations~attach": [
      {
        "@id": "13e0835e-7ee3-4b27-88da-17817189b68e",
        "mime-type": "application/json",
        "data": {
          "options": {
            "challenge": "test_challenge",
            "domain": "defaultDomain"
          },
          "presentation_definition": {
            "input_descriptors": {
              "schema": {
                "id": "UniversityDegreeCredential"
              }
            }
          }
        }
      }
    ]
  },
  "metaData": [
    {
      "type": "DIDCommMessaging",
      "value": "credential-flow-demo"
    },
    {
      "type": "didCommMetaData",
      "value": "{\"packing\":\"jws\"}"
    }
  ],
  "from": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
  "to": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f"
}
```

</details>

#### 3. Presentation

Finally, the verifier retrieves the presentation from the message and starts the verification process in which he would have to check both digital signatures and then the credential schema.

```
// Verifier terminal
Recieved Message from: did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f
Message type: https://didcomm.org/present-proof/2.0/presentation
Presentation: 4a98be03-f5eb-45c1-a60b-e5a05b0ac17a
Found previous Request Presentation
Challenge: test_challenge
Verified Presentation: true
```

<details>
<summary>Verifiable Credential</summary>

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    {
      "verifier": "https://schema.org/"
    },
    "https://w3id.org/security/suites/secp256k1recovery-2020/v2"
  ],
  "holder": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
  "verifier": [
    "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143"
  ],
  "type": ["VerifiablePresentation"],
  "verifiableCredential": [
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "grado": "https://schema.org/",
          "titulo": "https://schema.org/"
        },
        "https://w3id.org/security/suites/secp256k1recovery-2020/v2"
      ],
      "id": "0a5c496a-6981-4dd6-9708-3edd5b4f321f",
      "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
      "type": ["VerifiableCredential", "UniversityDegreeCredential"],
      "credentialSubject": {
        "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
        "grado": "gradoDefaultValue",
        "titulo": "tituloDefaultValue"
      },
      "issuanceDate": "2023-07-04T06:56:15.947Z",
      "proof": {
        "type": "EcdsaSecp256k1RecoverySignature2020",
        "created": "2023-07-04T06:56:15Z",
        "verificationMethod": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143#controller",
        "proofPurpose": "assertionMethod",
        "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..3YvBe4kvP3uao97-QMBquYWTjbsCHlbV8fuZHiw2hY1UAAur0y5Zv_coDmjCdPLX_G7zGUs9DeAccC7hvFrCQQE"
      }
    }
  ],
  "proof": {
    "type": "EcdsaSecp256k1RecoverySignature2020",
    "created": "2023-07-04T06:58:18Z",
    "verificationMethod": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f#controller",
    "proofPurpose": "authentication",
    "challenge": "test_challenge",
    "domain": "",
    "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Sjo23mp1o3CfpRUVev4xTnIGH_WOEk-B8eMvwcJvTgweMKlTFe54p7K_WapbIt3M2WgOhlCckOJ4hbmfOWcd0gA"
  }
}
```

</details>

<details>
<summary>Presentation message</summary>

```json
{
  "id": "4a98be03-f5eb-45c1-a60b-e5a05b0ac17a",
  "type": "https://didcomm.org/present-proof/2.0/presentation",
  "raw": "{\"protected\":\"eyJhbGciOiJFUzI1NksiLCJraWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiNjb250cm9sbGVyIiwidHlwIjoiYXBwbGljYXRpb24vZGlkY29tbS1zaWduZWQranNvbiJ9\",\"payload\":\"eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9wcmVzZW50LXByb29mLzIuMC9wcmVzZW50YXRpb24iLCJ0byI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDJhN2I0OTg0ZWNiMTliN2M1YTI5ODY3MzVlNWQ1MTkyNGE5NzY3MzIzZjVkMGUzNzUxNmRkMjU2ZTg3NDIwMTQzIiwiZnJvbSI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDI1ODYyYmFmMmNkYjY5MzdmOWZlZjQ1NGRhM2RhOTZmZTkyNTc2NGI5YjkzNjI1MDdmNzMyZDFiZDA5ZTk3MDJmIiwiaWQiOiI0YTk4YmUwMy1mNWViLTQ1YzEtYTYwYi1lNWEwNWIwYWMxN2EiLCJib2R5Ijp7IkB0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9wcmVzZW50LXByb29mLzIuMC9wcmVzZW50YXRpb24iLCJAaWQiOiI0YTk4YmUwMy1mNWViLTQ1YzEtYTYwYi1lNWEwNWIwYWMxN2EiLCJjb21tZW50IjoiSGVyZSB5b3UgaGF2ZSB0aGUgcHJlc2VudGF0aW9uIHJlcXVlc3RlZCIsImZvcm1hdHMiOlt7ImF0dGFjaF9pZCI6IjEyYmU3MmUyLWY0MTItNGMxZS05ZGJiLTkxZTQxZGZmNTgyOSIsImZvcm1hdCI6ImRpZi9wcmVzZW50YXRpb24tZXhjaGFuZ2Uvc3VibWlzc2lvbkB2MS4wIn1dLCJwcmVzZW50YXRpb25zfmF0dGFjaCI6W3siQGlkIjoiMTJiZTcyZTItZjQxMi00YzFlLTlkYmItOTFlNDFkZmY1ODI5IiwibWltZS10eXBlIjoiYXBwbGljYXRpb24vbGQranNvbiIsImRhdGEiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLHsidmVyaWZpZXIiOiJodHRwczovL3NjaGVtYS5vcmcvIn0sImh0dHBzOi8vdzNpZC5vcmcvc2VjdXJpdHkvc3VpdGVzL3NlY3AyNTZrMXJlY292ZXJ5LTIwMjAvdjIiXSwiaG9sZGVyIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMjU4NjJiYWYyY2RiNjkzN2Y5ZmVmNDU0ZGEzZGE5NmZlOTI1NzY0YjliOTM2MjUwN2Y3MzJkMWJkMDllOTcwMmYiLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6W3siQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLHsiZ3JhZG8iOiJodHRwczovL3NjaGVtYS5vcmcvIiwidGl0dWxvIjoiaHR0cHM6Ly9zY2hlbWEub3JnLyJ9LCJodHRwczovL3czaWQub3JnL3NlY3VyaXR5L3N1aXRlcy9zZWNwMjU2azFyZWNvdmVyeS0yMDIwL3YyIl0sImlkIjoiMGE1YzQ5NmEtNjk4MS00ZGQ2LTk3MDgtM2VkZDViNGYzMjFmIiwiaXNzdWVyIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMmE3YjQ5ODRlY2IxOWI3YzVhMjk4NjczNWU1ZDUxOTI0YTk3NjczMjNmNWQwZTM3NTE2ZGQyNTZlODc0MjAxNDMiLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiVW5pdmVyc2l0eURlZ3JlZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZXRocjpkZXZlbG9wbWVudDoweDAyNTg2MmJhZjJjZGI2OTM3ZjlmZWY0NTRkYTNkYTk2ZmU5MjU3NjRiOWI5MzYyNTA3ZjczMmQxYmQwOWU5NzAyZiIsImdyYWRvIjoiZ3JhZG9EZWZhdWx0VmFsdWUiLCJ0aXR1bG8iOiJ0aXR1bG9EZWZhdWx0VmFsdWUifSwiaXNzdWFuY2VEYXRlIjoiMjAyMy0wNy0wNFQwNjo1NjoxNS45NDdaIiwicHJvb2YiOnsidHlwZSI6IkVjZHNhU2VjcDI1NmsxUmVjb3ZlcnlTaWduYXR1cmUyMDIwIiwiY3JlYXRlZCI6IjIwMjMtMDctMDRUMDY6NTY6MTVaIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMmE3YjQ5ODRlY2IxOWI3YzVhMjk4NjczNWU1ZDUxOTI0YTk3NjczMjNmNWQwZTM3NTE2ZGQyNTZlODc0MjAxNDMjY29udHJvbGxlciIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsImp3cyI6ImV5SmhiR2NpT2lKRlV6STFOa3N0VWlJc0ltSTJOQ0k2Wm1Gc2MyVXNJbU55YVhRaU9sc2lZalkwSWwxOS4uM1l2QmU0a3ZQM3Vhbzk3LVFNQnF1WVdUamJzQ0hsYlY4ZnVaSGl3MmhZMVVBQXVyMHk1WnZfY29EbWpDZFBMWF9HN3pHVXM5RGVBY2NDN2h2RnJDUVFFIn19XSwidmVyaWZpZXIiOlsiZGlkOmV0aHI6ZGV2ZWxvcG1lbnQ6MHgwMmE3YjQ5ODRlY2IxOWI3YzVhMjk4NjczNWU1ZDUxOTI0YTk3NjczMjNmNWQwZTM3NTE2ZGQyNTZlODc0MjAxNDMiXSwidHlwZSI6WyJWZXJpZmlhYmxlUHJlc2VudGF0aW9uIl0sInByb29mIjp7InR5cGUiOiJFY2RzYVNlY3AyNTZrMVJlY292ZXJ5U2lnbmF0dXJlMjAyMCIsImNyZWF0ZWQiOiIyMDIzLTA3LTA0VDA2OjU4OjE4WiIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDpldGhyOmRldmVsb3BtZW50OjB4MDI1ODYyYmFmMmNkYjY5MzdmOWZlZjQ1NGRhM2RhOTZmZTkyNTc2NGI5YjkzNjI1MDdmNzMyZDFiZDA5ZTk3MDJmI2NvbnRyb2xsZXIiLCJwcm9vZlB1cnBvc2UiOiJhdXRoZW50aWNhdGlvbiIsImNoYWxsZW5nZSI6InRlc3RfY2hhbGxlbmdlIiwiZG9tYWluIjoiIiwiandzIjoiZXlKaGJHY2lPaUpGVXpJMU5rc3RVaUlzSW1JMk5DSTZabUZzYzJVc0ltTnlhWFFpT2xzaVlqWTBJbDE5Li5Tam8yM21wMW8zQ2ZwUlVWZXY0eFRuSUdIX1dPRWstQjhlTXZ3Y0p2VGd3ZU1LbFRGZTU0cDdLX1dhcGJJdDNNMldnT2hsQ2NrT0o0aGJtZk9XY2QwZ0EifX19XX19\",\"signature\":\"ghe1g8anWRF8-_4lOUjeQQO7RG17V8yQj5RIkDQ3xAgN9ja49KYBTwCv6mj08XJ9DibR8y_uGippi6OC08b04Q\"}",
  "data": {
    "@type": "https://didcomm.org/present-proof/2.0/presentation",
    "@id": "4a98be03-f5eb-45c1-a60b-e5a05b0ac17a",
    "comment": "Here you have the presentation requested",
    "formats": [
      {
        "attach_id": "12be72e2-f412-4c1e-9dbb-91e41dff5829",
        "format": "dif/presentation-exchange/submission@v1.0"
      }
    ],
    "presentations~attach": [
      {
        "@id": "12be72e2-f412-4c1e-9dbb-91e41dff5829",
        "mime-type": "application/ld+json",
        "data": {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            {
              "verifier": "https://schema.org/"
            },
            "https://w3id.org/security/suites/secp256k1recovery-2020/v2"
          ],
          "holder": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
          "verifiableCredential": [
            {
              "@context": [
                "https://www.w3.org/2018/credentials/v1",
                {
                  "grado": "https://schema.org/",
                  "titulo": "https://schema.org/"
                },
                "https://w3id.org/security/suites/secp256k1recovery-2020/v2"
              ],
              "id": "0a5c496a-6981-4dd6-9708-3edd5b4f321f",
              "issuer": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",
              "type": [
                "VerifiableCredential",
                "UniversityDegreeCredential"
              ],
              "credentialSubject": {
                "id": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
                "grado": "gradoDefaultValue",
                "titulo": "tituloDefaultValue"
              },
              "issuanceDate": "2023-07-04T06:56:15.947Z",
              "proof": {
                "type": "EcdsaSecp256k1RecoverySignature2020",
                "created": "2023-07-04T06:56:15Z",
                "verificationMethod": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143#controller",
                "proofPurpose": "assertionMethod",
                "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..3YvBe4kvP3uao97-QMBquYWTjbsCHlbV8fuZHiw2hY1UAAur0y5Zv_coDmjCdPLX_G7zGUs9DeAccC7hvFrCQQE"
              }
            }
          ],
          "verifier": [
            "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143"
          ],
          "type": [
            "VerifiablePresentation"
          ],
          "proof": {
            "type": "EcdsaSecp256k1RecoverySignature2020",
            "created": "2023-07-04T06:58:18Z",
            "verificationMethod": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f#controller",
            "proofPurpose": "authentication",
            "challenge": "test_challenge",
            "domain": "",
            "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Sjo23mp1o3CfpRUVev4xTnIGH_WOEk-B8eMvwcJvTgweMKlTFe54p7K_WapbIt3M2WgOhlCckOJ4hbmfOWcd0gA"
          }
        }
      }
    ]
  },
  "metaData": [
    {
      "type": "DIDCommMessaging",
      "value": "credential-flow-demo"
    },
    {
      "type": "didCommMetaData",
      "value": "{\"packing\":\"jws\"}"
    }
  ],
  "from": "did:ethr:development:0x025862baf2cdb6937f9fef454da3da96fe925764b9b9362507f732d1bd09e9702f",
  "to": "did:ethr:development:0x02a7b4984ecb19b7c5a2986735e5d51924a9767323f5d0e37516dd256e87420143",

```

</details>

## Related work

While this work was being developed, Spherity published its [Aries RFCs Veramo Plugin](https://github.com/spherity/aries-rfcs-veramo-plugin).In addition to supporting the issue credential and present proof standards, they also provide support for [Aries RFC 0023: DID Exchange Protocol 1.0](https://github.com/hyperledger/aries-rfcs/blob/40aeda259bdd3b28fe0770e5685a7e2aacebc877/features/0023-did-exchange/README.md#L4).
Their work focuses more on managing communication flows and maintaining the machine state for each protocol, but it lacks effort in defining proper message formats. In contrast, our plugin tries to utilize most of the available attributes and employs specific formats for attachments. However, in their implementation, they often leave these attributes as empty strings and occasionally introduce invented attributes.
