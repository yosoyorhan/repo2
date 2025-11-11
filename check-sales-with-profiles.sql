-- Check sales with profile information
SELECT 
  s.id,
  s.created_at,
  s.final_price,
  s.seller_id,
  s.buyer_id,
  p.title as product_title,
  p.is_sold,
  seller.username as seller_username,
  buyer.username as buyer_username
FROM sales s
JOIN products p ON s.product_id = p.id
LEFT JOIN profiles seller ON s.seller_id = seller.id
LEFT JOIN profiles buyer ON s.buyer_id = buyer.id
ORDER BY s.created_at DESC
LIMIT 10;

-- Also check total count
SELECT COUNT(*) as total_sales FROM sales;
