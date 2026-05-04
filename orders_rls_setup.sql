-- ==========================================
-- 8. ORDERS RLS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Read: Users can see their own orders. Admins can see all.
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Insert: Users can place orders for themselves.
CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Update: Only admins can process/update an order status.
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
TO authenticated USING (public.is_admin());

-- ==========================================
-- 9. ORDER ITEMS RLS POLICIES
-- ==========================================
DROP POLICY IF EXISTS "View order items" ON public.order_items;
DROP POLICY IF EXISTS "Insert order items" ON public.order_items;

-- Read: Viewable if you have access to the parent order
CREATE POLICY "View order items"
ON public.order_items FOR SELECT
TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND (
      o.user_id = auth.uid() OR public.is_admin()
    )
  )
);

-- Insert: Insertable if you are creating the parent order
CREATE POLICY "Insert order items"
ON public.order_items FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND (
      o.user_id = auth.uid() OR public.is_admin()
    )
  )
);
