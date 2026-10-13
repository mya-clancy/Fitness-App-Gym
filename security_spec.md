# Firestore Security Specification: Solo Leveling Fitness & Nutrition

## 1. Data Invariants
- Each user can only read, write, or list their own profile at `/users/{userId}` where `userId == request.auth.uid`.
- Users cannot manipulate other hunters' stats, level, or total XP.
- Daily logs at `/users/{userId}/dailyLogs/{date}` can only be accessed and modified by the document owner `userId == request.auth.uid`.
- Workout splits at `/users/{userId}/workoutSplits/{splitId}` can only be created, updated, deleted, or listed by the document owner `userId == request.auth.uid`.
- ID parameters `{userId}`, `{date}`, and `{splitId}` must be valid identifiers matching regex `^[a-zA-Z0-9_\-]+$` and within bounded size limits.
- The global default rule must reject any undefined collections or root access.

## 2. Dirty Dozen Attack Payloads
1. **Unauthenticated Read on User Profile**: Attempting to read `/users/user_abc` without auth token -> Denied.
2. **Cross-Tenant Profile Overwrite**: Authenticated user `user_1` attempting `write` to `/users/user_2` -> Denied.
3. **Cross-Tenant Daily Log Theft**: User `user_1` querying `/users/user_2/dailyLogs` -> Denied.
4. **Cross-Tenant Workout Split Injection**: User `user_1` attempting to insert a malicious split into `/users/user_2/workoutSplits/split_x` -> Denied.
5. **Path Poisoning with Oversized ID**: Attempting to target `/users/user_1/dailyLogs/[10KB string]` -> Denied by `isValidId`.
6. **Negative/Unsafe Level or XP Tampering**: User sending non-number or NaN values for level -> Blocked by validation helper.
7. **Blanket List Harvest**: Unauthenticated attacker querying `/users` -> Denied by global deny rule.
8. **Orphaned Workout Split Write**: Writing a workout split where payload `userId` doesn't match authenticated `request.auth.uid` -> Denied.
9. **Tampering with Daily Log Date Path**: Writing to `/users/{userId}/dailyLogs/2026-10-13` with `date` field in payload equal to `2099-01-01` -> Enforced matching path.
10. **Ghost Fields Injection**: Sending unexpected shadow fields or script tags in profile -> Blocked by strict schema validation.
11. **Malicious Exercise Array Poisoning**: Sending unbounded 10MB arrays in workout routine -> Bounded list checks prevent wallet denial.
12. **Unauthenticated Public Document Sweep**: Running collection group queries without permission -> Denied by default-deny catch-all.
