-- name: CreateUser :one
INSERT INTO users (email, password_hash, full_name)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetUserByEmail :one
SELECT *
FROM users
WHERE LOWER(email) = LOWER($1)
LIMIT 1;

-- name: GetUserByID :one
SELECT user_id, user_uuid, email, full_name, avatar_url, created_at, updated_at
FROM users
WHERE user_id = $1
LIMIT 1;

-- name: ExistsEmail :one
SELECT EXISTS(
    SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)
) AS exists;