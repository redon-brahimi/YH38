import logger from '../logger.js';
import { sendSignupConfirmation } from './emailService.js';
import { sendRepairCreationConfirmation as sendRepairCreationEmail } from './emailService.js';
import { sendAppointmentConfirmation as sendAppointmentConfirmationEmail } from './emailService.js';
import { sendRepairStatusUpdate as sendRepairStatusUpdateEmail } from './emailService.js';

/**
 * Dispatches a notification based on user preference.
 * @param {object} user - The user object, must contain `email`, `phone`, and `notification_preference`.
 * @param {object} actions - An object containing the functions to call for each channel.
 * @param {object} payloads - An object containing the data for each channel's function.
 */
const dispatch = (user, actions, payloads) => {
    const preference = user.notification_preference || 'email'; // Default to email

    if (preference === 'email' && actions.email && user.email) {
        actions.email(user.email, payloads.email);
    } else {
        logger.warn(`Could not send notification for user ${user.id}. Preference: '${preference}'. Only 'email' is supported or email address is missing.`);
    }
};

export const dispatchRepairCreation = (user, data) => {
    dispatch(user,
        { email: sendRepairCreationEmail },
        {
            email: { name: user.name, trackingCode: data.trackingCode, deviceModel: data.deviceModel }
        }
    );
};

export const dispatchAppointmentConfirmation = (user, data) => {
    dispatch(user,
        { email: sendAppointmentConfirmationEmail },
        {
            email: { date: data.date, time: data.time, device: data.device }
        }
    );
};

export const dispatchRepairStatusUpdate = (user, data) => {
    dispatch(user,
        { email: sendRepairStatusUpdateEmail },
        {
            email: { trackingCode: data.trackingCode, status: data.status, deviceModel: data.deviceModel }
        }
    );
};

/**
 * Sends a signup confirmation. This is always sent via email as it serves as a form of
 * account verification and provides a clear record of signup.
 * @param {object} user - The user object containing at least email and name.
 */
export const dispatchSignup = (user) => {
    if (user && user.email && user.name) {
        sendSignupConfirmation(user.email, user.name);
    } else {
        logger.error('dispatchSignup called with invalid user object', { user });
    }
};