import { migrations } from "@veramo/data-store";
import { CreateDatabaseCustom } from "./createDatabase.js";
let migrationsCustom = migrations;
// Overwritting migrations array with our custom database
migrationsCustom[0] = CreateDatabaseCustom;
export { migrationsCustom };
