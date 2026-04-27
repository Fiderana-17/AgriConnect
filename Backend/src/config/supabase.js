const { createClient } = require("@supabase/supabase-js");

const supabaseUrl    = process.env.SUPABASE_URL;
const supabaseKey    = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || "listings";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload un fichier vers Supabase Storage
 * @param {Buffer} buffer
 * @param {string} filename
 * @param {string} mimetype
 * @returns {string} URL publique
 */
async function uploadImage(buffer, filename, mimetype) {
  const filePath = `products/${filename}`;

  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(filePath, buffer, { contentType: mimetype, upsert: false });

  if (error) throw new Error(`Supabase upload error: ${error.message}`);

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(filePath);
  return data.publicUrl;
}

module.exports = { supabase, uploadImage };