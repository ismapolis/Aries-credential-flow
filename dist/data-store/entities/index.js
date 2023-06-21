import { CredentialSchema } from "./credentialSchema.js";
import { Entities } from "@veramo/data-store";
let entitiesCustom = Entities;
entitiesCustom.push(CredentialSchema);
export { entitiesCustom };
