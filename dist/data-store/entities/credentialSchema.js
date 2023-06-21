var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
let CredentialSchema = class CredentialSchema extends BaseEntity {
};
__decorate([
    PrimaryColumn()
    // @ts-ignore
    ,
    __metadata("design:type", String)
], CredentialSchema.prototype, "type", void 0);
__decorate([
    Column()
    // @ts-ignore
    ,
    __metadata("design:type", String)
], CredentialSchema.prototype, "attributes", void 0);
CredentialSchema = __decorate([
    Entity("credentialSchema")
], CredentialSchema);
export { CredentialSchema };
export const createCredentialSchemaEntity = (schema) => {
    const credentialSchema = new CredentialSchema();
    credentialSchema.type = schema.type;
    credentialSchema.attributes = schema.attributes;
    return credentialSchema;
};
export const createCredentialSchema = (schema) => {
    const credentialSchema = {
        type: schema.type,
        attributes: schema.attributes,
    };
    return credentialSchema;
};
