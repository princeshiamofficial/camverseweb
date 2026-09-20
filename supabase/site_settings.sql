-- ==============================================================================
-- CamVerse Site Settings (Tracking & Dynamic Configs) for Supabase
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Public read policy: Anyone can read settings (needed for site visitors to load GTM & Meta Pixel)
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings"
    ON public.site_settings FOR SELECT
    USING (true);

-- 4. Allow modify site settings (Backend API routes verify admin session before calling Supabase)
DROP POLICY IF EXISTS "Allow write site settings" ON public.site_settings;
CREATE POLICY "Allow write site settings"
    ON public.site_settings FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Seed initial tracking configuration
INSERT INTO public.site_settings (key, value)
VALUES (
    'tracking',
    jsonb_build_object(
        'gtmId', '',
        'gtmEnabled', false,
        'fbPixelId', '1711427810641721',
        'fbPixelEnabled', true,
        'updatedAt', now()
    )
)
ON CONFLICT (key) DO NOTHING;
