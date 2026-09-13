-- Room photos show the inside of people's homes, so keep them private.
--
-- The generations bucket was public: anyone holding a file's URL could open
-- it. It's now private, and the app shows images through short-lived signed
-- URLs. The existing "Users can view their own generations" policy (own folder
-- only) is exactly what signing needs, so no policy changes are required.

update storage.buckets
   set public = false
 where id = 'generations';

-- Rows written while the bucket was public stored full public URLs. Convert
-- them to bucket paths (<user_id>/<file>) so the app can sign them.
update public.generations
   set input_image_url = regexp_replace(input_image_url, '^https?://[^/]+/storage/v1/object/public/generations/', '')
 where input_image_url ~ '^https?://[^/]+/storage/v1/object/public/generations/';

update public.generations
   set output_image_url = regexp_replace(output_image_url, '^https?://[^/]+/storage/v1/object/public/generations/', '')
 where output_image_url ~ '^https?://[^/]+/storage/v1/object/public/generations/';
