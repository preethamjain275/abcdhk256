-- Smart Product Image Update Script
-- Matches categories/keywords to curated Unsplash images


-- Update for bath
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80','https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&q=80','https://images.unsplash.com/photo-1635311023777-62325377f07a?w=800&q=80','https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80','https://images.unsplash.com/photo-1595204212519-aa32e946059d?w=800&q=80','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80','https://images.unsplash.com/photo-1571781564993-e4483758b99c?w=800&q=80','https://images.unsplash.com/photo-1609121633533-3d44ba775949?w=800&q=80','https://images.unsplash.com/photo-1560942548-52fb58f33eec?w=800&q=80','https://images.unsplash.com/photo-1549488352-84b256c9a909?w=800&q=80'])[ (id_int % 10) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80','https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&q=80','https://images.unsplash.com/photo-1635311023777-62325377f07a?w=800&q=80','https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80','https://images.unsplash.com/photo-1595204212519-aa32e946059d?w=800&q=80','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80','https://images.unsplash.com/photo-1571781564993-e4483758b99c?w=800&q=80','https://images.unsplash.com/photo-1609121633533-3d44ba775949?w=800&q=80','https://images.unsplash.com/photo-1560942548-52fb58f33eec?w=800&q=80','https://images.unsplash.com/photo-1549488352-84b256c9a909?w=800&q=80'])[ ((id_int + 1) % 10) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80','https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&q=80','https://images.unsplash.com/photo-1635311023777-62325377f07a?w=800&q=80','https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80','https://images.unsplash.com/photo-1595204212519-aa32e946059d?w=800&q=80','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80','https://images.unsplash.com/photo-1571781564993-e4483758b99c?w=800&q=80','https://images.unsplash.com/photo-1609121633533-3d44ba775949?w=800&q=80','https://images.unsplash.com/photo-1560942548-52fb58f33eec?w=800&q=80','https://images.unsplash.com/photo-1549488352-84b256c9a909?w=800&q=80'])[ ((id_int + 2) % 10) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (name ILIKE '%bath%' OR description ILIKE '%bath%');

-- Update for soap
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80','https://images.unsplash.com/photo-1595231713500-b6f70932822a?w=800&q=80','https://images.unsplash.com/photo-1619890666012-e56598379413?w=800&q=80'])[ (id_int % 3) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80','https://images.unsplash.com/photo-1595231713500-b6f70932822a?w=800&q=80','https://images.unsplash.com/photo-1619890666012-e56598379413?w=800&q=80'])[ ((id_int + 1) % 3) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80','https://images.unsplash.com/photo-1595231713500-b6f70932822a?w=800&q=80','https://images.unsplash.com/photo-1619890666012-e56598379413?w=800&q=80'])[ ((id_int + 2) % 3) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (name ILIKE '%soap%' OR description ILIKE '%soap%');

-- Update for shampoo
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1506003094892-db78613d9ca5?w=800&q=80','https://images.unsplash.com/photo-1556212555-46fd25b39bfd?w=800&q=80','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'])[ (id_int % 3) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1506003094892-db78613d9ca5?w=800&q=80','https://images.unsplash.com/photo-1556212555-46fd25b39bfd?w=800&q=80','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'])[ ((id_int + 1) % 3) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1506003094892-db78613d9ca5?w=800&q=80','https://images.unsplash.com/photo-1556212555-46fd25b39bfd?w=800&q=80','https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'])[ ((id_int + 2) % 3) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (name ILIKE '%shampoo%' OR description ILIKE '%shampoo%');

-- Update for electronics
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80','https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80','https://images.unsplash.com/photo-1588872657578-a3d2e3dc47f9?w=800&q=80','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80','https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80','https://images.unsplash.com/photo-1580910051074-3eb6948d3ea0?w=800&q=80','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80','https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80'])[ (id_int % 12) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80','https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80','https://images.unsplash.com/photo-1588872657578-a3d2e3dc47f9?w=800&q=80','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80','https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80','https://images.unsplash.com/photo-1580910051074-3eb6948d3ea0?w=800&q=80','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80','https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80'])[ ((id_int + 1) % 12) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80','https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80','https://images.unsplash.com/photo-1588872657578-a3d2e3dc47f9?w=800&q=80','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80','https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80','https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80','https://images.unsplash.com/photo-1580910051074-3eb6948d3ea0?w=800&q=80','https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80','https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80'])[ ((id_int + 2) % 12) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%electronics%' OR subcategory ILIKE '%electronics%');

