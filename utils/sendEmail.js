import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

// Modern email templates
const getRegistrationTemplate = (userName, contestName, contestDate, contestTime) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contest Registration Confirmed</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
            }
            .welcome {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2d3748;
            }
            .contest-card {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
            }
            .contest-title {
                font-size: 22px;
                font-weight: 700;
                margin-bottom: 15px;
            }
            .contest-details {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .detail-item {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
            }
            .icon {
                width: 20px;
                height: 20px;
                opacity: 0.9;
            }
            .tips {
                background-color: #f7fafc;
                border-left: 4px solid #4299e1;
                padding: 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
            }
            .tips h3 {
                color: #2b6cb0;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .tips ul {
                padding-left: 20px;
            }
            .tips li {
                margin-bottom: 8px;
                color: #4a5568;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
                transition: transform 0.2s ease;
            }
            .footer {
                background-color: #2d3748;
                color: #cbd5e0;
                padding: 30px;
                text-align: center;
            }
            .footer-links {
                margin-bottom: 20px;
            }
            .footer-links a {
                color: #90cdf4;
                text-decoration: none;
                margin: 0 15px;
            }
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                }
                .header, .content, .footer {
                    padding: 25px 20px;
                }
                .contest-card {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 DevForces</h1>
                <p>Development Contest Platform</p>
            </div>

            <div class="content">
                <div class="welcome">
                    Hello <strong>${userName}</strong>! 👋
                </div>

                <p>Great news! You've successfully registered for the upcoming development contest. Get ready to showcase your coding skills and compete with the best developers!</p>

                <div class="contest-card">
                    <div class="contest-title">📋 ${contestName}</div>
                    <div class="contest-details">
                        <div class="detail-item">
                            <span class="icon">📅</span>
                            <span><strong>Date:</strong> ${contestDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="icon">⏰</span>
                            <span><strong>Time:</strong> ${contestTime}</span>
                        </div>
                        <div class="detail-item">
                            <span class="icon">💻</span>
                            <span><strong>Platform:</strong> DevForces</span>
                        </div>
                    </div>
                </div>

                <div class="tips">
                    <h3>💡 Contest Preparation Tips</h3>
                    <ul>
                        <li>Review the contest rules and scoring system</li>
                        <li>Test your development environment beforehand</li>
                        <li>Prepare your favorite code templates and snippets</li>
                        <li>Join our Discord for real-time updates</li>
                        <li>Get a good night's sleep before the contest!</li>
                    </ul>
                </div>

                <p>We'll send you a reminder 24 hours before the contest begins. In the meantime, you can practice on our platform and connect with other participants.</p>


            </div>

            <div class="footer">
                <div class="footer-links">
                    <a href="https://devforces.com">Platform</a>
                    <a href="https://devforces.com/leaderboard">Leaderboard</a>
                    <a href="https://devforces.com/support">Support</a>
                </div>
                <p>&copy; 2025 DevForces. All rights reserved.</p>
                <p style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
                    Happy coding! 🎯
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const textTemplate = `
    🚀 DevForces - Contest Registration Confirmed

    Hello ${userName}!

    Great news! You've successfully registered for the upcoming development contest.

    Contest Details:
    📋 Name: ${contestName}
    📅 Date: ${contestDate}
    ⏰ Time: ${contestTime}
    💻 Platform: DevForces

    Contest Preparation Tips:
    • Review the contest rules and scoring system
    • Test your development environment beforehand
    • Prepare your favorite code templates and snippets
    • Join our Discord for real-time updates
    • Get a good night's sleep before the contest!

    We'll send you a reminder 24 hours before the contest begins.

    View contest details: https://devforces.com/contest/${contestName.replace(/\s+/g, '-').toLowerCase()}

    Happy coding! 🎯
    DevForces Team
    `;

    return { htmlTemplate, textTemplate };
};

const getUnregistrationTemplate = (userName, contestName, contestDate) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contest Unregistration Confirmed</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .unregister-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }
            .message {
                font-size: 18px;
                margin-bottom: 25px;
                color: #2d3748;
            }
            .contest-info {
                background-color: #fed7d7;
                border: 1px solid #feb2b2;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
                color: #742a2a;
            }
            .future-contests {
                background-color: #f0fff4;
                border-left: 4px solid #48bb78;
                padding: 20px;
                margin: 25px 0;
                border-radius: 0 8px 8px 0;
                text-align: left;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 10px;
            }
            .footer {
                background-color: #2d3748;
                color: #cbd5e0;
                padding: 30px;
                text-align: center;
            }
            .footer-links a {
                color: #90cdf4;
                text-decoration: none;
                margin: 0 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 DevForces</h1>
                <p>Development Contest Platform</p>
            </div>

            <div class="content">
                <div class="unregister-icon">😔</div>

                <div class="message">
                    Hello <strong>${userName}</strong>,<br>
                    We've successfully processed your unregistration request.
                </div>

                <div class="contest-info">
                    <strong>You've been unregistered from:</strong><br>
                    📋 ${contestName}<br>
                    📅 ${contestDate}
                </div>

                <p>We're sorry to see you go! We hope you'll join us for future contests. Your spot is now available for other developers.</p>

                <div class="future-contests">
                    <h3>🌟 Don't Miss Future Contests!</h3>
                    <p>Stay updated on upcoming development contests and challenges. We regularly host contests covering various technologies and difficulty levels.</p>
                </div>


            </div>

            <div class="footer">
                <div class="footer-links">
                    <a href="https://devforces.com">Platform</a>
                    <a href="https://devforces.com/contests">Contests</a>
                    <a href="https://devforces.com/support">Support</a>
                </div>
                <p>&copy; 2025 DevForces. All rights reserved.</p>
                <p style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
                    Hope to see you in future contests! 🎯
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const textTemplate = `
    🚀 DevForces - Contest Unregistration Confirmed

    Hello ${userName},

    We've successfully processed your unregistration request.

    You've been unregistered from:
    📋 ${contestName}
    📅 ${contestDate}

    We're sorry to see you go! We hope you'll join us for future contests.

    Don't Miss Future Contests!
    Stay updated on upcoming development contests and challenges.

    Browse upcoming contests: https://devforces.com/contests
    Practice problems: https://devforces.com/practice

    Hope to see you in future contests! 🎯
    DevForces Team
    `;

    return { htmlTemplate, textTemplate };
};

