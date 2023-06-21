import { DataStoreORM } from "@veramo/data-store";
import { Any, Between, Brackets, Equal, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, } from "typeorm";
import { CredentialSchema, createCredentialSchema, } from "./entities/credentialSchema.js";
import { getConnectedDb } from "../utils.js";
export class DataStoreORMCustom extends DataStoreORM {
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
        let qb = (await getConnectedDb(this.dbConnectionCustom))
            .getRepository(CredentialSchema)
            .createQueryBuilder("credentialSchema")
            .where(where);
        qb = this.decorateQB(qb, "credentialSchema", args);
        if (context.authorizedDID) {
            qb = qb.andWhere(new Brackets((qb) => {
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
            return createCredentialSchema(schema);
        });
    }
    async dataStoreORMGetCredentialSchemasCount(args, context) {
        return (await this.credentialSchemasQuery(args, context)).getCount();
    }
    // These functions below are from Veramo DataStoreORM, we need them but
    // they are private
    decorateQB(qb, tableName, input) {
        if (input === null || input === void 0 ? void 0 : input.skip)
            qb = qb.skip(input.skip);
        if (input === null || input === void 0 ? void 0 : input.take)
            qb = qb.take(input.take);
        if (input === null || input === void 0 ? void 0 : input.order) {
            for (const item of input.order) {
                qb = qb.orderBy(qb.connection.driver.escape(tableName) +
                    "." +
                    qb.connection.driver.escape(item.column), item.direction);
            }
        }
        return qb;
    }
    createWhereObject(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        const where = {};
        if (input === null || input === void 0 ? void 0 : input.where) {
            for (const item of input.where) {
                if (item.column === "verifier") {
                    continue;
                }
                switch (item.op) {
                    case "Any":
                        if (!Array.isArray(item.value))
                            throw Error("Operator Any requires value to be an array");
                        where[item.column] = Any(item.value);
                        break;
                    case "Between":
                        if (((_a = item.value) === null || _a === void 0 ? void 0 : _a.length) != 2)
                            throw Error("Operation Between requires two values");
                        where[item.column] = Between(item.value[0], item.value[1]);
                        break;
                    case "Equal":
                        if (((_b = item.value) === null || _b === void 0 ? void 0 : _b.length) != 1)
                            throw Error("Operation Equal requires one value");
                        where[item.column] = Equal(item.value[0]);
                        break;
                    case "IsNull":
                        where[item.column] = IsNull();
                        break;
                    case "LessThan":
                        if (((_c = item.value) === null || _c === void 0 ? void 0 : _c.length) != 1)
                            throw Error("Operation LessThan requires one value");
                        where[item.column] = LessThan(item.value[0]);
                        break;
                    case "LessThanOrEqual":
                        if (((_d = item.value) === null || _d === void 0 ? void 0 : _d.length) != 1)
                            throw Error("Operation LessThanOrEqual requires one value");
                        where[item.column] = LessThanOrEqual(item.value[0]);
                        break;
                    case "Like":
                        if (((_e = item.value) === null || _e === void 0 ? void 0 : _e.length) != 1)
                            throw Error("Operation Like requires one value");
                        where[item.column] = Like(item.value[0]);
                        break;
                    case "MoreThan":
                        if (((_f = item.value) === null || _f === void 0 ? void 0 : _f.length) != 1)
                            throw Error("Operation MoreThan requires one value");
                        where[item.column] = MoreThan(item.value[0]);
                        break;
                    case "MoreThanOrEqual":
                        if (((_g = item.value) === null || _g === void 0 ? void 0 : _g.length) != 1)
                            throw Error("Operation MoreThanOrEqual requires one value");
                        where[item.column] = MoreThanOrEqual(item.value[0]);
                        break;
                    case "In":
                    default:
                        if (!Array.isArray(item.value))
                            throw Error("Operator IN requires value to be an array");
                        where[item.column] = In(item.value);
                }
                if (item.not === true) {
                    where[item.column] = Not(where[item.column]);
                }
            }
        }
        return where;
    }
}
