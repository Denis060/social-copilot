-- Create Tables
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  use_case TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  posts_this_month INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX social_accounts_user_id_platform_idx ON public.social_accounts(user_id, platform);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX posts_user_id_scheduled_at_idx ON public.posts(user_id, scheduled_at);

CREATE TABLE public.post_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT
);

CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.auto_reply_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  tone TEXT NOT NULL DEFAULT 'friendly',
  custom_instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX auto_reply_rules_user_id_idx ON public.auto_reply_rules(user_id);

CREATE TABLE public.post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX post_analytics_post_id_idx ON public.post_analytics(post_id);

CREATE TABLE public.comment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform_comment_id TEXT NOT NULL,
  content TEXT NOT NULL,
  reply_text TEXT,
  reply_sent BOOLEAN NOT NULL DEFAULT FALSE,
  rule_id UUID REFERENCES public.auto_reply_rules(id) ON DELETE SET NULL,
  platform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX comment_events_post_id_reply_sent_idx ON public.comment_events(post_id, reply_sent);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_events ENABLE ROW LEVEL SECURITY;

-- PostDestinations policies
CREATE POLICY "Users can manage their own post_destinations through posts" ON public.post_destinations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE public.posts.id = public.post_destinations.post_id
      AND public.posts.user_id = auth.uid()
    )
  );

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- SocialAccounts policies
CREATE POLICY "Users can insert their own social accounts" ON public.social_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own social accounts (excluding tokens)" ON public.social_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
  
CREATE POLICY "Users can update their own social accounts" ON public.social_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own social accounts" ON public.social_accounts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Posts policies
CREATE POLICY "Users can manage their own posts" ON public.posts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- MediaAssets policies
CREATE POLICY "Users can manage their own media assets" ON public.media_assets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- PostAnalytics policies
CREATE POLICY "Users can view analytics for their posts" ON public.post_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE public.posts.id = public.post_analytics.post_id
      AND public.posts.user_id = auth.uid()
    )
  );

-- AutoReplyRules policies
CREATE POLICY "Users can manage their own auto reply rules" ON public.auto_reply_rules
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- CommentEvents policies
CREATE POLICY "Users can view comment events for their posts" ON public.comment_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE public.posts.id = public.comment_events.post_id
      AND public.posts.user_id = auth.uid()
    )
  );

-- Restricting access_token_encrypted from being returned in client-side queries
REVOKE SELECT (access_token_encrypted, refresh_token_encrypted) ON public.social_accounts FROM public, authenticated;
GRANT SELECT (access_token_encrypted, refresh_token_encrypted) ON public.social_accounts TO service_role;

-- Auto-Profile Trigger Setup
-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, posts_this_month, created_at)
  VALUES (NEW.id, NEW.email, 'free', 0, NOW());
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
