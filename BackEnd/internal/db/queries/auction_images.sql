-- name: CreateAuctionImage :one
INSERT INTO auction_images(
    auction_id, url, filename, size_bytes, mime_type, sort_order, is_primary
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: ListAuctionImages :many
SELECT *
FROM auction_images
WHERE auction_id = $1
ORDER BY sort_order ASC, id ASC;

-- name: GetAuctionImage :one
SELECT *
FROM auction_images
WHERE id = $1;

-- name: CountAuctionImages :one
SELECT COUNT(*)::int AS total
FROM auction_images
WHERE auction_id = $1;

-- name: DeleteAuctionImage :execrows
DELETE FROM auction_images
WHERE id = $1 AND auction_id = $2;

-- name: PromoteFirstImageToPrimary :one
UPDATE auction_images AS ai
SET is_primary = true
WHERE ai.id = (
    SELECT sub.id FROM auction_images AS sub
    WHERE sub.auction_id = $1 AND sub.is_primary = FALSE
    ORDER BY sort_order ASC, id ASC
    LIMIT 1
)
RETURNING ai.id, ai.auction_id, ai.url, ai.filename, ai.size_bytes, ai.mime_type, ai.sort_order, ai.is_primary, ai.created_at;