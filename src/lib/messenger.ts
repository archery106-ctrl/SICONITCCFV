import { supabase } from './supabaseClient';

export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  try {
    // CAMBIO CLAVE: Usamos 'quick-worker' porque es el nombre real en la URL de tu Supabase
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

    console.log("✅ Función invocada con éxito");
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Error al llamar a la función:", err);
    return { success: false, error: err.message };
  }
};