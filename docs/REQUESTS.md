# Request Bodies

What the frontend sends for each endpoint it calls. All requests go through
[utils/apiRequest.js](../src/utils/apiRequest.js): JSON bodies are passed as `data: {...}`,
file uploads as `data: <FormData>`. Authenticated requests pass `token` (added as
`Authorization: Bearer <token>`). Base URL comes from `VITE_API_URL`.

The backend route list (methods, paths, roles) lives in the API repo at `docs/API.md`.

## Auth

**POST `/auth/login`** — no token
```json
{ "iin": "string", "password": "string" }
```
Response: `{ access_token, token_type, user: { iin, role, phone, photo, full_name, short_name } }`.
The app stores `{ access_token, user, expires_at }` via `setSession`.

**GET `/auth/check`** — token, no body.

## Account (`/user`)

**POST `/user/update-phone`**
```json
{ "phone": "string" }
```

**PATCH `/user/change-password`**
```json
{ "old_password": "string", "new_password": "string" }
```

**POST `/user/upload-photo`** — multipart `FormData`
```text
photo: <File>
```

## Admin — users (`/admin/users`)

**POST `/admin/users/`**
```json
{ "iin": "string", "full_name": "string", "phone": "string", "role": "student|teacher|admin", "password": "string" }
```

**PATCH `/admin/users/reset_password`**
```json
{ "user_iin": "string", "new_password": "string" }
```

## Admin — groups (`/admin/groups`)

**POST `/admin/groups/`**
```json
{ "name": "string", "description": "string" }
```

**POST `/admin/groups/{group_id}/users`** — array of user IDs
```json
[ 12, 34 ]
```

**POST `/admin/groups/upload-excel`** — multipart `FormData`
```text
file: <.xlsx>
```

## Admin — modules (`/admin/modules`)

**POST `/admin/modules/`** and **PUT `/admin/modules/{module_id}`**
```json
{ "title": "string", "course": "string", "description": "string" }
```

**POST `/admin/modules/{module_id}/subjects`**
```json
{ "title": "string" }
```

## Access (`/access`)

**POST `/access/admin/group-to-module`**
```json
{ "group_id": 1, "module_id": 2 }
```

**POST `/access/admin/teacher-to-subject`**
```json
{ "teacher_iin": "string", "module_id": 2, "subject_id": 3 }
```

## Lessons (`/lessons`)

**POST `/lessons/add/subjects/{subject_id}`**
```json
{ "title": "string", "type": "video|pdf|test", "content_url": "string", "description": "string", "test_id": 5 }
```
`test_id` is included only for test lessons.

**POST `/lessons/upload/lesson-file`** — multipart `FormData`
```text
file: <File>
```
Response: `{ url }`, used as `content_url`.

**POST `/lessons/{lesson_id}/submit-homework`** — multipart `FormData`
```text
file: <File>   (repeatable, up to 5)
comment: string (optional)
```

**PATCH `/lessons/submission/{submission_id}/grade`**
```json
{ "grade": 100 }
```

## Tests (`/tests`)

**POST `/tests/create`** and **PUT `/tests/{test_id}`**
```json
{
  "title": "string",
  "subject_id": 1,
  "lesson_id": null,
  "questions": [
    {
      "question_text": "string",
      "correct_option_index": 0,
      "options": [ { "option_text": "string", "option_index": 0 } ]
    }
  ]
}
```

**POST `/tests/submit`**
```json
{
  "test_id": 1,
  "answers": [ { "question_id": 10, "selected_index": 2 } ]
}
```
