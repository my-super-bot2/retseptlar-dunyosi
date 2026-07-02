// ============================================
// SUPABASE ULANISH
// ============================================

const SUPABASE_URL = "https://djpdfvngatsbfrenfzah.supabase.co";
const SUPABASE_KEY = "sb_publishable_8fhNqJTTa7mCre0IBCuY8Q_2_K4rCE1";

// Supabase CDN dan yuklaymiz
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Joriy foydalanuvchini olish
async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

// Profilni olish
async function getProfile(userId) {
  const { data } = await sb.from("profiles").select("*").eq("id", userId).single();
  return data;
}

// Chiqish
async function signOut() {
  await sb.auth.signOut();
  window.location.href = "login.html";
}
