import { IKeyManager } from "@veramo/core";
export declare const agent: {
    [x: string]: import("@veramo/core").RemoveContext<import("@veramo/core").IPluginMethod>;
    didManagerGetProviders: import("@veramo/core").RemoveContext<() => Promise<string[]>>;
    didManagerFind: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerFindArgs) => Promise<import("@veramo/core").IIdentifier[]>>;
    didManagerGet: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerGetArgs) => Promise<import("@veramo/core").IIdentifier>>;
    didManagerGetByAlias: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerGetByAliasArgs) => Promise<import("@veramo/core").IIdentifier>>;
    didManagerCreate: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerCreateArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<import("@veramo/core").IIdentifier>>;
    didManagerSetAlias: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerSetAliasArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<boolean>>;
    didManagerGetOrCreate: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerGetOrCreateArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<import("@veramo/core").IIdentifier>>;
    didManagerUpdate: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerUpdateArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<import("@veramo/core").IIdentifier>>;
    didManagerImport: import("@veramo/core").RemoveContext<(args: import("@veramo/core").MinimalImportableIdentifier, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<import("@veramo/core").IIdentifier>>;
    didManagerDelete: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerDeleteArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<boolean>>;
    didManagerAddKey: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerAddKeyArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<any>>;
    didManagerRemoveKey: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerRemoveKeyArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<any>>;
    didManagerAddService: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerAddServiceArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<any>>;
    didManagerRemoveService: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDIDManagerRemoveServiceArgs, context: import("@veramo/core").IAgentContext<IKeyManager>) => Promise<any>>;
    keyManagerGetKeyManagementSystems: import("@veramo/core").RemoveContext<() => Promise<string[]>>;
    keyManagerCreate: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerCreateArgs) => Promise<import("@veramo/core").ManagedKeyInfo>>;
    keyManagerGet: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerGetArgs) => Promise<import("@veramo/core").IKey>>;
    keyManagerDelete: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerDeleteArgs) => Promise<boolean>>;
    keyManagerImport: import("@veramo/core").RemoveContext<(args: import("@veramo/core").MinimalImportableKey) => Promise<import("@veramo/core").ManagedKeyInfo>>;
    keyManagerSign: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerSignArgs) => Promise<string>>;
    keyManagerSharedSecret: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerSharedSecretArgs) => Promise<string>>;
    keyManagerEncryptJWE: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerEncryptJWEArgs) => Promise<string>>;
    keyManagerDecryptJWE: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerDecryptJWEArgs) => Promise<string>>;
    keyManagerSignJWT: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerSignJWTArgs) => Promise<string>>;
    keyManagerSignEthTX: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IKeyManagerSignEthTXArgs) => Promise<string>>;
    dataStoreSaveCredentialSchema: import("@veramo/core").RemoveContext<(credentialSchema: import("../../data-store/types.js").ICredentialSchema) => Promise<string>>;
    dataStoreGetAllCredentialSchema: import("@veramo/core").RemoveContext<() => Promise<import("../../data-store/types.js").ICredentialSchema[]>>;
    dataStoreDeleteCredentialSchema: import("@veramo/core").RemoveContext<(type: string) => Promise<boolean>>;
    dataStoreSaveMessage: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreSaveMessageArgs) => Promise<string>>;
    dataStoreGetMessage: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreGetMessageArgs) => Promise<import("@veramo/core").IMessage>>;
    dataStoreDeleteMessage: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreDeleteMessageArgs) => Promise<boolean>>;
    dataStoreSaveVerifiableCredential: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreSaveVerifiableCredentialArgs) => Promise<string>>;
    dataStoreDeleteVerifiableCredential: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreDeleteVerifiableCredentialArgs) => Promise<boolean>>;
    dataStoreGetVerifiableCredential: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreGetVerifiableCredentialArgs) => Promise<import("@veramo/core").VerifiableCredential>>;
    dataStoreSaveVerifiablePresentation: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreSaveVerifiablePresentationArgs) => Promise<string>>;
    dataStoreGetVerifiablePresentation: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IDataStoreGetVerifiablePresentationArgs) => Promise<import("@veramo/core").VerifiablePresentation>>;
    dataStoreORMGetCredentialSchemas: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindArgs<import("@veramo/core").TCredentialColumns>, context: import("@veramo/core").AuthorizedDIDContext) => Promise<import("../../data-store/types.js").ICredentialSchema[]>>;
    dataStoreORMGetCredentialSchemasCount: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindArgs<import("@veramo/core").TCredentialColumns>, context: import("@veramo/core").AuthorizedDIDContext) => Promise<number>>;
    dataStoreORMGetIdentifiers: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindIdentifiersArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<Partial<import("@veramo/core").IIdentifier>[]>>;
    dataStoreORMGetIdentifiersCount: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindIdentifiersArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<number>>;
    dataStoreORMGetMessages: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindMessagesArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<import("@veramo/core").IMessage[]>>;
    dataStoreORMGetMessagesCount: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindMessagesArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<number>>;
    dataStoreORMGetVerifiableCredentialsByClaims: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindClaimsArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<import("@veramo/core").UniqueVerifiableCredential[]>>;
    dataStoreORMGetVerifiableCredentialsByClaimsCount: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindClaimsArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<number>>;
    dataStoreORMGetVerifiableCredentials: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindCredentialsArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<import("@veramo/core").UniqueVerifiableCredential[]>>;
    dataStoreORMGetVerifiableCredentialsCount: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindCredentialsArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<number>>;
    dataStoreORMGetVerifiablePresentations: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindPresentationsArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<import("@veramo/core").UniqueVerifiablePresentation[]>>;
    dataStoreORMGetVerifiablePresentationsCount: import("@veramo/core").RemoveContext<(args: import("@veramo/core").FindPresentationsArgs, context: import("@veramo/core").AuthorizedDIDContext) => Promise<number>>;
    resolveDid: import("@veramo/core").RemoveContext<(args: import("@veramo/core").ResolveDidArgs) => Promise<import("did-resolver").DIDResolutionResult>>;
    getDIDComponentById: import("@veramo/core").RemoveContext<(args: import("@veramo/core").GetDIDComponentArgs) => Promise<import("@veramo/core").DIDDocComponent>>;
    createVerifiablePresentation: import("@veramo/core").RemoveContext<(args: import("@veramo/core").ICreateVerifiablePresentationArgs, context: import("@veramo/core").IssuerAgentContext) => Promise<import("@veramo/core").VerifiablePresentation>>;
    createVerifiableCredential: import("@veramo/core").RemoveContext<(args: import("@veramo/core").ICreateVerifiableCredentialArgs, context: import("@veramo/core").IssuerAgentContext) => Promise<import("@veramo/core").VerifiableCredential>>;
    verifyCredential: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IVerifyCredentialArgs, context: import("@veramo/core").VerifierAgentContext) => Promise<import("@veramo/core").IVerifyResult>>;
    verifyPresentation: import("@veramo/core").RemoveContext<(args: import("@veramo/core").IVerifyPresentationArgs, context: import("@veramo/core").VerifierAgentContext) => Promise<import("@veramo/core").IVerifyResult>>;
    sendProposeCredential: import("@veramo/core").RemoveContext<(args: {
        credentialPreview: import("../../types/types.js").ICredentialPreview;
        issuer: string;
    }, context: import("../../types/types.js").IContext) => Promise<void>>;
    sendOfferCredential: import("@veramo/core").RemoveContext<(args: {
        credentialType: string;
        holder: string;
    }, context: import("../../types/types.js").IContext) => Promise<void>>;
    sendRequestCredential: import("@veramo/core").RemoveContext<(args: {
        credentialType: string;
        issuer: string;
    }, context: import("../../types/types.js").IContext) => Promise<void>>;
    sendProposePresentation: import("@veramo/core").RemoveContext<(args: {
        credentialType: string;
        verifier: string;
    }, context: import("../../types/types.js").IContext) => Promise<void>>;
    sendRequestPresentation: import("@veramo/core").RemoveContext<(args: {
        credentialType: string;
        holder: string;
    }, context: import("../../types/types.js").IContext) => Promise<void>>;
} & import("@veramo/core").IAgent & {
    context?: Record<string, any> | undefined;
};
//# sourceMappingURL=setup.d.ts.map