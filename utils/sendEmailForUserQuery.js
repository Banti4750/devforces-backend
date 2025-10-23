import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();


const resend = new Resend(process.env.RESEND_API_KEY);
function getQueryResolveTemplate(userName, querySubject, queryMessage, adminReply) {
    const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
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
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 30px;
                }
                .greeting {
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: #333;
                }
                .query-box {
                    background: #f8f9fa;
                    border-left: 4px solid #667eea;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .query-label {
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 5px;
                }
                .reply-box {
                    background: #e8f5e9;
                    border-left: 4px solid #4caf50;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .status-badge {
                    display: inline-block;
                    background: #4caf50;
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 14px;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Query Resolved</h1>
                </div>
                <div class="content">
                    <p class="greeting">Hello ${userName},</p>
                    <p>Great news! Your query has been resolved by our admin team.</p>
                    <span class="status-badge">Resolved</span>

                    <div class="query-box">
                        <div class="query-label">Your Query Subject:</div>
                        <p>${querySubject}</p>

                        <div class="query-label">Your Message:</div>
                        <p>${queryMessage}</p>
                    </div>

                    <div class="reply-box">
                        <div class="query-label" style="color: #4caf50;">Admin Reply:</div>
                        <p>${adminReply || 'Your query has been resolved.'}</p>
                    </div>

                    <p>If you have any further questions, feel free to reach out to us again.</p>
                    <p>Best regards,<br><strong>DevForces Platform Team</strong></p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} DevForces Platform. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply directly to this message.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const textTemplate = `
Query Resolved - DevForces Platform

Hello ${userName},

Great news! Your query has been resolved by our admin team.

Status: Resolved

Your Query Subject: ${querySubject}

Your Message: ${queryMessage}

Admin Reply: ${adminReply || 'Your query has been resolved.'}

If you have any further questions, feel free to reach out to us again.

Best regards,
DevForces Platform Team

© ${new Date().getFullYear()} DevForces Platform. All rights reserved.
This is an automated email. Please do not reply directly to this message.
    `;

    return { htmlTemplate, textTemplate };
}


export async function sendQueryResolveEmail(email, userName, querySubject, queryMessage, adminReply) {
    try {

        const { htmlTemplate, textTemplate } = getQueryResolveTemplate(
            userName,
            querySubject,
            queryMessage,
            adminReply
        );


        const mailOptions = {
            from: 'DevForces Platform <noreply@devforces.stravixglobaltech.com>',
            to: email,
            subject: `✅ Query Resolved - ${querySubject}`,
            text: textTemplate,
            html: htmlTemplate,
            headers: {
                'X-Priority': '3',
                'X-MSMail-Priority': 'Normal',
                'Importance': 'normal'
            }
        };


        const { data, error } = await resend.emails.send(mailOptions);

        if (error) {
            console.error(`Error sending query email:`, error);
            throw new Error(`Failed to send query email: ${error.message}`);
        }

        console.log(`Query Resolve email sent successfully to ${email}`);


        return {
            success: true,
            messageId: data.id,
            email: email,
            type: 'Query Resolve'
        };

    } catch (error) {
        console.error(`Error sending Query Resolve email: ${error.message}`);
        throw new Error(`Failed to send Query Resolve email: ${error.message}`);
    }
}

