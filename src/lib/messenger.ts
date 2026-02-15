import { supabase } from './supabaseClient';

export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  try {
    // Invocamos la función que acabas de crear
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    });

    if (error) throw error;
    console.log("✅ Correo procesado por Supabase Edge Function");
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Error en Edge Function:", err);
    return { success: false, error: err.message };
  }
};