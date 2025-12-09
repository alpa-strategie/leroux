export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, structure, need, message } = data;

    // Validation basique
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ 
        message: 'Veuillez remplir tous les champs obligatoires (Nom, Email, Message).' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Configuration du transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.SMTP_PORT),
      secure: import.meta.env.SMTP_SECURE === 'true',
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    // Contenu de l'email
    const mailOptions = {
      from: import.meta.env.SMTP_FROM || import.meta.env.SMTP_USER,
      to: import.meta.env.SMTP_TO,
      replyTo: email, // Pour répondre directement au visiteur
      subject: `Nouveau message de ${name} (via leroux.cv)`,
      text: `
        Nouveau message reçu depuis le formulaire de contact du site.

        Nom : ${name}
        Email : ${email}
        Structure : ${structure}
        Besoin principal : ${need}

        Message :
        ${message}
      `,
      html: `
        <h3>Nouveau message reçu</h3>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Structure :</strong> ${structure}</p>
        <p><strong>Besoin principal :</strong> ${need}</p>
        <hr>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ 
      message: 'Votre message a été envoyé avec succès !' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return new Response(JSON.stringify({ 
      message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard ou me contacter directement par email.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

