// src/lib/messenger.ts

// Usamos FETCH directamente para evitar errores de compilación en Vite/Vercel
export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  const apiKey = 're_Mhf6wx5W_NwEDgimSFY1ZZiYa8ZiLVywT';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'SICONITCC <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Resend:", data);
      return { success: false, error: data };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Error de conexión:", err);
    return { success: false, error: err };
  }
};