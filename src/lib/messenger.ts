import { supabase } from './supabaseClient';

export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  try {
    // Sincronizado con el nombre que pusiste en el panel de Supabase
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (error) {
      console.error("❌ Error de Supabase:", error);
      throw error;
    }

    console.log("✅ Función invocada con éxito");
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Error al llamar a la función:", err);
    return { success: false, error: err.message };
  }
};