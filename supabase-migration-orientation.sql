-- Add orientation column to streams table
ALTER TABLE streams 
ADD COLUMN IF NOT EXISTS orientation text DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait'));

-- Add comment
COMMENT ON COLUMN streams.orientation IS 'Video orientation: landscape (16:9) or portrait (9:16)';
