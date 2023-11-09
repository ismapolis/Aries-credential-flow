import { BaseEntity } from "typeorm";
import { ICredentialSchema } from "../types.js";
export declare class CredentialSchema extends BaseEntity {
    type: string;
    attributes: string;
}
export declare const createCredentialSchemaEntity: (schema: ICredentialSchema) => CredentialSchema;
export declare const createCredentialSchema: (schema: CredentialSchema) => ICredentialSchema;
//# sourceMappingURL=credentialSchema.d.ts.map