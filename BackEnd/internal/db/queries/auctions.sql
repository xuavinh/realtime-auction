-- name: CreateAuction :one
INSERT INTO auctions(
    title,
    description,
    category_id,
    start_price,
    current_price,
    min_bid_increment,
    start_time,
    end_time,
    created_by
) VALUES(
    $1, $2, $3, $4, $4, $5, $6, $7, $8
)
RETURNING *;

-- name: GetActionByID :one
SELECT *
FROM auctions
WHERE id = $1
LIMIT 1;

-- name: GetAuctionOwner :one
SELECT id, created_by, status
FROM auctions
WHERE id = $1
LIMIT 1;

-- name: ListAuctionsEndingSoon :many
SELECT *
FROM auctions
WHERE
    (sqlc.narg(status)::auction_status IS NULL OR status = sqlc.narg(status)::auction_status)
    AND (sqlc.narg(category_id)::int IS NULL OR category_id = sqlc.narg(category_id)::int)
    AND (sqlc.narg(min_price)::bigint IS NULL OR current_price >= sqlc.narg(min_price)::bigint)
    AND (sqlc.narg(max_price)::bigint IS NULL OR current_price <= sqlc.narg(max_price)::bigint)
    AND end_time <= NOW() + INTERVAL '24 hours'
ORDER BY end_time ASC
LIMIT $1 OFFSET $2;

-- name: ListAuctionsNewest :many
SELECT *
FROM auctions
WHERE
    (sqlc.narg(status)::auction_status IS NULL OR status = sqlc.narg(status)::auction_status)
    AND (sqlc.narg(category_id)::int  IS NULL OR category_id = sqlc.narg(category_id)::int)
    AND (sqlc.narg(min_price)::bigint IS NULL OR current_price >= sqlc.narg(min_price)::bigint)
    AND (sqlc.narg(max_price)::bigint IS NULL OR current_price <= sqlc.narg(max_price)::bigint)
ORDER BY created_at DESC
LIMIT  $1 OFFSET $2;

-- name: ListAuctionsPriceAsc :many
SELECT *
FROM auctions
WHERE
    (sqlc.narg(status)::auction_status IS NULL OR status = sqlc.narg(status)::auction_status)
    AND (sqlc.narg(category_id)::int  IS NULL OR category_id = sqlc.narg(category_id)::int)
    AND (sqlc.narg(min_price)::bigint IS NULL OR current_price >= sqlc.narg(min_price)::bigint)
    AND (sqlc.narg(max_price)::bigint IS NULL OR current_price <= sqlc.narg(max_price)::bigint)
ORDER BY current_price ASC
LIMIT  $1 OFFSET $2;

-- name: ListAuctionsPriceDesc :many
SELECT *
FROM auctions
WHERE
    (sqlc.narg(status)::auction_status IS NULL OR status = sqlc.narg(status)::auction_status)
    AND (sqlc.narg(category_id)::int  IS NULL OR category_id = sqlc.narg(category_id)::int)
    AND (sqlc.narg(min_price)::bigint IS NULL OR current_price >= sqlc.narg(min_price)::bigint)
    AND (sqlc.narg(max_price)::bigint IS NULL OR current_price <= sqlc.narg(max_price)::bigint)
ORDER BY current_price DESC NULLS LAST, id DESC
LIMIT  $1 OFFSET $2;

-- name: CountAuctions :one
SELECT COUNT(*) AS total
FROM auctions
WHERE
    (sqlc.narg(status)::auction_status IS NULL OR status = sqlc.narg(status)::auction_status)
    AND (sqlc.narg(category_id)::int  IS NULL OR category_id = sqlc.narg(category_id)::int)
    AND (sqlc.narg(min_price)::bigint IS NULL OR current_price >= sqlc.narg(min_price)::bigint)
    AND (sqlc.narg(max_price)::bigint IS NULL OR current_price <= sqlc.narg(max_price)::bigint);

-- name: ListCoverImagesByAuctionIDs :many
SELECT DISTINCT ON (auction_id)
    id, auction_id, url, filename, size_bytes, mime_type, sort_order, is_primary, created_at
FROM auction_images
WHERE auction_id = ANY($1::int[])
ORDER BY auction_id, is_primary DESC, sort_order ASC, id ASC;