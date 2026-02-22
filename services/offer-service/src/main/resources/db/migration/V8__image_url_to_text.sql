-- V8: Widen image_url column from VARCHAR(500) to TEXT to support base64 image uploads
ALTER TABLE offers.offers ALTER COLUMN image_url TYPE TEXT;
