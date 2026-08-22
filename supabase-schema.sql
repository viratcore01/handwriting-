-- Supabase SQL Schema for Adaptive Handwriting Coach

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  teacher_name text
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  classroom_id uuid REFERENCES classrooms(id)
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  image_url text,
  alignment int,
  spacing int,
  curves int,
  explanation_alignment text,
  explanation_spacing text,
  explanation_curves text,
  teacher_confirmed boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Seed demo data
INSERT INTO classrooms (id, name, teacher_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Class 1', 'Ms. Johnson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, name, classroom_id) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Aarav K.', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000012', 'Sara M.', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000013', 'Diya P.', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000014', 'Kabir S.', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for scans
INSERT INTO storage.buckets (id, name, public) VALUES ('scans', 'scans', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for scans bucket
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scans');
CREATE POLICY "Public Reads" ON storage.objects FOR SELECT USING (bucket_id = 'scans');

-- Create storage bucket for worksheets
INSERT INTO storage.buckets (id, name, public) VALUES ('worksheets', 'worksheets', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Worksheet Reads" ON storage.objects FOR SELECT USING (bucket_id = 'worksheets');
