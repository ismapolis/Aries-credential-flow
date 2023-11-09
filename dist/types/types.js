"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ariesMessageTypesPresentation = exports.ariesMessageTypesCredential = void 0;
var ariesMessageTypesCredential;
(function (ariesMessageTypesCredential) {
    ariesMessageTypesCredential["PROPOSE_CREDENTIAL"] = "https://didcomm.org/issue-credential/2.0/propose-credential";
    ariesMessageTypesCredential["OFFER_CREDENTIAL"] = "https://didcomm.org/issue-credential/2.0/offer-credential";
    ariesMessageTypesCredential["REQUEST_CREDENTIAL"] = "https://didcomm.org/issue-credential/2.0/request-credential";
    ariesMessageTypesCredential["ISSUE_CREDENTIAL"] = "https://didcomm.org/issue-credential/2.0/issue-credential";
})(ariesMessageTypesCredential = exports.ariesMessageTypesCredential || (exports.ariesMessageTypesCredential = {}));
var ariesMessageTypesPresentation;
(function (ariesMessageTypesPresentation) {
    ariesMessageTypesPresentation["PROPOSE_PRESENTATION"] = "https://didcomm.org/present-proof/2.0/propose-presentation";
    ariesMessageTypesPresentation["REQUEST_PRESENTATION"] = "https://didcomm.org/present-proof/2.0/request-presentation";
    ariesMessageTypesPresentation["PRESENTATION"] = "https://didcomm.org/present-proof/2.0/presentation";
})(ariesMessageTypesPresentation = exports.ariesMessageTypesPresentation || (exports.ariesMessageTypesPresentation = {}));
