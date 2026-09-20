-- Admin oversight policies
CREATE POLICY "admins_read_profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_read_requests" ON public.service_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_update_providers" ON public.service_providers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_update_tasks" ON public.community_tasks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tumakuru sample directory
INSERT INTO public.service_providers
  (display_name, category, bio, skills, experience_years, hourly_rate, area, verified, rating, rating_count, jobs_completed, available_now, availability)
VALUES
  ('Manjunath H R','electrical','Licensed electrician handling wiring, inverters and fan work around SIT area.',array['Wiring','Inverter setup','Fan fitting','Kannada','English'],12,320,'SIT Area, Tumakuru',true,4.8,126,318,true,'Mon–Sat, 8am–8pm'),
  ('Ravi Kumar S','electrical','Emergency call-outs for short circuits and MCB trips in Ashok Nagar.',array['Short circuit repair','MCB','Lighting','Kannada'],8,300,'Ashok Nagar, Tumakuru',true,4.6,84,201,true,'All days, 7am–10pm'),
  ('Shivakumar B N','plumbing','Taps, tanks and bathroom leaks. Carries common spares.',array['Leak repair','Tap fitting','Sump cleaning','Kannada','Hindi'],15,280,'SS Puram, Tumakuru',true,4.9,152,410,true,'Mon–Sun, 7am–9pm'),
  ('Nagaraj M','plumbing','Pipeline and motor work for homes near Kyathsandra.',array['Pipeline','Motor repair','Overhead tank'],6,250,'Kyathsandra, Tumakuru',true,4.4,47,96,true,'Mon–Sat, 9am–7pm'),
  ('Chandrashekar T','carpenter','Custom wardrobes, door repairs and modular fittings.',array['Door repair','Wardrobe','Modular kitchen','Kannada'],18,350,'Gandhi Nagar, Tumakuru',true,4.7,93,240,false,'Mon–Sat, 9am–6pm'),
  ('Prakash Gowda','carpenter','Furniture polishing and quick fixes across Batawadi.',array['Polishing','Furniture repair','Bed assembly'],7,300,'Batawadi, Tumakuru',true,4.3,38,77,true,'All days, 8am–8pm'),
  ('Lakshmi Devi','cleaning','Deep cleaning teams for flats and independent houses.',array['Deep clean','Bathroom clean','Kitchen clean','Kannada'],9,260,'Ashok Nagar, Tumakuru',true,4.8,201,520,true,'Mon–Sun, 7am–6pm'),
  ('Sunitha R','cleaning','Weekly housekeeping and post-event cleanup near Gubbi Gate.',array['Housekeeping','Sofa shampoo','Post-event clean'],5,240,'Gubbi Gate, Tumakuru',true,4.5,66,140,true,'Mon–Sat, 8am–5pm'),
  ('Imran Pasha','ac-repair','AC servicing, gas filling and installation. Same-day slots.',array['AC service','Gas refill','Installation','Urdu','Kannada'],11,450,'Ring Road, Tumakuru',true,4.9,174,389,true,'All days, 8am–9pm'),
  ('Vinay Kumar','ac-repair','Split and window AC repairs across Tumakuru city.',array['Split AC','Window AC','Cooling repair'],6,400,'SS Puram, Tumakuru',true,4.4,52,110,false,'Mon–Sat, 9am–8pm'),
  ('Harish N','appliance','Washing machine, fridge and chimney repairs.',array['Washing machine','Refrigerator','Chimney','Microwave'],10,420,'SIT Area, Tumakuru',true,4.6,88,232,true,'Mon–Sun, 9am–8pm'),
  ('Girish Babu','painting','Interior painting, putty and waterproofing with own crew.',array['Interior painting','Putty','Waterproofing'],14,380,'Kyathsandra, Tumakuru',true,4.7,71,163,true,'Mon–Sat, 8am–6pm'),
  ('Ananya Shetty','tutor','Maths and science tuition for classes 6–10, CBSE and state board.',array['Maths','Science','CBSE','State board','English'],8,400,'Gandhi Nagar, Tumakuru',true,4.9,64,150,true,'Weekdays, 4pm–9pm'),
  ('Rakesh Jain','tutor','Physics and chemistry coaching for PUC students near SIT.',array['Physics','Chemistry','PUC','NEET basics'],12,500,'SIT Area, Tumakuru',true,4.8,58,132,true,'Weekdays, 5pm–9pm'),
  ('Mallesh K','gardening','Lawn upkeep, terrace gardens and seasonal planting.',array['Lawn care','Terrace garden','Planting'],9,240,'Batawadi, Tumakuru',true,4.5,43,98,true,'Mon–Sat, 6am–5pm'),
  ('Kavitha S','elder-care','Trained attendant for medication, mobility and companionship.',array['Medication support','Mobility','Companionship','Kannada'],7,520,'Gubbi Gate, Tumakuru',true,4.9,39,84,true,'Day and night shifts'),
  ('Suresh Naik','moving','House shifting with packing crew and tempo.',array['Packing','Loading','Tempo','Local shifting'],10,900,'Ring Road, Tumakuru',true,4.4,35,120,true,'All days, 7am–8pm');