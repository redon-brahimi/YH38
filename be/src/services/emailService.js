import sgMail from '@sendgrid/mail';
import logger from '../logger.js';
import nodemailer from 'nodemailer';

// It's crucial to set this from your environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// It's a best practice to manage your template IDs in a central place.
// You would create these templates in your SendGrid dashboard.
const TEMPLATE_IDS = {
  CLIENT_SIGNUP: 'd-xxxxxxxxxxxxxxxx', // Replace with your actual template ID
  REPAIR_CREATED: 'd-bbbbbbbbbbbbbbbb', // Replace with your actual template ID
  APPOINTMENT_CONFIRMED: 'd-yyyyyyyyyyyyyyyy', // Replace with your actual template ID,
  REPAIR_STATUS_UPDATE: 'd-zzzzzzzzzzzzzzzz', // Replace with your actual template ID
  REPAIR_READY_FOR_PICKUP: 'd-aaaaaaaaaaaaaaaa', // Replace with your actual template ID
};

// A verified sender email address is required by email service providers.
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@espacecall.com';

let etherealTransporter;

const getEtherealTransporter = async () => {
  if (etherealTransporter) {
    return etherealTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
  logger.info('Ethereal transporter created for development email sending.');
  return etherealTransporter;
};

const getEmailContentFromTemplate = (templateId, data) => {
  switch (templateId) {
    case TEMPLATE_IDS.CLIENT_SIGNUP:
      return {
        subject: 'Bienvenue chez Espace Call !',
        text: `Bonjour ${data.name},\n\nBienvenue chez Espace Call ! Vous pouvez maintenant vous connecter à votre compte.\n\nConnectez-vous ici : ${data.login_url}`,
        html: `<p>Bonjour ${data.name},</p><p>Bienvenue chez Espace Call ! Vous pouvez maintenant vous connecter à votre compte.</p><p><a href="${data.login_url}">Connectez-vous ici</a></p>`,
      };
    case TEMPLATE_IDS.REPAIR_CREATED:
      return {
        subject: `Votre ticket de réparation a été créé: ${data.tracking_code}`,
        text: `Bonjour ${data.name},\n\nNous avons bien reçu votre demande de réparation pour votre ${data.device_model}. Votre code de suivi est ${data.tracking_code}.\n\nVous pouvez suivre l'avancement ici: ${data.tracking_url}`,
        html: `<p>Bonjour ${data.name},</p><p>Nous avons bien reçu votre demande de réparation pour votre ${data.device_model}. Votre code de suivi est <strong>${data.tracking_code}</strong>.</p><p><a href="${data.tracking_url}">Suivez l'avancement de votre réparation ici</a>.</p>`,
      };
    case TEMPLATE_IDS.APPOINTMENT_CONFIRMED:
      return {
        subject: 'Votre rendez-vous est confirmé',
        text: `Votre rendez-vous pour votre ${data.device_info} est confirmé pour le ${data.appointment_date} à ${data.appointment_time}.\n\nConsultez votre tableau de bord : ${data.dashboard_url}`,
        html: `<p>Votre rendez-vous pour votre ${data.device_info} est confirmé pour le <strong>${data.appointment_date} à ${data.appointment_time}</strong>.</p><p><a href="${data.dashboard_url}">Consultez votre tableau de bord</a></p>`,
      };
    case TEMPLATE_IDS.REPAIR_STATUS_UPDATE:
      return {
        subject: `Mise à jour de votre réparation : ${data.tracking_code}`,
        text: `Le statut de la réparation de votre ${data.device_model} (${data.tracking_code}) a été mis à jour : ${data.status}.\n\nSuivez votre réparation ici : ${data.tracking_url}`,
        html: `<p>Le statut de la réparation de votre ${data.device_model} (${data.tracking_code}) a été mis à jour : <strong>${data.status}</strong>.</p><p><a href="${data.tracking_url}">Suivez votre réparation ici</a></p>`,
      };
    case TEMPLATE_IDS.REPAIR_READY_FOR_PICKUP:
      return {
        subject: `Votre appareil est prêt à être récupéré ! (${data.tracking_code})`,
        text: `Bonne nouvelle ! Votre ${data.device_model} est réparé et prêt à être récupéré. Le statut est : ${data.status}.\n\nSuivez votre réparation ici : ${data.tracking_url}`,
        html: `<p>Bonne nouvelle ! Votre ${data.device_model} est réparé et prêt à être récupéré. Le statut est : <strong>${data.status}</strong>.</p><p><a href="${data.tracking_url}">Suivez votre réparation ici</a></p>`,
      };
    default:
      return {
        subject: 'Notification de Espace Call',
        text: JSON.stringify(data),
        html: `<pre>${JSON.stringify(data, null, 2)}</pre>`,
      };
  }
};

/**
 * A generic email sending function to wrap the provider's logic.
 * @param {object} message - The message object, compatible with the SendGrid SDK.
 */
const sendEmail = async (message) => {
  // Use Ethereal for development if SENDGRID_API_KEY is not set or in development environment
  if (!process.env.SENDGRID_API_KEY || process.env.NODE_ENV === 'development') {
    logger.warn('Using Ethereal for email sending in development mode.');
    try {
      const transporter = await getEtherealTransporter();
      const content = getEmailContentFromTemplate(message.templateId, message.dynamicTemplateData);
      const info = await transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Espace Call'}" <${message.from}>`,
        to: message.to,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`Email sent via Ethereal to ${message.to}.`);
      logger.info(`========================================================`);
      logger.info(`📧 Ethereal Preview URL: ${previewUrl}`);
      logger.info(`========================================================`);
    } catch (error) {
      logger.error('Failed to send email via Ethereal:', { to: message.to, error: error.message });
    }
    return;
  }

  // Production: Use SendGrid
  try {
    await sgMail.send(message);
    logger.info(`Email successfully sent to ${message.to}`);
  } catch (error) {
    logger.error('Failed to send email:', {
      to: message.to,
      error: error.response?.body || error.message,
    });
  }
};

