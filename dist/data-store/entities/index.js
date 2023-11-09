"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitiesCustom = void 0;
const credentialSchema_js_1 = require("./credentialSchema.js");
const data_store_1 = require("@veramo/data-store");
let entitiesCustom = data_store_1.Entities;
exports.entitiesCustom = entitiesCustom;
entitiesCustom.push(credentialSchema_js_1.CredentialSchema);
