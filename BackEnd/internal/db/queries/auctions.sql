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

-- name: GetAuctionByID :one
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
    AND (sqlc.narg(owner_id)::int IS NULL OR created_by = sqlc.narg(owner_id)::int)
    AND end_time > NOW()
    AND end_time <= NOW() + interval '24 hours'
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
    AND (sqlc.narg(owner_id)::int IS NULL OR created_by = sqlc.narg(owner_id)::int)
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
    AND (sqlc.narg(owner_id)::int IS NULL OR created_by = sqlc.narg(owner_id)::int)
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
    AND (sqlc.narg(owner_id)::int IS NULL OR created_by = sqlc.narg(owner_id)::int)
ORDER BY current_price DESC NULLS LAST, id DESC
LIMIT  $1 OFFSET $2;

-- name: CountAuctions :one
SELECT COUNT(*) AS total
FROM auctions
WHERE
    (sqlc.narg(status)::auction_status IS NULL OR status = sqlc.narg(status)::auction_status)
    AND (sqlc.narg(category_id)::int  IS NULL OR category_id = sqlc.narg(category_id)::int)
    AND (sqlc.narg(min_price)::bigint IS NULL OR current_price >= sqlc.narg(min_price)::bigint)
    AND (sqlc.narg(max_price)::bigint IS NULL OR current_price <= sqlc.narg(max_price)::bigint)
    AND (sqlc.narg(owner_id)::int IS NULL OR created_by = sqlc.narg(owner_id)::int);

-- name: CountAuctionsEndingSoon :one
SELECT COUNT(*) AS total
FROM auctions
WHERE
    (sqlc.narg(status)::auction_status IS NULL OR status = sqlc.narg(status)::auction_status)
    AND (sqlc.narg(category_id)::int  IS NULL OR category_id = sqlc.narg(category_id)::int)
    AND (sqlc.narg(min_price)::bigint IS NULL OR current_price >= sqlc.narg(min_price)::bigint)
    AND (sqlc.narg(max_price)::bigint IS NULL OR current_price <= sqlc.narg(max_price)::bigint)
    AND (sqlc.narg(owner_id)::int IS NULL OR created_by = sqlc.narg(owner_id)::int)
    AND end_time > NOW()
    AND end_time <= NOW() + interval '24 hours';

-- name: ListCoverImagesByAuctionIDs :many
SELECT DISTINCT ON (auction_id)
    id, auction_id, url, filename, size_bytes, mime_type, sort_order, is_primary, created_at
FROM auction_images
WHERE auction_id = ANY($1::int[])
ORDER BY auction_id, is_primary DESC, sort_order ASC, id ASC;

-- name: UpdateAuction :one
UPDATE auctions
SET
    title = COALESCE(sqlc.narg(title)::varchar, title),
    description = COALESCE(sqlc.narg(description)::text, description),
    category_id = COALESCE(sqlc.narg(category_id)::int, category_id),
    start_price = COALESCE(sqlc.narg(start_price)::bigint, start_price),
    min_bid_increment = COALESCE(sqlc.narg(min_bid_increment)::bigint, min_bid_increment),
    start_time = COALESCE(sqlc.narg(start_time)::timestamptz, start_time),
    end_time = COALESCE(sqlc.narg(end_time)::timestamptz, end_time),
    current_price = COALESCE(sqlc.narg(start_price)::bigint, current_price)
WHERE id = $1 AND status = 'PENDING'
RETURNING *;

-- name: DeleteAuction :exec
DELETE FROM auctions
WHERE id = $1 AND status = 'PENDING';