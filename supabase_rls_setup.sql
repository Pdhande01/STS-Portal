-- ==============================================================================
-- STS PORTAL - ROW LEVEL SECURITY (RLS) & AUTHORITIES SETUP
-- Copy and run this script in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. SECURE ROLE HELPER FUNCTIONS
-- ==========================================
-- These functions run with SECURITY DEFINER to bypass RLS recursion
-- and securely check the requesting user's actual role.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_technician()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'technician'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. ROLE ESCALATION PREVENTION (TRIGGER)
-- ==========================================
-- Prevents a regular user from modifying the frontend request payload 
-- to instantly become an 'admin' or 'technician' on sign up.

CREATE OR REPLACE FUNCTION public.check_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the person making the change is NOT an established admin:
  IF NOT public.is_admin() THEN
    -- 1. All new users default strictly to 'user' role
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'user';
    -- 2. Existing users cannot elevate their own role
    ELSIF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_role_security ON public.profiles;
CREATE TRIGGER enforce_role_security
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_role_escalation();

-- ==========================================
-- 4. PROFILES RLS POLICIES
-- ==========================================
-- Clear existing policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile, Admins update any" ON public.profiles;

-- Read: Anyone signed in can read basic profile info (required for names in UI joins)
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT 
TO authenticated USING (true);

-- Update: Users update their own info. Admins update anyone (e.g., to promote tech)
CREATE POLICY "Users update own profile, Admins update any" 
ON public.profiles FOR UPDATE 
TO authenticated USING (auth.uid() = id OR public.is_admin()) 
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Insert: Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = id);

-- Delete: Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles FOR DELETE 
TO authenticated USING (public.is_admin());

-- ==========================================
-- 5. SERVICE REQUESTS RLS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "View service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Insert service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Update service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Delete service requests" ON public.service_requests;

-- Read: Users see their own. Techs see their assigned ones. Admins see all.
CREATE POLICY "View service requests"
ON public.service_requests FOR SELECT
TO authenticated USING (
  auth.uid() = user_id OR 
  auth.uid() = technician_id OR 
  public.is_admin()
);

-- Insert: Users creates for themselves. Admins can create for anyone.
CREATE POLICY "Insert service requests"
ON public.service_requests FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Update: Owners, assigned Techs, and Admins can update
CREATE POLICY "Update service requests"
ON public.service_requests FOR UPDATE
TO authenticated USING (
  auth.uid() = user_id OR 
  auth.uid() = technician_id OR 
  public.is_admin()
);

-- Delete: Only admins
CREATE POLICY "Delete service requests"
ON public.service_requests FOR DELETE
TO authenticated USING (public.is_admin());

-- ==========================================
-- 6. SERVICE UPDATES RLS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "View service updates" ON public.service_updates;
DROP POLICY IF EXISTS "Insert service updates" ON public.service_updates;
DROP POLICY IF EXISTS "Update service updates" ON public.service_updates;
DROP POLICY IF EXISTS "Delete service updates" ON public.service_updates;

-- Read: Viewable if you have access to the parent service request
CREATE POLICY "View service updates"
ON public.service_updates FOR SELECT
TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr 
    WHERE sr.id = service_request_id AND (
      sr.user_id = auth.uid() OR 
      sr.technician_id = auth.uid() OR 
      public.is_admin()
    )
  )
);

-- Insert: Only assigned Technicians and Admins can add notes
CREATE POLICY "Insert service updates"
ON public.service_updates FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_requests sr 
    WHERE sr.id = service_request_id AND (
      sr.technician_id = auth.uid() OR 
      public.is_admin()
    )
  )
);

-- Update/Delete: Only Admins can edit or delete existing timeline notes
CREATE POLICY "Update service updates"
ON public.service_updates FOR UPDATE
TO authenticated USING (public.is_admin());

CREATE POLICY "Delete service updates"
ON public.service_updates FOR DELETE
TO authenticated USING (public.is_admin());

-- ==========================================
-- 7. PRODUCTS RLS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Only admins manipulate products" ON public.products;

-- Read: Public / Authenticated can view products for the shop
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT USING (true); -- Publicly viewable

-- Write: Only admins can manage the store stock
CREATE POLICY "Only admins manipulate products"
ON public.products 
FOR ALL -- covers INSERT, UPDATE, DELETE
TO authenticated USING (public.is_admin());
