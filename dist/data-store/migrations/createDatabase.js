"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDatabaseCustom = void 0;
const data_store_1 = require("@veramo/data-store");
const migration_functions_js_1 = require("@veramo/data-store/build/migrations/migration-functions.js");
const typeorm_1 = require("typeorm");
class CreateDatabaseCustom extends data_store_1.migrations[0] {
    async up(queryRunner) {
        // Creating Veramo default database
        await super.up(queryRunner);
        // Adding additional table for storing credential schemes
        await queryRunner.createTable(new typeorm_1.Table({
            name: (0, migration_functions_js_1.migrationGetTableName)(queryRunner, "credentialSchema"),
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
exports.CreateDatabaseCustom = CreateDatabaseCustom;
