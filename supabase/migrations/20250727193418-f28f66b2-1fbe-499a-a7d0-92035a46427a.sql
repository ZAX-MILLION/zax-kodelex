-- Create coin system tables
CREATE TABLE public.coin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'admin_adjustment')),
  context TEXT NOT NULL, -- 'chapter_unlock', 'reward', 'contest', 'daily_bonus', etc.
  reference_id UUID, -- chapter_id, contest_id, etc.
  description TEXT,
  admin_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapter pricing and access tables
CREATE TABLE public.chapter_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  coin_cost INTEGER NOT NULL DEFAULT 0,
  premium_only BOOLEAN NOT NULL DEFAULT false,
  early_access_hours INTEGER DEFAULT 0, -- hours before free release
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chapter_id)
);

CREATE TABLE public.chapter_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('premium', 'coins', 'free', 'admin')),
  coins_spent INTEGER DEFAULT 0,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, chapter_id)
);

-- Create contest system tables
CREATE TABLE public.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('coins', 'premium', 'badge', 'early_access')),
  coin_reward INTEGER DEFAULT 0,
  premium_days INTEGER DEFAULT 0,
  max_winners INTEGER DEFAULT 1,
  entry_requirements JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended', 'cancelled')),
  auto_select_winners BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_data JSONB DEFAULT '{}',
  is_winner BOOLEAN DEFAULT false,
  reward_claimed BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

-- Create flexible user roles table
CREATE TYPE public.user_role_type AS ENUM ('free', 'premium', 'vip', 'moderator', 'admin', 'seo_access');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'free',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  source TEXT, -- 'purchase', 'contest', 'admin', 'promotion'
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.coin_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for coin wallets
CREATE POLICY "Users can view their own wallet" ON public.coin_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets" ON public.coin_wallets
  FOR SELECT USING (is_admin());

CREATE POLICY "System can create wallets" ON public.coin_wallets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update wallets" ON public.coin_wallets
  FOR UPDATE USING (true);

-- Create RLS policies for coin transactions
CREATE POLICY "Users can view their own transactions" ON public.coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.coin_transactions
  FOR SELECT USING (is_admin());

CREATE POLICY "System can create transactions" ON public.coin_transactions
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for chapter prices
CREATE POLICY "Anyone can view chapter prices" ON public.chapter_prices
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage chapter prices" ON public.chapter_prices
  FOR ALL USING (is_admin());

-- Create RLS policies for chapter access
CREATE POLICY "Users can view their own chapter access" ON public.chapter_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chapter access" ON public.chapter_access
  FOR SELECT USING (is_admin());

CREATE POLICY "System can grant chapter access" ON public.chapter_access
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for contests
CREATE POLICY "Anyone can view active contests" ON public.contests
  FOR SELECT USING (status IN ('active', 'ended'));

CREATE POLICY "Admins can manage contests" ON public.contests
  FOR ALL USING (is_admin());

-- Create RLS policies for contest entries
CREATE POLICY "Users can view their own entries" ON public.contest_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" ON public.contest_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries" ON public.contest_entries
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update entries" ON public.contest_entries
  FOR UPDATE USING (is_admin());

-- Create RLS policies for user roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (is_admin());

