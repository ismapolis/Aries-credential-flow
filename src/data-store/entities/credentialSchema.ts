import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { ICredentialSchema } from "../types.js";

@Entity("credentialSchema")
export class CredentialSchema extends BaseEntity {
  @PrimaryColumn()
  // @ts-ignore
  type: string;

  @Column()
  // @ts-ignore
  attributes: string;
}

export const createCredentialSchemaEntity = (
  schema: ICredentialSchema
): CredentialSchema => {
  const credentialSchema = new CredentialSchema();

  credentialSchema.type = schema.type;
  credentialSchema.attributes = schema.attributes;

  return credentialSchema;
};

export const createCredentialSchema = (
  schema: CredentialSchema
): ICredentialSchema => {
  const credentialSchema: ICredentialSchema = {
    type: schema.type,
    attributes: schema.attributes,
  };
  return credentialSchema;
};
