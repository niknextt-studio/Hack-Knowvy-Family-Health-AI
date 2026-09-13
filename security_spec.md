# Security Specification & Threat Model

## 1. Data Invariants
1. **User Identity Invariant**: A user document in `/users/{userId}` can only be written by the authenticated user whose `request.auth.uid == userId`.
2. **Family Vault Invariant**: A family document in `/families/{familyId}` can be created by any signed-in user where `request.resource.data.adminId == request.auth.uid`. Updates require admin or membership ownership.
3. **Invitation Invariant**: An invitation in `/invitations/{invitationId}` must have `inviterId == request.auth.uid` on create. Updates to accept/decline can only be performed by the invitee or inviter.
4. **Member Code Guard**: Member codes must match `^[A-Z0-9\-]+$` and not exceed 32 characters.
5. **No Blanket Reads**: Reads of `/users/{userId}` are restricted to the owner or members of the same family.

## 2. The "Dirty Dozen" Threat Payloads (Must be blocked)
1. **Unauthenticated Read**: Attempting to read `/users/test-user-123` with `request.auth == null` -> DENIED.
2. **Identity Spoofing**: User `uid_alice` attempting to write to `/users/uid_bob` -> DENIED.
3. **Ghost Role / Field Injection**: Attempting to write `{ role: "super_admin", isMaster: true }` into `/users/{userId}` -> DENIED.
4. **ID Poisoning Attack**: Passing a 2KB junk character string as a document ID in `/users/{userId}` -> DENIED.
5. **Orphaned Family Vault**: Attempting to create `/families/f1` with `adminId: "attacker_id"` where `request.auth.uid == "victim_id"` -> DENIED.
6. **Malicious Invitation Spoofing**: Creating `/invitations/inv1` where `inviterId: "victim_id"` but auth is `attacker_id` -> DENIED.
7. **Invitation Status Forgery by Third Party**: Modifying an invitation's status when user is neither `inviterId` nor `inviteeId`/`inviteeCode` -> DENIED.
8. **Oversized String DOS Attack**: Injecting a 500KB text payload into `memberCode` or `name` -> DENIED.
9. **Blanket Query Scraping**: Running an unbound query on `/users` across all users without ownership filters -> DENIED.
10. **Medical Document Ownership Hijack**: Creating a medical document for member `victim` without permission in that family -> DENIED.
11. **Tampering with Immutable Creation Timestamps**: Modifying `createdAt` during an update -> DENIED.
12. **Malicious Subcollection Write**: Writing directly to `/families/{familyId}/members/{memberId}` without belonging to the family -> DENIED.
