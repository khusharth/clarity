# Data Model

## Entities

### Task
- id: string (uuid)
- text: string (1..200 chars)
- isUrgent: boolean
- isImportant: boolean
- status: "active" | "completed"
- createdAt: ISO string
- completedAt: ISO string | null

Constraints:
- Quadrant derived from (isUrgent, isImportant)
- Sorting within quadrant by createdAt (newest first)

### Preferences
- reducedMotion: boolean (default: follow system)
- soundEnabled: boolean (default: false)

Notes:
- Local-first: stored in IndexedDB; fallback localStorage if DB unavailable
- Import/export JSON includes both entities; schema version embedded for future changes