/**
 * Sends a welcome email to a new client upon signup.
 * @param {string} clientEmail - The recipient's email address.
 * @param {string} clientName - The recipient's name.
 */
export const sendSignupConfirmation = (clientEmail, clientName) => {
  const message = {
    to: clientEmail,
    from: FROM_EMAIL,
    templateId: TEMPLATE_IDS.CLIENT_SIGNUP,
    dynamicTemplateData: {
      name: clientName,
      login_url: `${process.env.FRONTEND_URL}/login`,
    },
  };
  sendEmail(message);
};

/**
 * Sends an email confirming a new repair ticket has been created.
 * @param {string} clientEmail - The recipient's email address.
 * @param {object} repairDetails - Details about the repair.
 */
export const sendRepairCreationConfirmation = (clientEmail, { name, trackingCode, deviceModel }) => {
  const message = {
    to: clientEmail,
    from: FROM_EMAIL,
    templateId: TEMPLATE_IDS.REPAIR_CREATED,
    dynamicTemplateData: {
      name: name,
      tracking_code: trackingCode,
      device_model: deviceModel,
      tracking_url: `${process.env.FRONTEND_URL}/track?code=${trackingCode}`,
    },
  };
  sendEmail(message);
};


/**
 * Sends an email confirming a new appointment.
 * @param {string} clientEmail - The recipient's email address.
 * @param {object} appointmentDetails - Details about the appointment.
 */
export const sendAppointmentConfirmation = (clientEmail, { date, time, device }) => {
  const message = {
    to: clientEmail,
    from: FROM_EMAIL,
    templateId: TEMPLATE_IDS.APPOINTMENT_CONFIRMED,
    dynamicTemplateData: {
      appointment_date: date,
      appointment_time: time,
      device_info: device,
      dashboard_url: `${process.env.FRONTEND_URL}/dashboard`,
    },
  };
  sendEmail(message);
};

/**
 * Sends an email notification about a repair status update.
 * @param {string} clientEmail - The recipient's email address.
 * @param {object} repairDetails - Details about the repair.
 */
export const sendRepairStatusUpdate = (clientEmail, { trackingCode, status, deviceModel }) => {
  // Use a different, more celebratory template when the repair is ready!
  const isReady = status.toLowerCase().includes('prêt') || status.toLowerCase().includes('ready');
  const templateId = isReady ? TEMPLATE_IDS.REPAIR_READY_FOR_PICKUP : TEMPLATE_IDS.REPAIR_STATUS_UPDATE;

  const message = {
    to: clientEmail,
    from: FROM_EMAIL,
    templateId: templateId,
    dynamicTemplateData: {
      device_model: deviceModel,
      tracking_code: trackingCode,
      status: status, // e.g., "En cours", "Réparé", "Prêt pour récupération"
      tracking_url: `${process.env.FRONTEND_URL}/track?code=${trackingCode}`,
    },
  };
  sendEmail(message);
};