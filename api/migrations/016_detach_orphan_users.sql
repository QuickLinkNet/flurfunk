UPDATE users
SET household_id = NULL
WHERE household_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM households
    WHERE households.id = users.household_id
  );
