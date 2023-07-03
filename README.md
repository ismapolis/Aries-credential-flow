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

Issuer recieves `request-credential` chekcs whether credential type requested is one he can issue and then creates a verifiable credential.

**_Note:_**
As this is a prototype, the Issuer uses `default-values` for the different claims. In a production environment, the Issuer would retrieve this information from the database for accurate values.

### PresentProofHanlder

This handler supports the three message types defined in the specification.

- propose-presentation
- request-presentation
- presentation

Here we are going to explain how each one works.

#### Propose and Request

#### Presentation

### CredentialFlow Plugin

The CredentialFlow class is the element that allows to send the different message types. You can only send the messages that the especification define as communication starters.
Holder to Issuer: propose and request, and Issuer to Hoder: offer.

```typescript
sendProposeCredential(
    args: {
      credentialPreview: ICredentialPreview;
      issuer: string;
    },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>
  ): Promise<void>;

  sendOfferCredential(
    args: {
      credentialType: string;
      issuer: string;
    },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>
  ): Promise<void>;

  sendRequestCredential(
    args: {
      credentialType: string;
      issuer: string;
    },
    context: IAgentContext<IDIDManager & IKeyManager & IResolver>
  ): Promise<void>;
```

## Demo

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

Now it is time to deploy endpoint and wait for new messages.

```console
iillan@iillan-lap:~/code/veramo/credential-flow-plugin$ npm run startMessagingSvc

> veramo-agent@1.0.0 startMessagingSvc
> node dist/__tests__/startMessagingSvc.js

DIDCommMessaging Service listening on port: 9999
```

### Communication flow

## Related work

While this work was being developed, Spherity published its [Aries RFCs Veramo Plugin](https://github.com/spherity/aries-rfcs-veramo-plugin).In addition to supporting the issue credential and present proof standards, they also provide support for [Aries RFC 0023: DID Exchange Protocol 1.0](https://github.com/hyperledger/aries-rfcs/blob/40aeda259bdd3b28fe0770e5685a7e2aacebc877/features/0023-did-exchange/README.md#L4).
Their work focuses more on managing communication flows and maintaining the machine state for each protocol, but it lacks effort in defining proper message formats. In contrast, our plugin tries to utilize most of the available attributes and employs specific formats for attachments. However, in their implementation, they often leave these attributes as empty strings and occasionally introduce invented attributes.
