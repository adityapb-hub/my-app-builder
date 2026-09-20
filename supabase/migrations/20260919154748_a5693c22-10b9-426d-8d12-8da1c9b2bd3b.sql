-- ============ ENUMS ============
create type public.app_role as enum ('seeker', 'provider', 'admin');

-- ============ SHARED TRIGGER HELPERS ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_url text,
  city text not null default 'Tumakuru',
  area text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, 'neighbour'), '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_read_own ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY roles_insert_own ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- ============ SERVICE PROVIDERS (public directory) ============
create table public.service_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  category text not null,
  bio text,
  skills text[] not null default '{}',
  experience_years integer not null default 0,
  hourly_rate numeric(10,2) not null default 0,
  area text,
  distance_km numeric(5,2) not null default 0,
  verified boolean not null default false,
  id_document_url text,
  certificate_url text,
  rating numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  jobs_completed integer not null default 0,
  available_now boolean not null default true,
  availability text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_providers TO authenticated;
GRANT ALL ON public.service_providers TO service_role;

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY providers_read_all ON public.service_providers FOR SELECT TO authenticated
  USING (true);
CREATE POLICY providers_insert_own ON public.service_providers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY providers_update_own ON public.service_providers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY providers_delete_own ON public.service_providers FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX providers_category_idx ON public.service_providers (category, available_now);