-- Create database functions for coin operations
CREATE OR REPLACE FUNCTION public.get_user_coin_balance(user_id_param UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(balance, 0)
  FROM public.coin_wallets
  WHERE user_id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION public.create_coin_wallet(user_id_param UUID)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  wallet_id UUID;
BEGIN
  INSERT INTO public.coin_wallets (user_id, balance)
  VALUES (user_id_param, 0)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO wallet_id;
  
  RETURN wallet_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_coin_transaction(
  user_id_param UUID,
  amount_param INTEGER,
  type_param TEXT,
  context_param TEXT,
  reference_id_param UUID DEFAULT NULL,
  description_param TEXT DEFAULT NULL,
  admin_user_id_param UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_balance INTEGER;
  wallet_exists BOOLEAN;
BEGIN
  -- Check if wallet exists, create if not
  SELECT EXISTS(SELECT 1 FROM public.coin_wallets WHERE user_id = user_id_param) INTO wallet_exists;
  
  IF NOT wallet_exists THEN
    PERFORM public.create_coin_wallet(user_id_param);
  END IF;
  
  -- Get current balance
  SELECT balance INTO current_balance
  FROM public.coin_wallets
  WHERE user_id = user_id_param;
  
  -- Check if user has enough coins for spending
  IF type_param = 'spend' AND current_balance < ABS(amount_param) THEN
    RETURN false;
  END IF;
  
  -- Create transaction record
  INSERT INTO public.coin_transactions (
    user_id, amount, type, context, reference_id, description, admin_user_id
  )
  VALUES (
    user_id_param, amount_param, type_param, context_param, 
    reference_id_param, description_param, admin_user_id_param
  );
  
  -- Update wallet balance and lifetime stats
  IF type_param = 'earn' OR type_param = 'admin_adjustment' AND amount_param > 0 THEN
    UPDATE public.coin_wallets
    SET 
      balance = balance + amount_param,
      lifetime_earned = lifetime_earned + amount_param,
      updated_at = now()
    WHERE user_id = user_id_param;
  ELSIF type_param = 'spend' OR type_param = 'admin_adjustment' AND amount_param < 0 THEN
    UPDATE public.coin_wallets
    SET 
      balance = balance - ABS(amount_param),
      lifetime_spent = lifetime_spent + ABS(amount_param),
      updated_at = now()
    WHERE user_id = user_id_param;
  END IF;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_chapter_with_coins(
  chapter_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  coin_cost INTEGER;
  user_balance INTEGER;
  access_exists BOOLEAN;
BEGIN
  -- Check if user already has access
  SELECT EXISTS(
    SELECT 1 FROM public.chapter_access 
    WHERE user_id = user_id_param AND chapter_id = chapter_id_param
  ) INTO access_exists;
  
  IF access_exists THEN
    RETURN true;
  END IF;
  
  -- Get chapter cost
  SELECT COALESCE(coin_cost, 0) INTO coin_cost
  FROM public.chapter_prices
  WHERE chapter_id = chapter_id_param;
  
  -- If chapter is free, grant access
  IF coin_cost = 0 THEN
    INSERT INTO public.chapter_access (user_id, chapter_id, access_type)
    VALUES (user_id_param, chapter_id_param, 'free');
    RETURN true;
  END IF;
  
  -- Check user balance
  SELECT COALESCE(balance, 0) INTO user_balance
  FROM public.coin_wallets
  WHERE user_id = user_id_param;
  
  IF user_balance < coin_cost THEN
    RETURN false;
  END IF;
  
  -- Process coin transaction
  IF public.process_coin_transaction(
    user_id_param, coin_cost, 'spend', 'chapter_unlock', chapter_id_param,
    'Unlocked chapter with coins'
  ) THEN
    -- Grant chapter access
    INSERT INTO public.chapter_access (user_id, chapter_id, access_type, coins_spent)
    VALUES (user_id_param, chapter_id_param, 'coins', coin_cost);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_chapter_access(
  chapter_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  has_access BOOLEAN := false;
  is_premium BOOLEAN := false;
  is_chapter_locked BOOLEAN;
  chapter_price INTEGER;
BEGIN
  -- Check if user is admin
  IF is_admin(user_id_param) THEN
    RETURN true;
  END IF;
  
  -- Check if user has direct access
  SELECT EXISTS(
    SELECT 1 FROM public.chapter_access 
    WHERE user_id = user_id_param AND chapter_id = chapter_id_param
  ) INTO has_access;
  
  IF has_access THEN
    RETURN true;
  END IF;
  
  -- Check if chapter is locked
  SELECT is_locked INTO is_chapter_locked
  FROM public.chapters
  WHERE id = chapter_id_param;
  
  -- If chapter is not locked in main table, allow access
  IF NOT is_chapter_locked THEN
    -- Check if there's a coin cost
    SELECT COALESCE(coin_cost, 0) INTO chapter_price
    FROM public.chapter_prices
    WHERE chapter_id = chapter_id_param;
    
    -- If no coin cost, grant free access
    IF chapter_price = 0 THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Check if user is premium and chapter allows premium access
  SELECT is_premium_user(user_id_param) INTO is_premium;
  
  IF is_premium THEN
    SELECT NOT COALESCE(premium_only, false) INTO has_access
    FROM public.chapter_prices
    WHERE chapter_id = chapter_id_param;
    
    IF has_access IS NULL THEN
      has_access := true; -- No pricing record means free for premium
    END IF;
  END IF;
  
  RETURN COALESCE(has_access, false);
END;
$$;

-- Create trigger to auto-create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create coin wallet
  INSERT INTO public.coin_wallets (user_id, balance)
  VALUES (NEW.user_id, 100); -- Give new users 100 starting coins
  
  -- Create default role
  INSERT INTO public.user_roles (user_id, role, source)
  VALUES (NEW.user_id, 'free', 'signup');
  
  -- Give welcome bonus
  PERFORM public.process_coin_transaction(
    NEW.user_id, 100, 'earn', 'welcome_bonus', NULL, 'Welcome bonus for new user'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profiles
CREATE TRIGGER create_user_wallet_and_role
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_wallet();

-- Create indexes for performance
CREATE INDEX idx_coin_wallets_user_id ON public.coin_wallets(user_id);
CREATE INDEX idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_type ON public.coin_transactions(type);
CREATE INDEX idx_chapter_access_user_chapter ON public.chapter_access(user_id, chapter_id);
CREATE INDEX idx_contest_entries_contest_user ON public.contest_entries(contest_id, user_id);
CREATE INDEX idx_user_roles_user_role ON public.user_roles(user_id, role, is_active);

-- Add updated_at triggers
CREATE TRIGGER update_coin_wallets_updated_at
BEFORE UPDATE ON public.coin_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_prices_updated_at
BEFORE UPDATE ON public.chapter_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contests_updated_at
BEFORE UPDATE ON public.contests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();