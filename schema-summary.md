# Database schema summary

Tables discovered: 12

## auctions
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- stream_id: string (uuid) — Note: This is a Foreign Key to `streams.id`.<fk table='streams' column='id'/> (required)
- collection_id: string (uuid) — Note: This is a Foreign Key to `collections.id`.<fk table='collections' column='id'/>
- product_id: string (uuid) — Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/>
- starting_price: number (numeric), default: 0 (required)
- current_price: number (numeric), default: 0 (required)
- current_winner_id: string (uuid)
- status: string (text), default: active (required)
- started_at: string (timestamp with time zone), default: timezone('utc'::text, now()) (required)
- ends_at: string (timestamp with time zone)
- ended_at: string (timestamp with time zone)
- timer_seconds: integer (integer), default: 30
- timer_started_at: string (timestamp with time zone)
- winner_user_id: string (uuid)
- current_winner_username: string (text)

## bids
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- auction_id: string (uuid) — Note: This is a Foreign Key to `auctions.id`.<fk table='auctions' column='id'/> (required)
- user_id: string (uuid) (required)
- amount: number (numeric) (required)
- created_at: string (timestamp with time zone), default: timezone('utc'::text, now()) (required)
- increment: number (numeric)

## collection_products
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- collection_id: string (uuid) — Note: This is a Foreign Key to `collections.id`.<fk table='collections' column='id'/> (required)
- product_id: string (uuid) — Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/> (required)
- added_at: string (timestamp with time zone), default: timezone('utc'::text, now()) (required)

## collections
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- name: string (text) (required)
- description: string (text)
- user_id: string (uuid) — Note: This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
- is_public: boolean (boolean), default: false
- metadata: object (jsonb)
- created_at: string (timestamp with time zone), default: now()
- updated_at: string (timestamp with time zone), default: now()

## follows
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- follower_id: string (uuid) (required)
- following_id: string (uuid) (required)
- created_at: string (timestamp with time zone), default: timezone('utc'::text, now()) (required)

## ideas
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- user_id: string (uuid) — Note: This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
- title: string (text) (required)
- description: string (text) (required)
- topic: string (text) (required)
- status: string (text), default: Havuz (Kasa)
- conversation: object (jsonb)
- metadata: object (jsonb)
- is_public: boolean (boolean), default: false
- created_at: string (timestamp with time zone), default: now()
- updated_at: string (timestamp with time zone), default: now()

## ideas_collections
- idea_id: string (uuid) — Note: This is a Primary Key.<pk/> This is a Foreign Key to `ideas.id`.<fk table='ideas' column='id'/> (required)
- collection_id: string (uuid) — Note: This is a Primary Key.<pk/> This is a Foreign Key to `collections.id`.<fk table='collections' column='id'/> (required)
- added_at: string (timestamp with time zone), default: now()

## products
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- user_id: string (uuid) (required)
- title: string (text) (required)
- description: string (text)
- price: number (numeric), default: 0 (required)
- image_url: string (text)
- created_at: string (timestamp with time zone), default: timezone('utc'::text, now()) (required)
- category: string (text)
- winner_user_id: string (uuid)
- is_sold: boolean (boolean), default: false

## profiles
- id: string (uuid) — Note: This is a Primary Key.<pk/> (required)
- username: string (text) (required)
- email: string (text)
- avatar_url: string (text)
- created_at: string (timestamp with time zone), default: now()
- bio: string (text) — User biography/description
- website: string (text) — Personal website URL
- twitter: string (text) — Twitter/X handle
- instagram: string (text) — Instagram handle
- followers_count: integer (integer), default: 0 — Number of followers
- following_count: integer (integer), default: 0 — Number of users following
- stream_count: integer (integer), default: 0 — Total number of streams created
- is_verified: boolean (boolean), default: false — Whether user is verified (blue checkmark)
- full_name: string (text)

## sales
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- seller_id: string (uuid) (required)
- buyer_id: string (uuid) (required)
- product_id: string (uuid) — Note: This is a Foreign Key to `products.id`.<fk table='products' column='id'/> (required)
- auction_id: string (uuid) — Note: This is a Foreign Key to `auctions.id`.<fk table='auctions' column='id'/>
- final_price: number (numeric) (required)
- sold_at: string (timestamp with time zone), default: now() (required)
- created_at: string (timestamp with time zone), default: now() (required)

## stream_messages
- id: integer (bigint) — Note: This is a Primary Key.<pk/> (required)
- stream_id: string (uuid) — Note: This is a Foreign Key to `streams.id`.<fk table='streams' column='id'/>
- user_id: string (uuid) — Note: This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/>
- content: string (text) (required)
- created_at: string (timestamp with time zone), default: now()
- is_system: boolean (boolean), default: false

## streams
- id: string (uuid), default: gen_random_uuid() — Note: This is a Primary Key.<pk/> (required)
- user_id: string (uuid) — Note: This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/> (required)
- title: string (text) (required)
- description: string (text)
- status: string (text), default: scheduled
- stream_url: string (text)
- created_at: string (timestamp with time zone), default: now()
- updated_at: string (timestamp with time zone), default: now()
- orientation: string (text), default: landscape — Video orientation: landscape (16:9) or portrait (9:16)

