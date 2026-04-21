export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome, email, mensagem } = req.body;

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: "service_4ubx15c",
        template_id: "template_mumln3f",
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN, // 🔐 seguro
        template_params: {
          user_name: nome,
          user_email: email,
          message: mensagem,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro EmailJS:", text);
      throw new Error("Erro ao enviar email");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
}