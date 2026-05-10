-- name: ListCategories :many
SELECT id, name, slug, sort_order
FROM categories
ORDER BY sort_order ASC, id ASC;

-- name: GetCategoryByID :one
SELECT id, name, slug, sort_order
FROM categories
WHERE id = $1
LIMIT 1;

-- name: CategoryExists :one
SELECT EXISTS(
    SELECT 1 FROM categories WHERE id = $1
) AS exists;