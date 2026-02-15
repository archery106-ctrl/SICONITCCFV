import { supabase } from './supabaseClient';

export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  try {
    // Invocamos la función con headers explícitos
    const { data, error } = await supabase.functions.invoke('quick-worker', {
      body: { to, subject, html },
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (error) {
      console.error("❌ Error de Supabase:", error);
      throw error;
    }

    console.log("✅ Correo procesado correctamente por la Edge Function");
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Error al llamar a la función:", err);
    return { success: false, error: err.message };
  }
};