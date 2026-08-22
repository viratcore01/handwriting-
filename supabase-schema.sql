-- Supabase SQL Schema for Adaptive Handwriting Coach

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id text PRIMARY KEY DEFAULT 'class_' || substr(md5(random()::text), 1, 8),
  name text NOT NULL,
  teacher_name text
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id text PRIMARY KEY DEFAULT 'student_' || substr(md5(random()::text), 1, 8),
  name text NOT NULL,
  classroom_id text REFERENCES classrooms(id)
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id text PRIMARY KEY DEFAULT 'scan_' || substr(md5(random()::text), 1, 12),
  student_id text REFERENCES students(id),
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
  ('c1', 'Demo Class 1', 'Ms. Johnson')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, name, classroom_id) VALUES
  ('s0', 'Aarav K.', 'c1'),
  ('s1', 'Sara M.', 'c1'),
  ('s2', 'Diya P.', 'c1'),
  ('s3', 'Kabir S.', 'c1')
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for MVP backend access
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE scans DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for scans
INSERT INTO storage.buckets (id, name, public) VALUES ('scans', 'scans', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for scans bucket
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scans');
CREATE POLICY "Public Reads" ON storage.objects FOR SELECT USING (bucket_id = 'scans');

-- Create storage bucket for worksheets
INSERT INTO storage.buckets (id, name, public) VALUES ('worksheets', 'worksheets', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Worksheet Reads" ON storage.objects FOR SELECT USING (bucket_id = 'worksheets');
