-- name: GetAuctionForActor :one
SELECT id, current_price, version, extension_count, max_extensions, created_by, status, min_bid_increment, start_time, end_time
FROM auctions
WHERE id = $1;

-- name: PlaceBid :one
UPDATE auctions
SET
    current_price = $1,
    version = version +1,
    extension_count = CASE
        WHEN end_time <= NOW() + interval '10 seconds'
            AND extension_count < max_extensions
        THEN extension_count +1
        ELSE extension_count
    END,
    end_time = CASE
        WHEN end_time <= NOW() + interval '10 seconds'
            AND extension_count < max_extensions
        THEN end_time + INTERVAL '10 seconds'
        ELSE end_time
    END
WHERE id = $2
    AND status = 'ACTIVE'
    AND start_time <= NOW()
    AND end_time >= NOW()
    AND $1 >= current_price + min_bid_increment
    AND $3 != created_by
RETURNING version, end_time, extension_count, current_price;

-- name: InsertBid :one
INSERT INTO bids (auction_id, user_id, bid_price, auction_version)
VALUES ($1, $2, $3, $4)
RETURNING id, created_at;

-- name: ListBidsByAuction :many
SELECT b.id, b.bid_price, b.auction_version, b.created_at, u.full_name AS bidder_name
FROM bids b
JOIN users u ON u.user_id = b.user_id
WHERE b.auction_id = $1
ORDER BY b.auction_version DESC
LIMIT $2 OFFSET $3;

-- name: CountBidsByAuction :one
SELECT COUNT(*)::bigint AS total FROM bids WHERE auction_id = $1;

-- name: ActivateAuctions :many
UPDATE auctions
SET status = 'ACTIVE'
WHERE status = 'PENDING' AND start_time <= NOW()
RETURNING id;

-- name: EndAuctions :many
UPDATE auctions a
SET
    status = 'ENDED',
    winner_id = (
        SELECT user_id FROM bids
        WHERE auction_id = a.id
        ORDER BY auction_version DESC
        LIMIT 1
    )
WHERE a.status = 'ACTIVE' AND a.end_time <= NOW()
RETURNING a.id, a.title, a.current_price, a.winner_id;
