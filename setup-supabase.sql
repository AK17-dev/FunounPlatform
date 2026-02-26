-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to products
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert products
CREATE POLICY "Allow authenticated insert to products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update products
CREATE POLICY "Allow authenticated update to products" ON public.products
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete products
CREATE POLICY "Allow authenticated delete to products" ON public.products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.products;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create custom orders table
CREATE TABLE IF NOT EXISTS public.custom_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    product_type TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    colors TEXT,
    custom_text TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ready')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for custom orders
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Policies for custom orders
DROP POLICY IF EXISTS "Allow public read access to custom orders" ON public.custom_orders;
CREATE POLICY "Allow public read access to custom orders" ON public.custom_orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to custom orders" ON public.custom_orders;
CREATE POLICY "Allow public insert to custom orders" ON public.custom_orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to custom orders" ON public.custom_orders;
CREATE POLICY "Allow public update to custom orders" ON public.custom_orders
    FOR UPDATE USING (true);

-- Insert some sample products for demonstration
INSERT INTO public.products (name, price, description, image_url) VALUES
('Handmade Ceramic Mug', 28.99, 'Beautiful handcrafted ceramic mug with unique glaze patterns. Perfect for your morning coffee or tea. Each piece is unique and made with love by local artisans.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=800&fit=crop'),
('Artisan Leather Handbag', 149.99, 'Genuine leather handbag crafted using traditional techniques. Features hand-stitched details and antique brass hardware. Spacious interior perfect for daily use.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop'),
('Hand-thrown Clay Bowl', 45.00, 'Rustic clay bowl perfect for serving or as a decorative piece. Each bowl is unique with natural variations in the clay and glaze. Food-safe and dishwasher friendly.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop'),
('Woven Basket Set', 85.50, 'Set of three woven baskets in graduated sizes. Made from sustainable materials using traditional weaving techniques. Perfect for storage or home decoration.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop'),
('Ceramic Tea Set', 120.00, 'Complete tea set including teapot and four cups. Hand-painted with delicate floral patterns. Perfect for afternoon tea or special occasions.', 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=800&h=800&fit=crop'),
('Handwoven Scarf', 65.00, 'Soft merino wool scarf in earth tones. Hand-woven on traditional looms with intricate patterns. Lightweight yet warm, perfect for any season.', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&h=800&fit=crop');
