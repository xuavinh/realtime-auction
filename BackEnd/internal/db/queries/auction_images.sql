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