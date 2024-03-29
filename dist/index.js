"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entitiesCustom = exports.migrationsCustom = exports.PresentProofHandler = exports.IssueCredentialHandler = exports.types = exports.DataStoreORM = exports.DataStore = exports.CredentialFlow = void 0;
const index_js_1 = require("./data-store/index.js");
Object.defineProperty(exports, "DataStore", { enumerable: true, get: function () { return index_js_1.DataStore; } });
Object.defineProperty(exports, "DataStoreORM", { enumerable: true, get: function () { return index_js_1.DataStoreORM; } });
const credentialFlow_js_1 = require("./credentialFlow.js");
Object.defineProperty(exports, "CredentialFlow", { enumerable: true, get: function () { return credentialFlow_js_1.CredentialFlow; } });
const types = __importStar(require("./types/types.js"));
exports.types = types;
const issue_credential_handler_js_1 = require("./handlers/issue-credential-handler.js");
Object.defineProperty(exports, "IssueCredentialHandler", { enumerable: true, get: function () { return issue_credential_handler_js_1.IssueCredentialHandler; } });
const present_proof_handler_js_1 = require("./handlers/present-proof-handler.js");
Object.defineProperty(exports, "PresentProofHandler", { enumerable: true, get: function () { return present_proof_handler_js_1.PresentProofHandler; } });
const index_js_2 = require("./data-store/migrations/index.js");
Object.defineProperty(exports, "migrationsCustom", { enumerable: true, get: function () { return index_js_2.migrationsCustom; } });
const index_js_3 = require("./data-store/entities/index.js");
Object.defineProperty(exports, "entitiesCustom", { enumerable: true, get: function () { return index_js_3.entitiesCustom; } });