-- Update for fashion
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80','https://images.unsplash.com/photo-1490481651871-32d2e76f8730?w=800&q=80','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80','https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80','https://images.unsplash.com/photo-1529139574466-a302c2d56ea0?w=800&q=80','https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80','https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80','https://images.unsplash.com/photo-1551488852-081bd4c9a6f6?w=800&q=80','https://images.unsplash.com/photo-1617137968427-85924c809a22?w=800&q=80','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80','https://images.unsplash.com/photo-1589465885857-44ed4540d515?w=800&q=80'])[ (id_int % 12) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80','https://images.unsplash.com/photo-1490481651871-32d2e76f8730?w=800&q=80','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80','https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80','https://images.unsplash.com/photo-1529139574466-a302c2d56ea0?w=800&q=80','https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80','https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80','https://images.unsplash.com/photo-1551488852-081bd4c9a6f6?w=800&q=80','https://images.unsplash.com/photo-1617137968427-85924c809a22?w=800&q=80','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80','https://images.unsplash.com/photo-1589465885857-44ed4540d515?w=800&q=80'])[ ((id_int + 1) % 12) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80','https://images.unsplash.com/photo-1490481651871-32d2e76f8730?w=800&q=80','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80','https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=80','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80','https://images.unsplash.com/photo-1529139574466-a302c2d56ea0?w=800&q=80','https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=800&q=80','https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80','https://images.unsplash.com/photo-1551488852-081bd4c9a6f6?w=800&q=80','https://images.unsplash.com/photo-1617137968427-85924c809a22?w=800&q=80','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80','https://images.unsplash.com/photo-1589465885857-44ed4540d515?w=800&q=80'])[ ((id_int + 2) % 12) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%fashion%' OR subcategory ILIKE '%fashion%');

-- Update for home
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80','https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=800&q=80','https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80','https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80','https://images.unsplash.com/photo-1513694203232-7ce8fe7c0a83?w=800&q=80','https://images.unsplash.com/photo-1522771753037-633361b635eb?w=800&q=80','https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80','https://images.unsplash.com/photo-1540932296774-3ed6926b42b5?w=800&q=80','https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&q=80','https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80','https://images.unsplash.com/photo-1505693416388-3498c679234b?w=800&q=80'])[ (id_int % 12) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80','https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=800&q=80','https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80','https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80','https://images.unsplash.com/photo-1513694203232-7ce8fe7c0a83?w=800&q=80','https://images.unsplash.com/photo-1522771753037-633361b635eb?w=800&q=80','https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80','https://images.unsplash.com/photo-1540932296774-3ed6926b42b5?w=800&q=80','https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&q=80','https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80','https://images.unsplash.com/photo-1505693416388-3498c679234b?w=800&q=80'])[ ((id_int + 1) % 12) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80','https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=800&q=80','https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80','https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80','https://images.unsplash.com/photo-1513694203232-7ce8fe7c0a83?w=800&q=80','https://images.unsplash.com/photo-1522771753037-633361b635eb?w=800&q=80','https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80','https://images.unsplash.com/photo-1540932296774-3ed6926b42b5?w=800&q=80','https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&q=80','https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80','https://images.unsplash.com/photo-1505693416388-3498c679234b?w=800&q=80'])[ ((id_int + 2) % 12) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%home%' OR subcategory ILIKE '%home%');

-- Update for beauty
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80','https://images.unsplash.com/photo-1571781564993-e4483758b99c?w=800&q=80','https://images.unsplash.com/photo-1612817288484-95d8eb697274?w=800&q=80','https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80','https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80','https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=800&q=80','https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80','https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80','https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80','https://images.unsplash.com/photo-1576426863848-c21f5fc67255?w=800&q=80'])[ (id_int % 10) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80','https://images.unsplash.com/photo-1571781564993-e4483758b99c?w=800&q=80','https://images.unsplash.com/photo-1612817288484-95d8eb697274?w=800&q=80','https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80','https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80','https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=800&q=80','https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80','https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80','https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80','https://images.unsplash.com/photo-1576426863848-c21f5fc67255?w=800&q=80'])[ ((id_int + 1) % 10) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80','https://images.unsplash.com/photo-1571781564993-e4483758b99c?w=800&q=80','https://images.unsplash.com/photo-1612817288484-95d8eb697274?w=800&q=80','https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80','https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80','https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=800&q=80','https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80','https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80','https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80','https://images.unsplash.com/photo-1576426863848-c21f5fc67255?w=800&q=80'])[ ((id_int + 2) % 10) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%beauty%' OR subcategory ILIKE '%beauty%');

