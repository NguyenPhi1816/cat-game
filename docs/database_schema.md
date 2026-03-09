# Database Schema -- AI Cat Life

Database: PostgreSQL

------------------------------------------------------------------------

# 1. Users

users

id (uuid) email password_hash created_at last_login

------------------------------------------------------------------------

# 2. Player Profile

player_profiles

id user_id player_name level experience created_at

------------------------------------------------------------------------

# 3. Cats

cats

id player_id name personality_type intelligence kindness energy loyalty
created_at

------------------------------------------------------------------------

# 4. Cat Status

cat_status

id cat_id hunger happiness stress last_action_time

------------------------------------------------------------------------

# 5. Economy

wallets

id player_id money premium_currency

------------------------------------------------------------------------

# 6. Jobs

jobs

id name reward_money duration

------------------------------------------------------------------------

# 7. Cat Jobs

cat_jobs

id cat_id job_id start_time end_time status

------------------------------------------------------------------------

# 8. Events

events

id player_id event_type description created_at

------------------------------------------------------------------------

# 9. Items

items

id name type price

------------------------------------------------------------------------

# 10. Player Inventory

inventory

id player_id item_id quantity