// Main email sending functions
async function sendRegistrationEmail(email, userName, contestName, contestDate, contestTime) {
    try {


        const { htmlTemplate, textTemplate } = getRegistrationTemplate(userName, contestName, contestDate, contestTime);

        const mailOptions = {
            from: 'DevForces Platform <noreply@devforces.stravixglobaltech.com>',
            to: email,
            subject: `🎉 Registration Confirmed - ${contestName}`,
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
            console.error(`Error sending Registration email:`, error);
            throw new Error(`Failed to send Registration email: ${error.message}`);
        }

        console.log(`Registration email sent successfully to ${email}`);


        return {
            success: true,
            messageId: data.id,
            email: email,
            type: 'registration'
        };


    } catch (error) {
        console.error(`Error sending registration email: ${error.message}`);
        throw new Error(`Failed to send registration email: ${error.message}`);
    }
}

async function sendUnregistrationEmail(email, userName, contestName, contestDate) {
    try {


        const { htmlTemplate, textTemplate } = getUnregistrationTemplate(userName, contestName, contestDate);

        const mailOptions = {
            from: 'DevForces Platform <noreply@devforces.stravixglobaltech.com>',
            to: email,
            subject: `✅ Unregistration Confirmed - ${contestName}`,
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
            console.error(`Error sending Unregistration email:`, error);
            throw new Error(`Failed to send Unregistration email: ${error.message}`);
        }

        console.log(`Unregistration email sent successfully to ${email}`);


        return {
            success: true,
            messageId: data.id,
            email: email,
            type: 'unregistration'
        };


    } catch (error) {
        console.error(`Error sending unregistration email: ${error.message}`);
        throw new Error(`Failed to send unregistration email: ${error.message}`);
    }
}

// Export both functions
export { sendRegistrationEmail, sendUnregistrationEmail };


