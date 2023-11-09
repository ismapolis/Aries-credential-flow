"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent = void 0;
// Core interfaces
const core_1 = require("@veramo/core");
//import { JwtMessageHandler } from "@veramo/did-jwt";
const did_comm_1 = require("@veramo/did-comm");
const message_handler_1 = require("@veramo/message-handler");
const issue_credential_handler_js_1 = require("../../handlers/issue-credential-handler.js");
// Core identity manager plugin
const did_manager_1 = require("@veramo/did-manager");
// import { DataStore, DataStoreORM } from "@veramo/data-store";
// Ethr did identity provider
const did_provider_ethr_1 = require("@veramo/did-provider-ethr");
// Core key manager plugin
const key_manager_1 = require("@veramo/key-manager");
// Custom key management system for RN
const kms_local_1 = require("@veramo/kms-local");
// W3C Verifiable Credential plugin
const credential_w3c_1 = require("@veramo/credential-w3c");
//JSON-LD Verifiable Credential plugin
const credential_ld_1 = require("@veramo/credential-ld");
// Custom resolvers
const did_resolver_1 = require("@veramo/did-resolver");
const did_resolver_2 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
// Storage plugin using TypeOrm
const data_store_1 = require("@veramo/data-store");
// All custom elements needed for credentialSchema
const index_js_1 = require("../../data-store/index.js");
// TypeORM is installed with `@veramo/data-store`
const typeorm_1 = require("typeorm");
const providers_1 = require("@ethersproject/providers");
const credentialFlow_js_1 = require("../../credentialFlow.js");
const present_proof_handler_js_1 = require("../../handlers/present-proof-handler.js");
const credential_eip712_1 = require("@veramo/credential-eip712");
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
const provider = new providers_1.WebSocketProvider("ws://localhost:8545");
// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = "database.sqlite";
// This will be the secret key for the KMS
const KMS_SECRET_KEY = "9d493be1efc81c8d271a86c14fbafe2adad2cc59ca3531a26bb11bf2bc3399c3";
const dbConnection = new typeorm_1.DataSource({
    type: "sqlite",
    database: DATABASE_FILE,
    synchronize: true,
    migrations: index_js_1.migrations,
    migrationsRun: true,
    logging: ["error", "info", "warn"],
    entities: index_js_1.Entities,
}).initialize();
exports.agent = (0, core_1.createAgent)({
    plugins: [
        new key_manager_1.KeyManager({
            store: new data_store_1.KeyStore(dbConnection),
            kms: {
                local: new kms_local_1.KeyManagementSystem(new data_store_1.PrivateKeyStore(dbConnection, new kms_local_1.SecretBox(KMS_SECRET_KEY))),
            },
        }),
        new did_manager_1.DIDManager({
            store: new data_store_1.DIDStore(dbConnection),
            defaultProvider: "did:ethr:",
            providers: {
                "did:ethr:": new did_provider_ethr_1.EthrDIDProvider({
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
        new did_resolver_1.DIDResolverPlugin({
            resolver: new did_resolver_2.Resolver({
                ...(0, ethr_did_resolver_1.getResolver)({
                    networks: [
                        {
                            name: "development",
                            provider: provider,
                            registry: "0x51Bd75C11B35CD2aFF27Cf89e4D4b9e76fd1ffEC",
                        },
                    ],
                }),
            }),
        }),
        new credential_w3c_1.CredentialPlugin(),
        new credential_ld_1.CredentialIssuerLD({
            contextMaps: [credential_ld_1.LdDefaultContexts],
            suites: [
                new credential_ld_1.VeramoJsonWebSignature2020(),
                new credential_ld_1.VeramoEcdsaSecp256k1RecoverySignature2020(),
            ],
        }),
        new credential_eip712_1.CredentialIssuerEIP712(),
        new message_handler_1.MessageHandler({
            messageHandlers: [
                new did_comm_1.DIDCommMessageHandler(),
                new issue_credential_handler_js_1.IssueCredentialHandler(),
                new present_proof_handler_js_1.PresentProofHandler(),
            ],
        }),
        new did_comm_1.DIDComm([new did_comm_1.DIDCommHttpTransport()]),
        new index_js_1.DataStore(dbConnection),
        new index_js_1.DataStoreORM(dbConnection),
        new credentialFlow_js_1.CredentialFlow(),
    ],
});
