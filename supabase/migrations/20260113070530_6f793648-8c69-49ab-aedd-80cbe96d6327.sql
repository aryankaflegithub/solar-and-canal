-- Add status column to profiles for approval workflow
ALTER TABLE public.profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

-- Update existing admin user to approved
UPDATE public.profiles SET status = 'approved' WHERE user_id = 'a028b247-a5ec-4d04-b1e9-e88f5d856aee';

-- Create index for faster status queries
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update RLS policies for profiles to allow admins to view and update all profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));