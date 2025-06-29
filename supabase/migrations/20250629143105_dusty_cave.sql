/*
  # Create reflections table

  1. New Tables
    - `reflections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `week_start_date` (date, not null)
      - `encrypted_content` (text, not null)
      - `is_completed` (boolean, default false)
      - `is_deleted` (boolean, default false)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `locked_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on `reflections` table
    - Add policy for users to view their own reflections
    - Add policy for users to insert their own reflections
    - Add policy for users to update their own reflections
    - Add policy for users to delete their own reflections

  3. Constraints
    - Foreign key constraint to auth.users table
    - Unique constraint on user_id and week_start_date to prevent duplicate reflections for the same week
*/

CREATE TABLE IF NOT EXISTS public.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  encrypted_content text NOT NULL,
  is_completed boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  locked_at timestamptz NULL,
  CONSTRAINT unique_reflection_per_week UNIQUE (user_id, week_start_date)
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections"
  ON public.reflections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections"
  ON public.reflections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
  ON public.reflections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
  ON public.reflections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_week_start_date ON public.reflections(week_start_date);
CREATE INDEX IF NOT EXISTS idx_reflections_user_week ON public.reflections(user_id, week_start_date);