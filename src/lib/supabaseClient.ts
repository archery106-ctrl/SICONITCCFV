import { createClient } from '@supabase/supabase-js';

// Usamos valores por defecto vacíos para evitar que el cliente falle al instanciarse
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificación de seguridad proactiva
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn(
      "⚠️ SICONITCC: No se detectaron las variables de entorno de Supabase.\n" +
      "Asegúrate de que existan en tu archivo .env.local como:\n" +
      "VITE_SUPABASE_URL=...\n" +
      "VITE_SUPABASE_ANON_KEY=..."
    );
  }
}

// Inicialización del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Mantiene la sesión del docente abierta al recargar
    autoRefreshToken: true,
  }
});