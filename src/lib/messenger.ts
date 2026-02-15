import { supabase } from './supabaseClient';

export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  try {
    // Usamos 'quick-worker' que es el nombre real que veo en tu imagen
    const { data, error } = await supabase.functions.invoke('quick-worker', {
      body: { to, subject, html },
    });

    if (error) throw error;
    console.log("✅ Correo procesado correctamente");
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Error al llamar a la función:", err);
    return { success: false, error: err.message };
  }
};