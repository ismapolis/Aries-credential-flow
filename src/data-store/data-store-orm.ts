import { DataStoreORM } from "@veramo/data-store";
import {
  Any,
  Between,
  Brackets,
  DataSource,
  Equal,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  SelectQueryBuilder,
} from "typeorm";
import { OrPromise } from "@veramo/utils";
import {
  FindArgs,
  TCredentialColumns,
  AuthorizedDIDContext,
  TClaimsColumns,
  TMessageColumns,
  TPresentationColumns,
  TIdentifiersColumns,
} from "@veramo/core";
import {
  CredentialSchema,
  createCredentialSchema,
} from "./entities/credentialSchema.js";
import { getConnectedDb } from "../utils.js";
import { ICredentialSchema, IDataStoreORM } from "./index.js";

export class DataStoreORMCustom extends DataStoreORM {
  private dbConnectionCustom: OrPromise<DataSource>;
  readonly methods: IDataStoreORM;

  constructor(dbConnection: OrPromise<DataSource>) {
    super(dbConnection);
    this.dbConnectionCustom = dbConnection;
    this.methods = {
      // schema methods
      dataStoreORMGetCredentialSchemas:
        this.dataStoreORMGetCredentialSchemas.bind(this),
      dataStoreORMGetCredentialSchemasCount:
        this.dataStoreORMGetCredentialSchemasCount.bind(this),

      // veramo orm methods
      dataStoreORMGetIdentifiers: super.dataStoreORMGetIdentifiers.bind(this),
      dataStoreORMGetIdentifiersCount:
        super.dataStoreORMGetIdentifiersCount.bind(this),
      dataStoreORMGetMessages: super.dataStoreORMGetMessages.bind(this),
      dataStoreORMGetMessagesCount: super.dataStoreORMGetMessagesCount.bind(
        this
      ),
      dataStoreORMGetVerifiableCredentialsByClaims:
        super.dataStoreORMGetVerifiableCredentialsByClaims.bind(this),
      dataStoreORMGetVerifiableCredentialsByClaimsCount:
        super.dataStoreORMGetVerifiableCredentialsByClaimsCount.bind(this),
      dataStoreORMGetVerifiableCredentials:
        super.dataStoreORMGetVerifiableCredentials.bind(this),
      dataStoreORMGetVerifiableCredentialsCount:
        super.dataStoreORMGetVerifiableCredentialsCount.bind(this),
      dataStoreORMGetVerifiablePresentations:
        super.dataStoreORMGetVerifiablePresentations.bind(this),
      dataStoreORMGetVerifiablePresentationsCount:
        super.dataStoreORMGetVerifiablePresentationsCount.bind(this),
    };
  }

  // Methods for Credential Schemas
  private async credentialSchemasQuery(
    args: FindArgs<TCredentialColumns>,
    context: AuthorizedDIDContext
  ): Promise<SelectQueryBuilder<CredentialSchema>> {
    const where = this.createWhereObject(args);
    let qb = (await getConnectedDb(this.dbConnectionCustom))
      .getRepository(CredentialSchema)
      .createQueryBuilder("credentialSchema")
      .where(where);
    qb = this.decorateQB(qb, "credentialSchema", args);
    if (context.authorizedDID) {
      qb = qb.andWhere(
        new Brackets((qb) => {
          qb.where("credential.subject = :ident", {
            ident: context.authorizedDID,
          }).orWhere("credential.issuer = :ident", {
            ident: context.authorizedDID,
          });
        })
      );
    }
    return qb;
  }

  async dataStoreORMGetCredentialSchemas(
    args: FindArgs<TCredentialColumns>,
    context: AuthorizedDIDContext
  ): Promise<ICredentialSchema[]> {
    const credentialSchemas = await (
      await this.credentialSchemasQuery(args, context)
    ).getMany();
    return credentialSchemas.map((schema) => {
      return createCredentialSchema(schema);
    });
  }

  async dataStoreORMGetCredentialSchemasCount(
    args: FindArgs<TCredentialColumns>,
    context: AuthorizedDIDContext
  ): Promise<number> {
    return (await this.credentialSchemasQuery(args, context)).getCount();
  }

  // These functions below are from Veramo DataStoreORM, we need them but
  // they are private
  private decorateQB(
    qb: SelectQueryBuilder<any>,
    tableName: string,
    input: FindArgs<any>
  ): SelectQueryBuilder<any> {
    if (input?.skip) qb = qb.skip(input.skip);
    if (input?.take) qb = qb.take(input.take);

    if (input?.order) {
      for (const item of input.order) {
        qb = qb.orderBy(
          qb.connection.driver.escape(tableName) +
            "." +
            qb.connection.driver.escape(item.column),
          item.direction
        );
      }
    }
    return qb;
  }

  private createWhereObject(
    input: FindArgs<
      | TMessageColumns
      | TClaimsColumns
      | TCredentialColumns
      | TPresentationColumns
      | TIdentifiersColumns
    >
  ): any {
    const where: Record<string, any> = {};
    if (input?.where) {
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
            if (item.value?.length != 2)
              throw Error("Operation Between requires two values");
            where[item.column] = Between(item.value[0], item.value[1]);
            break;
          case "Equal":
            if (item.value?.length != 1)
              throw Error("Operation Equal requires one value");
            where[item.column] = Equal(item.value[0]);
            break;
          case "IsNull":
            where[item.column] = IsNull();
            break;
          case "LessThan":
            if (item.value?.length != 1)
              throw Error("Operation LessThan requires one value");
            where[item.column] = LessThan(item.value[0]);
            break;
          case "LessThanOrEqual":
            if (item.value?.length != 1)
              throw Error("Operation LessThanOrEqual requires one value");
            where[item.column] = LessThanOrEqual(item.value[0]);
            break;
          case "Like":
            if (item.value?.length != 1)
              throw Error("Operation Like requires one value");
            where[item.column] = Like(item.value[0]);
            break;
          case "MoreThan":
            if (item.value?.length != 1)
              throw Error("Operation MoreThan requires one value");
            where[item.column] = MoreThan(item.value[0]);
            break;
          case "MoreThanOrEqual":
            if (item.value?.length != 1)
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
