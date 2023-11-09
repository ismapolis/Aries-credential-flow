"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationsCustom = void 0;
const data_store_1 = require("@veramo/data-store");
const createDatabase_js_1 = require("./createDatabase.js");
let migrationsCustom = data_store_1.migrations;
exports.migrationsCustom = migrationsCustom;
// Overwritting migrations array with our custom database
migrationsCustom[0] = createDatabase_js_1.CreateDatabaseCustom;
