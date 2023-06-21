import { migrations } from "@veramo/data-store";
import { migrationGetTableName } from "@veramo/data-store/build/migrations/migration-functions.js";
import { Table } from "typeorm";
export class CreateDatabaseCustom extends migrations[0] {
    async up(queryRunner) {
        // Creating Veramo default database
        await super.up(queryRunner);
        // Adding additional table for storing credential schemes
        await queryRunner.createTable(new Table({
            name: migrationGetTableName(queryRunner, "credentialSchema"),
            columns: [
                { name: "type", type: "text", isPrimary: true },
                { name: "attributes", type: "text", isNullable: false },
            ],
            indices: [
                {
                    columnNames: ["type"],
                    isUnique: true,
                },
            ],
        }), true);
    }
}
