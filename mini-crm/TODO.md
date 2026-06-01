# mini-crm TODO

## Planned changes
- [x] Add drag-and-drop status update on Task details page (no edit mode required).
- [x] Ensure status change persists via `updateTask` and creates an activity entry.
- [x] Fix “#undefind in params” issue by preventing activity meta from using undefined clientId.
- [x] Remove/adjust any code paths where `updateTask` might drop `status` (currently CRMProvider updateTask omits `status`).
- [ ] Run frontend lint/build/tests if available.

