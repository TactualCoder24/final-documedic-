-- Migration to add role and language columns to public.profiles table
-- Created on 2026-05-18

-- 1. Add language column to profiles if it doesn't already exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- 2. Add role column to profiles if it doesn't already exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'clinic'));

-- 3. Update any existing null roles to default to 'patient'
UPDATE public.profiles 
SET role = 'patient' 
WHERE role IS NULL;
