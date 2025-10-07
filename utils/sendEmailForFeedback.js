import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

function getFeedbackTemplate(userName, rating, feedback) {
    // Generate star rating display
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }
                .header-icon {
                    font-size: 60px;
                    margin-bottom: 10px;
                }
                .header h1 {
                    margin: 10px 0 0 0;
                    font-size: 28px;
                    font-weight: 600;
                }
                .content {
                    padding: 40px 30px;
                }
                .greeting {
                    font-size: 20px;
                    margin-bottom: 20px;
                    color: #333;
                    font-weight: 500;
                }
                .message {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #555;
                    margin-bottom: 25px;
                }
                .rating-box {
                    background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
                    color: white;
                    padding: 25px;
                    margin: 25px 0;
                    border-radius: 10px;
                    text-align: center;
                }
                .stars {
                    font-size: 32px;
                    margin: 10px 0;
                    letter-spacing: 5px;
                }
                .rating-text {
                    font-size: 18px;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .feedback-box {
                    background: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 8px;
                    font-style: italic;
                    color: #555;
                }
                .highlight-box {
                    background: #e8f4fd;
                    border: 2px dashed #667eea;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 10px;
                    text-align: center;
                }
                .highlight-box h3 {
                    color: #667eea;
                    margin: 0 0 10px 0;
                    font-size: 20px;
                }
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    margin: 20px 0;
                    transition: transform 0.3s;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                    border-top: 1px solid #e0e0e0;
                }
                .footer-icon {
                    font-size: 40px;
                    margin-bottom: 10px;
                }
                .signature {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #e0e0e0;
                    color: #555;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="header-icon">💜</div>
                    <h1>Thank You for Your Feedback!</h1>
                </div>

                <div class="content">
                    <p class="greeting">Dear ${userName},</p>

                    <p class="message">
                        We are absolutely delighted to receive your feedback! Your insights are invaluable
                        to us and help shape the future of DevForces Platform. We truly appreciate you
                        taking the time to share your thoughts with us.
                    </p>

                    <div class="rating-box">
                        <div>You rated us:</div>
                        <div class="stars">${stars}</div>
                        <div class="rating-text">${rating} out of 5 stars</div>
                    </div>

                    ${feedback ? `
                    <div class="feedback-box">
                        <strong>Your Feedback:</strong><br><br>
                        "${feedback}"
                    </div>
                    ` : ''}

                    <p class="message">
                        Your feedback has been carefully recorded and will be reviewed by our team.
                        We're constantly working to improve our platform, and voices like yours guide
                        us in the right direction.
                    </p>

                    <div class="highlight-box">
                        <h3>🌟 Your Voice Matters!</h3>
                        <p style="margin: 10px 0; color: #555;">
                            Every piece of feedback helps us create a better experience for our entire community.
                        </p>
                    </div>

                    <p class="message">
                        If you have any additional thoughts or suggestions in the future, please don't
                        hesitate to reach out. We're always here to listen!
                    </p>

                    <div class="signature">
                        <p style="margin: 5px 0;">With heartfelt gratitude,</p>
                        <p style="margin: 5px 0; font-weight: 600; font-size: 18px;">The DevForces Team</p>
                        <p style="margin: 5px 0; color: #888; font-style: italic;">Building together, growing together 🚀</p>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-icon">🙏</div>
                    <p><strong>Thank you for being part of our journey!</strong></p>
                    <p>© ${new Date().getFullYear()} DevForces Platform. All rights reserved.</p>
                    <p style="margin-top: 15px; font-size: 12px;">
                        This is an automated email. Please do not reply directly to this message.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textTemplate = `
Thank You for Your Feedback! - DevForces Platform

Dear ${userName},

We are absolutely delighted to receive your feedback! Your insights are invaluable to us and help shape the future of DevForces Platform.

Your Rating: ${stars} (${rating} out of 5 stars)

${feedback ? `Your Feedback:\n"${feedback}"\n` : ''}

Your feedback has been carefully recorded and will be reviewed by our team. We're constantly working to improve our platform, and voices like yours guide us in the right direction.

🌟 Your Voice Matters!
Every piece of feedback helps us create a better experience for our entire community.

If you have any additional thoughts or suggestions in the future, please don't hesitate to reach out. We're always here to listen!

With heartfelt gratitude,
The DevForces Team
Building together, growing together 🚀

© ${new Date().getFullYear()} DevForces Platform. All rights reserved.
This is an automated email. Please do not reply directly to this message.
    `;

    return { htmlTemplate, textTemplate };
}

export async function sendFeedbackEmail(email, userName, rating, feedback) {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD,
            },
        });

        const { htmlTemplate, textTemplate } = getFeedbackTemplate(
            userName,
            rating,
            feedback
        );

        const mailOptions = {
            from: {
                name: 'DevForces Platform',
                address: process.env.USER
            },
            to: email,
            subject: `💜 Thank You for Your Valuable Feedback!`,
            text: textTemplate,
            html: htmlTemplate,
            headers: {
                'X-Priority': '3',
                'X-MSMail-Priority': 'Normal',
                'Importance': 'normal'
            }
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`Feedback thank you email sent successfully to ${email}`);
        return {
            success: true,
            messageId: info.messageId,
            email: email,
            type: 'Feedback Thank You'
        };

    } catch (error) {
        console.error(`Error sending feedback email: ${error.message}`);
        throw new Error(`Failed to send feedback email: ${error.message}`);
    }
} 7