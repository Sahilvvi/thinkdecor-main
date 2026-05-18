-- =============================================
-- PHASE 2: Database Schema for Viz2D Clone
-- =============================================

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table (required for secure role management)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function for role checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Create plan_type enum
CREATE TYPE public.plan_type AS ENUM ('free', 'pro');

-- 5. Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    plan plan_type NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Project',
    base_image_url TEXT,
    thumbnail_url TEXT,
    canvas_width INTEGER NOT NULL DEFAULT 512,
    canvas_height INTEGER NOT NULL DEFAULT 512,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 7. Create layers table
CREATE TABLE public.layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'New Layer',
    texture_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true,
    opacity REAL NOT NULL DEFAULT 1.0,
    blend_mode TEXT NOT NULL DEFAULT 'normal',
    scale REAL NOT NULL DEFAULT 1.0,
    rotation REAL NOT NULL DEFAULT 0,
    offset_x REAL NOT NULL DEFAULT 0,
    offset_y REAL NOT NULL DEFAULT 0,
    tile BOOLEAN NOT NULL DEFAULT false,
    flip_x BOOLEAN NOT NULL DEFAULT false,
    flip_y BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.layers ENABLE ROW LEVEL SECURITY;

-- 8. Create exports table
CREATE TABLE public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    export_url TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'png',
    resolution TEXT NOT NULL DEFAULT '1x',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- User Roles Policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Projects Policies
CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects FOR DELETE
USING (auth.uid() = user_id);

-- Layers Policies
CREATE POLICY "Users can view their own layers"
ON public.layers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own layers"
ON public.layers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own layers"
ON public.layers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own layers"
ON public.layers FOR DELETE
USING (auth.uid() = user_id);

-- Exports Policies
CREATE POLICY "Users can view their own exports"
ON public.exports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports"
ON public.exports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports"
ON public.exports FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update triggers
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_layers_updated_at
BEFORE UPDATE ON public.layers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('textures', 'textures', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('thumbnails', 'thumbnails', true);

-- Storage policies for uploads bucket
CREATE POLICY "Users can view their own uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for textures bucket
CREATE POLICY "Users can view their own textures"
ON storage.objects FOR SELECT
USING (bucket_id = 'textures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload textures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'textures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their textures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'textures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their textures"
ON storage.objects FOR DELETE
USING (bucket_id = 'textures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for exports bucket
CREATE POLICY "Users can view their exports"
ON storage.objects FOR SELECT
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can create exports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their exports"
ON storage.objects FOR DELETE
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for thumbnails bucket (public read)
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);