"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStoreORMCustom = void 0;
const data_store_1 = require("@veramo/data-store");
const typeorm_1 = require("typeorm");
const credentialSchema_js_1 = require("./entities/credentialSchema.js");
const utils_js_1 = require("../utils.js");
class DataStoreORMCustom extends data_store_1.DataStoreORM {
    constructor(dbConnection) {
        super(dbConnection);
        this.dbConnectionCustom = dbConnection;
        this.methods = {
            // schema methods
            dataStoreORMGetCredentialSchemas: this.dataStoreORMGetCredentialSchemas.bind(this),
            dataStoreORMGetCredentialSchemasCount: this.dataStoreORMGetCredentialSchemasCount.bind(this),
            // veramo orm methods
            dataStoreORMGetIdentifiers: super.dataStoreORMGetIdentifiers.bind(this),
            dataStoreORMGetIdentifiersCount: super.dataStoreORMGetIdentifiersCount.bind(this),
            dataStoreORMGetMessages: super.dataStoreORMGetMessages.bind(this),
            dataStoreORMGetMessagesCount: super.dataStoreORMGetMessagesCount.bind(this),
            dataStoreORMGetVerifiableCredentialsByClaims: super.dataStoreORMGetVerifiableCredentialsByClaims.bind(this),
            dataStoreORMGetVerifiableCredentialsByClaimsCount: super.dataStoreORMGetVerifiableCredentialsByClaimsCount.bind(this),
            dataStoreORMGetVerifiableCredentials: super.dataStoreORMGetVerifiableCredentials.bind(this),
            dataStoreORMGetVerifiableCredentialsCount: super.dataStoreORMGetVerifiableCredentialsCount.bind(this),
            dataStoreORMGetVerifiablePresentations: super.dataStoreORMGetVerifiablePresentations.bind(this),
            dataStoreORMGetVerifiablePresentationsCount: super.dataStoreORMGetVerifiablePresentationsCount.bind(this),
        };
    }
    // Methods for Credential Schemas
    async credentialSchemasQuery(args, context) {
        const where = this.createWhereObject(args);
        let qb = (await (0, utils_js_1.getConnectedDb)(this.dbConnectionCustom))
            .getRepository(credentialSchema_js_1.CredentialSchema)
            .createQueryBuilder("credentialSchema")
            .where(where);
        qb = this.decorateQB(qb, "credentialSchema", args);
        if (context.authorizedDID) {
            qb = qb.andWhere(new typeorm_1.Brackets((qb) => {
                qb.where("credential.subject = :ident", {
                    ident: context.authorizedDID,
                }).orWhere("credential.issuer = :ident", {
                    ident: context.authorizedDID,
                });
            }));
        }
        return qb;
    }
    async dataStoreORMGetCredentialSchemas(args, context) {
        const credentialSchemas = await (await this.credentialSchemasQuery(args, context)).getMany();
        return credentialSchemas.map((schema) => {
            return (0, credentialSchema_js_1.createCredentialSchema)(schema);
        });
    }
    async dataStoreORMGetCredentialSchemasCount(args, context) {
        return (await this.credentialSchemasQuery(args, context)).getCount();
    }
    // These functions below are from Veramo DataStoreORM, we need them but
    // they are private
    decorateQB(qb, tableName, input) {
        if (input?.skip)
            qb = qb.skip(input.skip);
        if (input?.take)
            qb = qb.take(input.take);
        if (input?.order) {
            for (const item of input.order) {
                qb = qb.orderBy(qb.connection.driver.escape(tableName) +
                    "." +
                    qb.connection.driver.escape(item.column), item.direction);
            }
        }
        return qb;
    }
    createWhereObject(input) {
        const where = {};
        if (input?.where) {
            for (const item of input.where) {
                if (item.column === "verifier") {
                    continue;
                }
                switch (item.op) {
                    case "Any":
                        if (!Array.isArray(item.value))
                            throw Error("Operator Any requires value to be an array");
                        where[item.column] = (0, typeorm_1.Any)(item.value);
                        break;
                    case "Between":
                        if (item.value?.length != 2)
                            throw Error("Operation Between requires two values");
                        where[item.column] = (0, typeorm_1.Between)(item.value[0], item.value[1]);
                        break;
                    case "Equal":
                        if (item.value?.length != 1)
                            throw Error("Operation Equal requires one value");
                        where[item.column] = (0, typeorm_1.Equal)(item.value[0]);
                        break;
                    case "IsNull":
                        where[item.column] = (0, typeorm_1.IsNull)();
                        break;
                    case "LessThan":
                        if (item.value?.length != 1)
                            throw Error("Operation LessThan requires one value");
                        where[item.column] = (0, typeorm_1.LessThan)(item.value[0]);
                        break;
                    case "LessThanOrEqual":
                        if (item.value?.length != 1)
                            throw Error("Operation LessThanOrEqual requires one value");
                        where[item.column] = (0, typeorm_1.LessThanOrEqual)(item.value[0]);
                        break;
                    case "Like":
                        if (item.value?.length != 1)
                            throw Error("Operation Like requires one value");
                        where[item.column] = (0, typeorm_1.Like)(item.value[0]);
                        break;
                    case "MoreThan":
                        if (item.value?.length != 1)
                            throw Error("Operation MoreThan requires one value");
                        where[item.column] = (0, typeorm_1.MoreThan)(item.value[0]);
                        break;
                    case "MoreThanOrEqual":
                        if (item.value?.length != 1)
                            throw Error("Operation MoreThanOrEqual requires one value");
                        where[item.column] = (0, typeorm_1.MoreThanOrEqual)(item.value[0]);
                        break;
                    case "In":
                    default:
                        if (!Array.isArray(item.value))
                            throw Error("Operator IN requires value to be an array");
                        where[item.column] = (0, typeorm_1.In)(item.value);
                }
                if (item.not === true) {
                    where[item.column] = (0, typeorm_1.Not)(where[item.column]);
                }
            }
        }
        return where;
    }
}
exports.DataStoreORMCustom = DataStoreORMCustom;
