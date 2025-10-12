-- Migration script to update database schema for new features
-- Run this script on your tennisclub database

USE tennisclub;

-- Add new columns to challenge table (check if exists first)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE table_schema = 'tennisclub'
                   AND table_name = 'challenge'
                   AND column_name = 'MatchDateTime');

SET @sql = IF(@col_exists = 0,
              'ALTER TABLE challenge ADD COLUMN MatchDateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT "Scheduled match time when challenge is created"',
              'SELECT "Column MatchDateTime already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add Status column to tmatch table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE table_schema = 'tennisclub'
                   AND table_name = 'tmatch'
                   AND column_name = 'Status');

SET @sql = IF(@col_exists = 0,
              'ALTER TABLE tmatch ADD COLUMN Status ENUM("pending", "finished", "graded") NOT NULL DEFAULT "pending" COMMENT "pending: not started, finished: awaiting grading, graded: completed"',
              'SELECT "Column Status already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add Player1MEID column to tmatch table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE table_schema = 'tennisclub'
                   AND table_name = 'tmatch'
                   AND column_name = 'Player1MEID');

SET @sql = IF(@col_exists = 0,
              'ALTER TABLE tmatch ADD COLUMN Player1MEID INT NOT NULL DEFAULT 0 COMMENT "First player in the match"',
              'SELECT "Column Player1MEID already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add Player2MEID column to tmatch table
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE table_schema = 'tennisclub'
                   AND table_name = 'tmatch'
                   AND column_name = 'Player2MEID');

SET @sql = IF(@col_exists = 0,
              'ALTER TABLE tmatch ADD COLUMN Player2MEID INT NOT NULL DEFAULT 0 COMMENT "Second player in the match"',
              'SELECT "Column Player2MEID already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make score fields nullable (for pending matches)
ALTER TABLE tmatch
MODIFY COLUMN MEID1Set1Score INT NULL,
MODIFY COLUMN MEID2Set1Score INT NULL,
MODIFY COLUMN WinnerMEID INT NULL,
MODIFY COLUMN LoserMEID INT NULL;

-- Update existing matches to have Player1MEID and Player2MEID
-- This assumes existing matches have WinnerMEID and LoserMEID populated
UPDATE tmatch t
INNER JOIN challenge c ON t.CID = c.CID
SET
  t.Player1MEID = c.ChallengerMEID,
  t.Player2MEID = c.ChallengedMEID,
  t.Status = 'graded'
WHERE t.Player1MEID = 0 OR t.Player2MEID = 0;

-- Set Status to 'graded' for all existing matches with scores
UPDATE tmatch
SET Status = 'graded'
WHERE MEID1Set1Score IS NOT NULL
  AND MEID2Set1Score IS NOT NULL
  AND Status = 'pending';

SELECT 'Migration completed successfully!' AS message;
