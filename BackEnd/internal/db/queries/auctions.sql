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