-- Find your user ID and check your sales
-- Replace YOUR_EMAIL with your actual email
SELECT 
  id as user_id,
  email,
  raw_user_meta_data->>'username' as username
FROM auth.users
WHERE email LIKE '%@%'  -- Shows all users
ORDER BY created_at DESC
LIMIT 5;

-- Then check sales for a specific user (replace USER_ID)
-- Example: 
-- SELECT * FROM sales WHERE seller_id = 'your-user-id-here' OR buyer_id = 'your-user-id-here';
