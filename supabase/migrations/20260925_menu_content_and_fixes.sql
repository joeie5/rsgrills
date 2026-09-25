-- RSGrills menu content migration
-- Run this once in the Supabase SQL editor (Project: eekcnnnfhyjanmjvvbop)

-- 1. New content columns
alter table products add column if not exists tagline text;
alter table products add column if not exists description text;
alter table products add column if not exists pairs_with text;
alter table products add column if not exists notes text;

-- 2. Remove duplicate "Beans Soup & Ewedu with Assorted Meat" listing
delete from products where id = 'af880cf9-ce7b-44a4-b5cc-062ab6a6b64a';

-- 3. Fix Afang Soup pricing (was 1 Litre / £4.50, out of line with other soups)
update products set size = '4 Litres', price = 90 where id = '01cb4b90-a31f-45bd-bf51-af18f235514c';

-- 4. Small Tray: add missing unit
update products set size = '4 Litres' where id = '4d3a9fca-8c47-40b4-9af7-e105328f6675';

-- 5. Akara: switch litres to a piece count
update products set size = '50 Pieces' where id = '89f514db-46b7-4680-b1a7-d97f98dd98d3';

-- 6. Move Yam & Egg Sauce from Combo Order into Swallow / Combined Meals
update products
set category_id = (select id from categories where name = 'Swallow / Combined Meals')
where id = 'c1e942f2-fe8a-4da2-93ad-8683a55f6a68';

-- 7. Content: tagline / description / pairs_with / notes per item

-- Rice Dishes
update products set
  tagline = 'The party classic, smoky and rich, cooked the proper Naija way.',
  description = 'Long-grain rice slow-cooked in a blend of tomatoes, red peppers, scotch bonnet and onions, finished with our house spices for that deep, smoky "party jollof" flavour. Every grain is well coated and full of flavour. It''s the centrepiece of any celebration, made in a batch big enough for the whole crowd.',
  pairs_with = 'Grilled BBQ Chicken, Peppered Fish, Moi Moi, Gizdodo, R.S Signature Salad',
  notes = '🌶🌶 Medium · Dairy-free · Serves roughly 40–50 guests as a main portion'
where id = '4b2b49ce-ea7a-4075-9103-a5ddf23599bd';

update products set
  tagline = 'Colourful, fragrant, and loaded with goodness.',
  description = 'Nigerian-style fried rice tossed with sweet corn, carrots, green beans, peas and spring onions, seasoned with curry and thyme and cooked in a rich stock. It''s light, aromatic and bright, and it balances perfectly with jollof on any party table.',
  pairs_with = 'Jollof Rice (the classic "mix"), Grilled BBQ Chicken, Assorted Meat, Gizdodo',
  notes = '🌶 Mild · May contain shellfish if prawns or liver are added; please confirm · Serves roughly 40–50 guests'
where id = '9ce513f3-b821-4905-9210-8fc0fbea3ba5';

update products set
  tagline = 'Ghana''s beloved rice and beans, with a proper West African welcome.',
  description = 'Rice and black-eyed beans cooked together with dried sorghum leaves, which give waakye its signature earthy flavour and deep red-brown colour. It''s hearty, comforting and filling, a street-food favourite made for sharing.',
  pairs_with = 'Peppered Fish, Assorted Meat, Grilled BBQ Chicken, Yam & Egg Sauce',
  notes = '🌶 Mild on its own (traditionally served with shito pepper sauce on the side) · Vegan base · Serves roughly 20–25 guests'
where id = 'a037d11e-d38b-41bf-bca9-285b7926a094';

-- Soups
update products set
  tagline = 'An Igbo favourite, rich, earthy and full of heritage.',
  description = 'Ofe Onugbu made the traditional way with washed bitter leaf, cocoyam thickener, palm oil and ogiri, then loaded with assorted meats and stockfish. The bitterness is gently mellowed, leaving a deep, satisfying soup that tastes like home.',
  pairs_with = 'Pounded Yam, Eba, Fufu or Semo',
  notes = '🌶🌶 Medium · Contains fish (stockfish, crayfish) · Serves roughly 8–10 portions'
where id = 'b151eb00-a865-4fe7-a14c-fc06feba0c78';

update products set
  tagline = 'The Yoruba combo: silky ewedu, smooth gbegiri and a rich meaty base.',
  description = 'Ewedu (jute leaf) and gbegiri (smooth bean soup), served together as "abula" with assorted meat. Soft, comforting and packed with flavour, it''s best enjoyed the traditional way with amala.',
  pairs_with = 'Amala, Eba, Assorted Meat (extra)',
  notes = '🌶🌶 Medium · Contains fish (crayfish, locust beans / iru) · Serves roughly 8–10 portions'
where id = '1e121551-87c5-4ea4-b713-a6e91106b3cb';

