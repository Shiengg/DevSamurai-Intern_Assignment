# DevSamurai-Intern_Assignment

## Auth API endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /me` (requires `Authorization: Bearer <access_token>`)

### Notes

- The old login path `POST /auth/signin` has been replaced by `POST /auth/login`.
- The profile path is `GET /me` (not `GET /auth/me`).
