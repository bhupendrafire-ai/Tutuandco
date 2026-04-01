const { Resend } = require('resend');
const twilio = require('twilio');
require('dotenv').config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Twilio setup - typically requires Account SID and Auth Token
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
    : null;

/**
 * NotificationService
 * Responsible for triggered emails and SMS after order state changes.
 */
class NotificationService {
    /**
     * Sends a shipping confirmation email and SMS.
     * @param {Object} order The order object from the database.
     * @param {Object} shippingDetails Tracking number, carrier, etc.
     */
    static async notifyShipped(order, shippingDetails) {
        const { customer_name, customer_email, customer_phone, id } = order;
        const { tracking_number, carrier } = shippingDetails;

        console.log(`[NotificationService] Processing shipment notifications for Order #${id}`);

        // 1. Send Email via Resend
        if (resend && customer_email) {
            try {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'Tutu & Co <onboarding@resend.dev>',
                    to: customer_email,
                    subject: `Your Tutu & Co order #${id} has shipped!`,
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                            <h2 style="color: #CD664D;">Great news, ${customer_name}!</h2>
                            <p>Your premium pet apparel is on its way. We've handed over your package to <strong>${carrier}</strong>.</p>
                            
                            <div style="background: #F4F1EA; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #666;">Tracking Number:</p>
                                <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #3E362E;">${tracking_number}</p>
                            </div>
                            
                            <p>You can track your package directly on the ${carrier} website.</p>
                            
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                            
                            <p style="font-size: 12px; color: #999;">If you have any questions, just reply to this email or visit our help center.</p>
                            <p style="font-size: 14px; font-weight: bold;">Tutu & Co</p>
                        </div>
                    `
                });
                console.log(`✅ Email sent to ${customer_email}`);
            } catch (err) {
                console.error(`❌ Resend Error: ${err.message}`);
            }
        } else {
            console.warn(`⚠️ Skipping Email: ${!resend ? 'RESEND_API_KEY missing' : 'customer_email missing'}`);
        }

        // 2. Send SMS via Twilio
        if (twilioClient && customer_phone && process.env.TWILIO_PHONE_NUMBER) {
            try {
                await twilioClient.messages.create({
                    body: `Tutu & Co: Your order #${id} has been shipped via ${carrier}! Tracking: ${tracking_number}. Get ready for some style!`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: customer_phone
                });
                console.log(`✅ SMS sent to ${customer_phone}`);
            } catch (err) {
                console.error(`❌ Twilio Error: ${err.message}`);
            }
        } else {
            console.warn(`⚠️ Skipping SMS: ${!twilioClient ? 'TWILIO configuration missing' : 'customer_phone missing'}`);
        }
    }

    /**
     * Sends an order confirmation email immediately after purchase.
     */
    static async notifyOrdered(order) {
        const { customer_name, customer_email, id, total_amount } = order;
        if (resend && customer_email) {
            try {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'Tutu & Co <onboarding@resend.dev>',
                    to: customer_email,
                    subject: `Thank you for your order, ${customer_name}!`,
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                            <h2 style="color: #9FA993;">We've received your order!</h2>
                            <p>Thank you for choosing Tutu & Co. We're getting your order <strong>#${id}</strong> ready for shipment.</p>
                            <p><strong>Total Amount:</strong> ₹${parseFloat(total_amount).toFixed(2)}</p>
                            <p>We'll notify you as soon as your items are on their way.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="font-size: 14px; font-weight: bold;">Tutu & Co</p>
                        </div>
                    `
                });
                console.log(`✅ Order confirmation email sent to ${customer_email}`);
            } catch (err) {
                console.error(`❌ Resend Error (Ordered): ${err.message}`);
            }
        }
    }
}

module.exports = NotificationService;
