-- Migration: Add paid column to entries table
-- Run this on existing databases to add payment tracking

ALTER TABLE entries ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT FALSE;
