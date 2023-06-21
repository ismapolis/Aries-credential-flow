# Documentation Aries Credential Flow Plugin

An implementation prototype for the issue-credential and present-proof Aries standars for Veramo Agent. This implementation allows you to send send and handle DIDComm messages based on these Aries RFCs.

In addtion this plugin comes with some one a custom DataStore plugin that extends from the original Veramo DataStore and adds support for registering and verifying credential schemas.

## Supported RFCs

- Aries RFC 0453: Issue Credential Protocol 2.0
- Aries RFC 0454: Present Proof Protocol 2.0

### Extra used RFCs

These are the attachment format standars used for the messages

- Aries RFC 0593: JSON-LD Credential Attachment format for requesting and issuing credentials

- Aries RFC 0510: Presentation-Exchange Attachment format for requesting and presenting proofs
