// src/lib/messenger.ts

export const sendSiconitccEmail = async (to: string, subject: string, html: string) => {
  // NOTA: En producción, lo ideal es que esta Key esté en un archivo .env
  const apiKey = 're_Mhf6wx5W_NwEDgimSFY1ZZiYa8ZiLVywT';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'SICONITCC <onboarding@resend.dev>', // Resend requiere este dominio para cuentas gratuitas
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error de Resend:", data);
      // Si el error es por el dominio "from", avisamos al usuario
      return { 
        success: false, 
        error: data.message || "Error al enviar el correo" 
      };
    }
    
    console.log("✅ Correo enviado con éxito a través de Resend");
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Error de conexión con el servidor de correos:", err);
    return { success: false, error: "No se pudo conectar con el servicio de mensajería" };
  }
};