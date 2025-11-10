import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Uyarı: prod build sırasında eksik env değişkeni varsa bilgilendir.
  // Uygulama çalışır ancak auth çağrıları hata verebilir.
  // .env.example dosyasını baz alarak .env oluşturmayı unutmayın.
  // console.warn burada bırakılıyor; prod konsolunda da görülebilir.
  console.warn('Supabase env değişkenleri eksik: VITE_SUPABASE_URL ve/veya VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
