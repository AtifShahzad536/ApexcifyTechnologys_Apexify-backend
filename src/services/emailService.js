import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send email
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Order confirmation email
export const sendOrderConfirmation = async (order, user) => {
    const itemsList = order.items.map(item =>
        `<li>${item.name} x ${item.quantity} - $${item.price.toFixed(2)}</li>`
    ).join('');

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Order Confirmation</h1>
      <p>Hi ${user.name},</p>
      <p>Thank you for your order! Your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
      
      <h2 style="color: #555;">Order Details</h2>
      <ul style="list-style: none; padding: 0;">
        ${itemsList}
      </ul>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${order.itemsPrice.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Shipping:</strong> $${order.shippingPrice.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Tax:</strong> $${order.taxPrice.toFixed(2)}</p>
        <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
      </div>
      
      <h3 style="color: #555;">Shipping Address</h3>
      <p>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
        ${order.shippingAddress.country}
      </p>
      
      <p>We'll send you another email when your order ships.</p>
      <p style="margin-top: 30px;">Best regards,<br>The Apexify Team</p>
    </div>
  `;

    return sendEmail({
        email: user.email,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html
    });
};

// Order status update email
export const sendOrderStatusUpdate = async (order, user, newStatus) => {
    const statusMessages = {
        'Processing': 'Your order is being processed.',
        'Shipped': 'Your order has been shipped!',
        'Delivered': 'Your order has been delivered.',
        'Cancelled': 'Your order has been cancelled.'
    };

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Order Status Update</h1>
      <p>Hi ${user.name},</p>
      <p>Your order <strong>#${order.orderNumber}</strong> status has been updated to: <strong>${newStatus}</strong></p>
      <p>${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
      
      <p style="margin-top: 30px;">Best regards,<br>The Apexify Team</p>
    </div>
  `;

    return sendEmail({
        email: user.email,
        subject: `Order Update - #${order.orderNumber}`,
        html
    });
};

// Welcome email
export const sendWelcomeEmail = async (user) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to Apexify!</h1>
      <p>Hi ${user.name},</p>
      <p>Thank you for joining Apexify, your multi-vendor marketplace.</p>
      ${user.role === 'vendor' ? '<p>As a vendor, you can now start listing your products and reach customers worldwide!</p>' : '<p>Start browsing products from our amazing vendors.</p>'}
      <p style="margin-top: 30px;">Best regards,<br>The Apexify Team</p>
    </div>
  `;

    return sendEmail({
        email: user.email,
        subject: 'Welcome to Apexify!',
        html
    });
};

export default sendEmail;