CREATE TRIGGER providers_updated_at BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SERVICE REQUESTS / BOOKINGS ============
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid references public.service_providers(id) on delete set null,
  category text not null,
  title text not null,
  description text,
  photo_urls text[] not null default '{}',
  preferred_date date,
  preferred_time text,
  area text,
  address text,
  quoted_price numeric(10,2),
  final_price numeric(10,2),
  status text not null default 'requested'
    check (status in ('searching','requested','accepted','on_the_way','completed','cancelled','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY requests_read_participants ON public.service_requests FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id
    or exists (
      select 1 from public.service_providers p
      where p.user_id = auth.uid() and p.id = service_requests.provider_id
    )
    or (
      service_requests.provider_id is null
      and service_requests.status = 'searching'
      and exists (
        select 1 from public.service_providers p
        where p.user_id = auth.uid() and p.category = service_requests.category
      )
    )
  );

CREATE POLICY requests_insert_own ON public.service_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY requests_update_participants ON public.service_requests FOR UPDATE TO authenticated
  USING (
    auth.uid() = customer_id
    or exists (
      select 1 from public.service_providers p
      where p.user_id = auth.uid()
        and (p.id = service_requests.provider_id or p.category = service_requests.category)
    )
  )
  WITH CHECK (
    auth.uid() = customer_id
    or exists (
      select 1 from public.service_providers p
      where p.user_id = auth.uid()
        and (p.id = service_requests.provider_id or p.category = service_requests.category)
    )
  );

CREATE INDEX requests_customer_idx ON public.service_requests (customer_id, created_at desc);
CREATE INDEX requests_provider_idx ON public.service_requests (provider_id, status);

CREATE TRIGGER requests_updated_at BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  provider_id uuid not null references public.service_providers(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_read_all ON public.reviews FOR SELECT TO authenticated
  USING (true);
CREATE POLICY reviews_insert_own ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    and exists (
      select 1 from public.service_requests r
      where r.id = reviews.request_id
        and r.customer_id = auth.uid()
        and r.status = 'completed'
    )
  );

-- ============ COMMUNITY ============
create table public.community_tasks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) on delete set null,
  creator_name text not null default 'HomeEase',
  title text not null,
  description text,
  category text not null default 'maintenance',
  apartment_name text,
  location text,
  event_date date,
  cost_per_household numeric(10,2) not null default 0,
  seats_needed integer not null default 10,
  joined_count integer not null default 0,
  votes integer not null default 0,
  status text not null default 'open'
    check (status in ('open','voting','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_tasks TO authenticated;
GRANT ALL ON public.community_tasks TO service_role;

ALTER TABLE public.community_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_read_all ON public.community_tasks FOR SELECT TO authenticated
  USING (true);
CREATE POLICY community_insert_own ON public.community_tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY community_update_creator ON public.community_tasks FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE TRIGGER community_updated_at BEFORE UPDATE ON public.community_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

create table public.community_participants (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.community_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (task_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_participants TO authenticated;
GRANT ALL ON public.community_participants TO service_role;

ALTER TABLE public.community_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY participants_read_all ON public.community_participants FOR SELECT TO authenticated
  USING (true);
CREATE POLICY participants_insert_own ON public.community_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY participants_delete_own ON public.community_participants FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_read_participants ON public.messages FOR SELECT TO authenticated
  USING (
    exists (
      select 1 from public.service_requests r
      where r.id = messages.request_id
        and (
          r.customer_id = auth.uid()
          or exists (
            select 1 from public.service_providers p
            where p.user_id = auth.uid() and p.id = r.provider_id
          )
        )
    )
  );

CREATE POLICY messages_insert_participants ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    and exists (
      select 1 from public.service_requests r
      where r.id = messages.request_id
        and (
          r.customer_id = auth.uid()
          or exists (
            select 1 from public.service_providers p
            where p.user_id = auth.uid() and p.id = r.provider_id
          )
        )
    )
  );

CREATE INDEX messages_request_idx ON public.messages (request_id, created_at);

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_tasks;

-- ============ SEED: PROVIDER DIRECTORY ============
insert into public.service_providers
  (display_name, category, bio, skills, experience_years, hourly_rate, area, distance_km, verified, rating, rating_count, jobs_completed, available_now, availability)
values
  ('Rajesh Kumar','plumbing','Fifteen years fixing leaks in Salt Lake flats. Arrives with his own pipe-cutting kit.',array['Leak repair','Tap and valve','Drain cleaning','Geyser fitting'],15,300,'Salt Lake Sector 2',2.5,true,4.8,212,340,true,'Mon-Sat, 8am-8pm'),
  ('Anita Sharma','plumbing','Bathroom and kitchen specialist. No job too small - a dripping tap counts.',array['Tap and valve','Toilet repair','Water tank','Pipe replacement'],9,260,'Kestopur',3.4,true,4.6,98,155,true,'Mon-Sun, 9am-7pm'),
  ('Imran Ali','electrical','Licensed wireman. Fans, inverters, MCB tripping and full rewiring.',array['Wiring','Inverter setup','MCB and switchboard','Fan installation'],12,350,'Bidhannagar',1.8,true,4.9,176,290,true,'Mon-Sat, 9am-9pm'),
  ('Deepa Nair','electrical','Lighting, smart switches and appliance point work. Same-day slots.',array['Lighting','Smart switches','Socket repair','Earth testing'],6,320,'New Town',5.2,true,4.7,64,88,false,'Next slot: tomorrow 11am'),
  ('Suresh Yadav','cleaning','Deep-clean crew of three. Kitchen, bathroom and full-flat cleaning.',array['Deep clean','Bathroom scrub','Kitchen grease','Sofa shampoo'],8,400,'Barasat Road',4.1,true,4.5,143,410,true,'Mon-Sat, 7am-6pm'),
  ('Lakshmi Das','cleaning','Weekly housekeeping and post-construction dust clearing.',array['Weekly clean','Post-construction','Window washing','Laundry'],5,250,'Halishahar',2.2,true,4.4,77,220,true,'Mon-Fri, 8am-5pm'),
  ('Bikash Ghosh','gardening','Terrace gardens, lawn cutting and seasonal replanting.',array['Lawn mowing','Terrace garden','Pruning','Plant health'],11,280,'Jessore Road',6.3,true,4.8,59,130,true,'Mon-Sat, 7am-5pm'),
  ('Nabanita Roy','gardening','Indoor plant care and society compound landscaping.',array['Indoor plants','Composting','Irrigation','Seasonal flowers'],4,220,'Salt Lake Sector 5',3.0,false,4.3,24,41,true,'Tue-Sun, 8am-4pm'),
  ('Arjun Bose','tutor','Maths and physics, classes 8 to 12. Weekend batches at your home.',array['Maths','Physics','JEE foundation','Board prep'],7,450,'Kestopur',3.6,true,4.9,88,120,true,'Mon, Wed, Sat, Sun evenings'),
  ('Priya Chatterjee','tutor','English and Bengali for primary years. Patient, story-based method.',array['English','Bengali','Reading','Spoken practice'],10,400,'Mukundapur',5.8,true,4.8,112,190,false,'Next slot: Monday 4pm'),
  ('Faizan Ahmed','appliance','Washing machines, fridges and ACs. Spare parts carried in the bag.',array['Washing machine','Refrigerator','AC service','Microwave'],13,500,'Beliaghata',4.7,true,4.7,205,365,true,'Mon-Sun, 9am-8pm'),
  ('Subhash Panda','appliance','Chimney, hob and water purifier servicing across south Tumakuru.',array['Chimney','Gas hob','Water purifier','Geyser'],9,420,'Gariahat',6.9,true,4.5,71,148,true,'Mon-Sat, 10am-7pm'),
  ('Meera Iyer','elder-care','Trained caregiver: companionship, medication timing and mobility help.',array['Companionship','Medication','Mobility support','Hospital escort'],14,600,'Salt Lake Sector 1',1.2,true,5.0,134,260,true,'24x7 on request'),
  ('Tumakuru Care Team','elder-care','Two-nurse team for post-discharge recovery at home.',array['Post-discharge','Wound dressing','Physio assist','Night care'],12,750,'Bhadureswar',5.1,true,4.6,52,96,true,'Rotating shifts'),
  ('Tufan Sarkar','painting','Interior repainting and putty work. Free colour trial patches.',array['Interior paint','Putty','Waterproofing','Texture'],16,380,'Dum Dum',7.4,true,4.7,91,178,true,'Mon-Sat, 8am-6pm'),
  ('GreenVan Movers','moving','Two helpers, one van. Furniture packing and society shifting.',array['Packing','Furniture move','Van rental','Unloading'],6,900,'Tala',8.2,true,4.4,48,112,true,'Mon-Sat, 6am-8pm');

-- ============ SEED: COMMUNITY TASKS ============
insert into public.community_tasks
  (creator_name, title, description, category, apartment_name, location, event_date, cost_per_household, seats_needed, joined_count, votes, status)
values
  ('Mrs. Sen (Committee)','Apartment Cleaning Drive','Stairwells, lobby and both lift cabins. Crew of four paid from the society fund.','cleaning','Greenlane Enclave','Salt Lake Sector 4','2026-10-03',120,24,18,31,'confirmed'),
  ('Mr. Bhattacharya','Garbage Collection Request','Piling up near Gate 2. Requesting a weekly pickup contract for wet and dry waste.','maintenance','Greenlane Enclave','Salt Lake Sector 4','2026-09-30',40,24,7,22,'voting'),
  ('Youth Group','Tree Plantation Event','Thirty saplings along the compound path. Gloves and a watering rota provided.','environment','Sunrise Apartments','New Town Action Area 2','2026-10-12',60,40,12,45,'open'),
  ('Committee','Water Tank Maintenance','Rooftop tank descaling and chlorination for both wings. Bring a bucket for flushing.','maintenance','Sunrise Apartments','New Town Action Area 2','2026-10-05',90,40,31,28,'confirmed'),
  ('Festival Sub-Committee','Durga Puja Pandal Help','Volunteers needed for pandal build, lights and the evening aarti crowd plan.','community','Greenlane Enclave','Salt Lake Sector 4','2026-10-20',200,60,12,67,'voting'),
  ('Committee','Common Area Deep Clean','Lobby tiles, balcony rails and the basement drainage flush.','cleaning','Lake View Residency','Beliaghata','2026-10-08',150,30,9,14,'open');