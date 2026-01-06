INSERT INTO public.user_roles (user_id, role)
VALUES ('3a69717a-de0b-4d05-a3e6-711f3f36f478', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;