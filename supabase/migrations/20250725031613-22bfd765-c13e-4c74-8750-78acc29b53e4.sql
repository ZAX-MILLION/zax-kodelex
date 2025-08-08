-- Delete existing test accounts so they can be recreated with auto-confirm
DELETE FROM auth.users WHERE email IN ('admin@manga.com', 'member@manga.com');