update products set
  tagline = 'A Calabar delicacy, green, hearty and nourishing.',
  description = 'A rich Efik and Ibibio soup of finely shredded afang leaves and waterleaf, cooked in palm oil with periwinkles, dried fish and assorted meat. It''s packed with greens and full of body, a true taste of the South-South.',
  pairs_with = 'Pounded Yam, Fufu, Eba',
  notes = '🌶🌶 Medium · Contains fish and shellfish (periwinkle, crayfish) · Serves roughly 8–10 portions'
where id = '01cb4b90-a31f-45bd-bf51-af18f235514c';

update products set
  tagline = 'Efo riro: bold, green and bursting with flavour.',
  description = 'Fresh spinach (efo) simmered in a rich pepper and palm oil base with locust beans, crayfish and a generous mix of assorted meats and fish. It''s vibrant and savoury, and pairs with just about any swallow.',
  pairs_with = 'Pounded Yam, Eba, Semo, or White Rice',
  notes = '🌶🌶🌶 Hot · Contains fish (crayfish, stockfish) · Serves roughly 8–10 portions'
where id = 'a9cdd727-464c-41da-b515-befb567d653a';

update products set
  tagline = 'The nation''s favourite: nutty, rich and hearty.',
  description = 'Ground melon seeds cooked in palm oil and pepper with leafy greens, stockfish and your choice of protein. It''s thick, flavourful and deeply satisfying, the soup that brings everyone to the table.',
  pairs_with = 'Pounded Yam, Eba, Fufu, Semo',
  notes = '🌶🌶 Medium · Contains fish (crayfish, stockfish) and seeds (melon) · Serves roughly 8–10 portions'
where id = '12eb2f9f-bd48-4fab-a15a-3c2bde98fccd';

-- Proteins
update products set
  tagline = 'Our signature plate: flame-grilled, spiced and served fresh.',
  description = 'A whole fish marinated in our R.S house spice blend, flame-grilled until the skin is crisp and the flesh is tender and flaky. It''s served on a bed of colourful stir-fried vegetables, making a light but seriously satisfying meal.',
  pairs_with = 'Fried Rice, Jollof Rice, Chips or Plantain',
  notes = '🌶🌶 Medium · Contains fish · Single serving · ⭐ House Special'
where id = 'd45cec35-9351-4e98-913f-d91fbc43c98b';

update products set
  tagline = 'Gizzard meets plantain, the ultimate party side.',
  description = 'Tender chicken gizzards and ripe fried plantain (dodo), tossed together in a spicy pepper and onion sauce. It''s sweet, savoury and a little fiery, and it always disappears first at any event.',
  pairs_with = 'Jollof Rice, Fried Rice, Waakye',
  notes = '🌶🌶🌶 Hot · Dairy-free · Serves roughly 25–30 guests as a side'
where id = '6fbc7026-b318-4283-8a89-1809312e6b9b';

update products set
  tagline = 'A little bit of everything, all of it delicious.',
  description = 'A generous mix of beef, shaki (tripe), cow skin (ponmo) and offal, seasoned and slow-cooked until tender, then finished in a spicy pepper sauce. It''s the perfect add-on to any soup, stew or rice dish.',
  pairs_with = 'Any soup, Jollof Rice, Fried Rice, Waakye',
  notes = '🌶🌶 Medium · Dairy-free'
where id = '43d2fb63-911d-4f25-ba22-bd1d6ef78abc';

update products set
  tagline = 'Smoky, sticky and grilled to perfection.',
  description = 'Chicken pieces marinated overnight in our house spice rub, then flame-grilled and glazed with a smoky BBQ finish. They come out juicy inside and charred outside, which makes them a crowd-pleaser for any occasion.',
  pairs_with = 'Jollof Rice, Fried Rice, R.S Signature Salad',
  notes = '🌶🌶 Medium · May contain mustard or celery depending on the BBQ glaze · 30 pieces'
where id = 'c743304f-9898-486c-b787-c9aa3e2a8ee7';

update products set
  tagline = 'Fall-off-the-bone tender, with an African kick.',
  description = 'Meaty pork ribs slow-marinated in our signature spice blend, then grilled low and slow until tender and caramelised. They''re rich, smoky and finger-licking good.',
  pairs_with = 'Fried Rice, Jollof Rice, R.S Signature Salad',
  notes = '🌶🌶 Medium · Contains pork · 30 pieces'
where id = '18c710de-b6b3-4023-820d-c2c64aad6394';

update products set
  tagline = 'Fried and drenched in fiery pepper sauce.',
  description = 'Firm fish chunks seasoned, fried until golden, then tossed in a rich, spicy pepper sauce with onions. It''s bold, zesty and perfect as a side or as a small chop on its own.',
  pairs_with = 'Jollof Rice, Waakye, Fried Rice',
  notes = '🌶🌶🌶 Hot · Contains fish · 20 pieces'
where id = 'eba20f6f-c629-456a-aa4a-371d3604b7fe';

-- Snacks
update products set
  tagline = 'Golden bean fritters, crispy outside and fluffy inside.',
  description = 'Freshly blended black-eyed beans with onions and pepper, deep-fried into golden, airy fritters. It''s a classic breakfast and snack favourite, delicious on its own or with bread, pap or custard.',
  pairs_with = 'Pap (Ogi), Custard, Agege Bread, Moi Moi',
  notes = '🌶 Mild · Vegan · Gluten-free'
