-- Ensure the auction price updates on bid insert even with RLS, by using SECURITY DEFINER
-- Also store winner_user_id and current_winner_username for UI convenience

CREATE OR REPLACE FUNCTION public.update_auction_on_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auction_current_price numeric(12,2);
  uname text;
BEGIN
  -- Lock the auction row to avoid race conditions
  SELECT current_price INTO auction_current_price FROM public.auctions WHERE id = NEW.auction_id FOR UPDATE;

  IF NEW.amount > COALESCE(auction_current_price, 0) THEN
    SELECT username INTO uname FROM public.profiles WHERE id = NEW.user_id;
    UPDATE public.auctions
    SET current_price = NEW.amount,
        current_winner_id = NEW.user_id,
        winner_user_id = NEW.user_id,
        current_winner_username = COALESCE(uname, current_winner_username)
    WHERE id = NEW.auction_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it points to the updated function (idempotent)
DROP TRIGGER IF EXISTS update_auction_on_bid_trigger ON public.bids;
CREATE TRIGGER update_auction_on_bid_trigger
AFTER INSERT ON public.bids
FOR EACH ROW EXECUTE FUNCTION public.update_auction_on_bid();

COMMENT ON FUNCTION public.update_auction_on_bid() IS 'Updates auctions.current_price and winner fields when a higher bid is inserted. SECURITY DEFINER to bypass RLS with controlled logic.';
