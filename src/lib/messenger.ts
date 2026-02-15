// src/lib/messenger.ts
import { Resend } from 'resend';

// API Key configurada para SICONITCC
const resend = new Resend('re_Mhf6wx5W_NwEDgimSFY1ZZiYa8ZiLVywT');

export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SICONITCC <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Error en Resend:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Error de conexión:", err);
    return { success: false, error: err };
  }
};