-- Update for appliances
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80','https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&q=80','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80','https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=800&q=80','https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80','https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80','https://images.unsplash.com/photo-1585659722983-3a675aba5c24?w=800&q=80','https://images.unsplash.com/photo-1533561394628-867bb3098523?w=800&q=80'])[ (id_int % 8) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80','https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&q=80','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80','https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=800&q=80','https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80','https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80','https://images.unsplash.com/photo-1585659722983-3a675aba5c24?w=800&q=80','https://images.unsplash.com/photo-1533561394628-867bb3098523?w=800&q=80'])[ ((id_int + 1) % 8) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80','https://images.unsplash.com/photo-1584622050111-993a426fbf0a?w=800&q=80','https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80','https://images.unsplash.com/photo-1571175443880-49e1d58b794a?w=800&q=80','https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80','https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&q=80','https://images.unsplash.com/photo-1585659722983-3a675aba5c24?w=800&q=80','https://images.unsplash.com/photo-1533561394628-867bb3098523?w=800&q=80'])[ ((id_int + 2) % 8) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%appliances%' OR subcategory ILIKE '%appliances%');

-- Update for grocery
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80','https://images.unsplash.com/photo-1506617420156-8e4536971650?w=800&q=80','https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80','https://images.unsplash.com/photo-1588964895597-a2c3f0c627f9?w=800&q=80','https://images.unsplash.com/photo-1607349913338-fca6f7fc42d1?w=800&q=80','https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80','https://images.unsplash.com/photo-1621447514732-c51d6c8b438d?w=800&q=80','https://images.unsplash.com/photo-1584443916295-886ec45f5a8a?w=800&q=80'])[ (id_int % 8) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80','https://images.unsplash.com/photo-1506617420156-8e4536971650?w=800&q=80','https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80','https://images.unsplash.com/photo-1588964895597-a2c3f0c627f9?w=800&q=80','https://images.unsplash.com/photo-1607349913338-fca6f7fc42d1?w=800&q=80','https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80','https://images.unsplash.com/photo-1621447514732-c51d6c8b438d?w=800&q=80','https://images.unsplash.com/photo-1584443916295-886ec45f5a8a?w=800&q=80'])[ ((id_int + 1) % 8) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80','https://images.unsplash.com/photo-1506617420156-8e4536971650?w=800&q=80','https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80','https://images.unsplash.com/photo-1588964895597-a2c3f0c627f9?w=800&q=80','https://images.unsplash.com/photo-1607349913338-fca6f7fc42d1?w=800&q=80','https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80','https://images.unsplash.com/photo-1621447514732-c51d6c8b438d?w=800&q=80','https://images.unsplash.com/photo-1584443916295-886ec45f5a8a?w=800&q=80'])[ ((id_int + 2) % 8) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%grocery%' OR subcategory ILIKE '%grocery%');

-- Update for toys
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&q=80','https://images.unsplash.com/photo-1566576912906-253c723528b7?w=800&q=80','https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80','https://images.unsplash.com/photo-1599623560574-39d485900c95?w=800&q=80','https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80','https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=800&q=80'])[ (id_int % 6) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&q=80','https://images.unsplash.com/photo-1566576912906-253c723528b7?w=800&q=80','https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80','https://images.unsplash.com/photo-1599623560574-39d485900c95?w=800&q=80','https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80','https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=800&q=80'])[ ((id_int + 1) % 6) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&q=80','https://images.unsplash.com/photo-1566576912906-253c723528b7?w=800&q=80','https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80','https://images.unsplash.com/photo-1599623560574-39d485900c95?w=800&q=80','https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80','https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=800&q=80'])[ ((id_int + 2) % 6) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%toys%' OR subcategory ILIKE '%toys%');

-- Update for books
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80','https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80','https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80','https://images.unsplash.com/photo-1519682574862-2f3d6ddbdd64?w=800&q=80'])[ (id_int % 5) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80','https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80','https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80','https://images.unsplash.com/photo-1519682574862-2f3d6ddbdd64?w=800&q=80'])[ ((id_int + 1) % 5) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80','https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80','https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80','https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80','https://images.unsplash.com/photo-1519682574862-2f3d6ddbdd64?w=800&q=80'])[ ((id_int + 2) % 5) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%books%' OR subcategory ILIKE '%books%');

-- Update for sports
UPDATE public.products
SET images = ARRAY[
  (ARRAY['https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80','https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80','https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80','https://images.unsplash.com/photo-1576678927484-8840b72f5f18?w=800&q=80'])[ (id_int % 5) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80','https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80','https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80','https://images.unsplash.com/photo-1576678927484-8840b72f5f18?w=800&q=80'])[ ((id_int + 1) % 5) + 1 ],
  (ARRAY['https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80','https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80','https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80','https://images.unsplash.com/photo-1576678927484-8840b72f5f18?w=800&q=80'])[ ((id_int + 2) % 5) + 1 ]
]
FROM (SELECT id, ('x' || substr(md5(id::text), 1, 8))::bit(32)::int as id_int FROM public.products) as p_int
WHERE products.id = p_int.id 
  AND (category ILIKE '%sports%' OR subcategory ILIKE '%sports%');
