// Core interfaces
import { createAgent, } from "@veramo/core";
//import { JwtMessageHandler } from "@veramo/did-jwt";
import { DIDCommMessageHandler, DIDComm, DIDCommHttpTransport, } from "@veramo/did-comm";
import { MessageHandler } from "@veramo/message-handler";
import { IssueCredentialHandler } from "../../handlers/issue-credential-handler.js";
// Core identity manager plugin
import { DIDManager } from "@veramo/did-manager";
// import { DataStore, DataStoreORM } from "@veramo/data-store";
// Ethr did identity provider
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
// Core key manager plugin
import { KeyManager } from "@veramo/key-manager";
// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";
// W3C Verifiable Credential plugin
import { CredentialPlugin } from "@veramo/credential-w3c";
//JSON-LD Verifiable Credential plugin
import { CredentialIssuerLD, LdDefaultContexts, VeramoJsonWebSignature2020, VeramoEcdsaSecp256k1RecoverySignature2020, } from "@veramo/credential-ld";
// Custom resolvers
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";
// Storage plugin using TypeOrm
import { KeyStore, DIDStore, PrivateKeyStore } from "@veramo/data-store";
// All custom elements needed for credentialSchema
import { migrations, DataStore, DataStoreORM, Entities, } from "../../data-store/index.js";
// TypeORM is installed with `@veramo/data-store`
import { DataSource } from "typeorm";
import { WebSocketProvider } from "@ethersproject/providers";
import { CredentialFlow } from "../../credentialFlow.js";
import { PresentProofHandler } from "../../handlers/present-proof-handler.js";
import { CredentialIssuerEIP712 } from "@veramo/credential-eip712";
// Custom context
/*
  const customContext: Record<string, ContextDoc> = {};
  customContext["http://www.upv.es/es"] = {
    "@context": {
      name: {
        "@id": "https://example.com/name/context",
        "@type": "@id",
      },
      degree: {
        "@id": "https://example.com/degree/context",
        "@type": "@id",
      },
      university: {
        "@id": "https://example.com/university/context",
        "@type": "@id",
      },
    },
  };
  */
// Connection to local Ganache provider
const provider = new WebSocketProvider("ws://localhost:8545");
// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = "database.sqlite";
// This will be the secret key for the KMS
const KMS_SECRET_KEY = "9d493be1efc81c8d271a86c14fbafe2adad2cc59ca3531a26bb11bf2bc3399c3";
const dbConnection = new DataSource({
    type: "sqlite",
    database: DATABASE_FILE,
    synchronize: true,
    migrations,
    migrationsRun: true,
    logging: ["error", "info", "warn"],
    entities: Entities,
}).initialize();
export const agent = createAgent({
    plugins: [
        new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
                local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
            },
        }),
        new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: "did:ethr:",
            providers: {
                "did:ethr:": new EthrDIDProvider({
                    defaultKms: "local",
                    ttl: 60 * 60 * 24 * 30 * 12 + 1,
                    networks: [
                        {
                            name: "development",
                            provider: provider,
                            registry: "0x51Bd75C11B35CD2aFF27Cf89e4D4b9e76fd1ffEC",
                        },
                    ],
                }),
            },
        }),
        new DIDResolverPlugin({
            resolver: new Resolver(Object.assign({}, ethrDidResolver({
                networks: [
                    {
                        name: "development",
                        provider: provider,
                        registry: "0x51Bd75C11B35CD2aFF27Cf89e4D4b9e76fd1ffEC",
                    },
                ],
            }))),
        }),
        new CredentialPlugin(),
        new CredentialIssuerLD({
            contextMaps: [LdDefaultContexts],
            suites: [
                new VeramoJsonWebSignature2020(),
                new VeramoEcdsaSecp256k1RecoverySignature2020(),
            ],
        }),
        new CredentialIssuerEIP712(),
        new MessageHandler({
            messageHandlers: [
                new DIDCommMessageHandler(),
                new IssueCredentialHandler(),
                new PresentProofHandler(),
            ],
        }),
        new DIDComm([new DIDCommHttpTransport()]),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        new CredentialFlow(),
    ],
});