where id = '89f514db-46b7-4680-b1a7-d97f98dd98d3';

update products set
  tagline = 'Steamed bean pudding, soft, rich and packed with flavour.',
  description = 'Smooth blended beans with peppers, onions and palm oil, baked in individual foil wraps with egg and fish inside. Every portion comes neat and ready to serve, which makes it a must-have on the party menu.',
  pairs_with = 'Jollof Rice, Fried Rice, Pap, Custard',
  notes = '🌶 Mild · Contains egg and fish · Individually wrapped portions'
where id = 'fa41aa8d-4287-4f84-aa53-5d1625501bb5';

update products set
  tagline = 'Soft, sweet and impossible to eat just one.',
  description = 'Fluffy, golden balls of fried dough, lightly sweetened and pillowy soft on the inside. It''s the ultimate small chop for parties, events or a treat at home.',
  pairs_with = 'Small chops platters, Akara, Chilled drinks',
  notes = 'Not spicy · Contains gluten (wheat) · Vegetarian · 50 pieces'
where id = 'd990d2af-8a97-4b23-896a-caf4b7c25e62';

-- Vegetables
update products set
  tagline = 'Fresh, crunchy and made to balance every plate.',
  description = 'Our house salad of crisp lettuce, cabbage, carrots, cucumber, tomatoes, sweet corn and baked beans, finished with boiled egg and a creamy dressing. It''s the perfect fresh side to cut through rich rice dishes and grills.',
  pairs_with = 'Jollof Rice, Fried Rice, Grilled BBQ Chicken, Grilled Pork Ribs',
  notes = 'Not spicy · Contains egg and dairy (salad cream / mayonnaise) · Vegetarian'
where id = '99a58821-c9ff-49b6-99a8-83d83869c287';

-- Combo Orders
update products set
  tagline = 'A perfect party starter for smaller gatherings.',
  description = 'A curated tray of RSGrills favourites: rice, protein and sides, packed and ready to serve. It''s ideal for birthdays, office lunches and family get-togethers. Tap View to see what''s included and customise your tray.',
  pairs_with = null,
  notes = 'Best for small gatherings of about 10–15 guests'
where id = '4d3a9fca-8c47-40b4-9af7-e105328f6675';

update products set
  tagline = 'More food, more flavour, more smiles.',
  description = 'A bigger spread of our best-selling rice dishes, grilled proteins and sides in one tray. It''s great for mid-size parties, church events and celebrations. Tap View to see the full contents.',
  pairs_with = null,
  notes = 'Best for gatherings of about 20–30 guests'
where id = '054ca859-e72b-44db-9fcf-22bc065d771b';

update products set
  tagline = 'The full RSGrills feast, built for big celebrations.',
  description = 'Our biggest combo, a generous spread of jollof, fried rice, grilled proteins and small chops, designed to feed a crowd without the stress. It''s perfect for weddings, naming ceremonies and milestone birthdays.',
  pairs_with = null,
  notes = 'Best for large events of about 35–50 guests'
where id = '7a96183b-d327-4cbd-b3cf-37c8e2595527';

-- Swallow / Combined Meals (Yam & Egg Sauce, moved from Combo Order above)
update products set
  tagline = 'The classic Naija breakfast, done right.',
  description = 'Soft boiled yam served with a rich egg sauce of scrambled eggs, fresh tomatoes, peppers and onions. It''s simple, hearty and comforting, and it works for breakfast, brunch or any time of day.',
  pairs_with = 'Akara, Pap, Tea',
  notes = '🌶🌶 Medium · Contains egg · Vegetarian'
where id = 'c1e942f2-fe8a-4da2-93ad-8683a55f6a68';

-- 8. Optional: category descriptions, if a "description" column exists on categories.
-- Uncomment and run once you've added it, or ask your admin UI to manage these instead:
-- alter table categories add column if not exists description text;
-- update categories set description = 'Party-ready rice cooked the authentic West African way.' where name = 'Rice Dishes';
-- update categories set description = 'Rich, traditional soups loaded with protein, best with your favourite swallow.' where name = 'Soups';
-- update categories set description = 'Slow-cooked stews full of deep, homely flavour.' where name = 'Stews';
-- update categories set description = 'Pounded yam, eba, amala and more, plus complete meals ready to enjoy.' where name = 'Swallow / Combined Meals';
-- update categories set description = 'Flame-grilled, fried and peppered, the star of every plate.' where name = 'Proteins';
-- update categories set description = 'Small chops and bites for parties, breakfasts and cravings.' where name = 'Snacks';
-- update categories set description = 'Curated trays to feed your crowd, stress-free.' where name = 'Combo Order';
-- update categories set description = 'Fresh sides to balance every meal.' where name = 'Vegetables';

-- Note: "Stews" and "Swallow / Combined Meals" (aside from Yam & Egg Sauce moved in above)
-- still have no products. Add items for these via the admin panel when the recipes are ready.
