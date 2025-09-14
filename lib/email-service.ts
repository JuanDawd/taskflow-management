import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailNotificationData {
	to: string
	userName: string
	title: string
	message: string
	type: 'TASK_CREATED' | 'TASK_COMPLETED' | 'COMMENT_ADDED'
	projectName?: string
	taskTitle?: string
}

export async function sendNotificationEmail(data: EmailNotificationData) {
	try {
		console.log('📧 Sending email notification to:', data.to)

		const result = await resend.emails.send({
			from: 'Task Notifications <onboarding@resend.dev>', // Using Resend's dev domain
			to: data.to,
			subject: data.title,
			html: generateEmailTemplate(data),
		})

		console.log('✅ Email sent successfully:', result)
		return result
	} catch (error) {
		console.error('❌ Error sending email:', error)
		throw error
	}
}

function generateEmailTemplate(data: EmailNotificationData): string {
	return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { padding: 20px; }
          .footer { font-size: 12px; color: #666; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${data.title}</h2>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            <p>${data.message}</p>
            ${
							data.projectName
								? `<p><strong>Project:</strong> ${data.projectName}</p>`
								: ''
						}
            ${
							data.taskTitle
								? `<p><strong>Task:</strong> ${data.taskTitle}</p>`
								: ''
						}
          </div>
          <div class="footer">
            <p>This is an automated notification from your project management system.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
