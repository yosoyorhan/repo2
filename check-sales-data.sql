-- Check if sales data exists
SELECT 
  s.id,
  s.created_at,
  s.final_price,
  s.seller_id,
  s.buyer_id,
  p.title as product_title,
  p.is_sold
FROM sales s
JOIN products p ON s.product_id = p.id
ORDER BY s.created_at DESC
LIMIT 10;
