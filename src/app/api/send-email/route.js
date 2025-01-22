import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function POST(request) {
  try {
    console.log('Starting email send process');
    await transporter.verify();
    console.log('Transporter verified successfully');

    const { emails, taskDetails } = await request.json();
    console.log('Received request with emails:', emails.length);

    let failedEmails = [];

    const results = await Promise.all(emails.map(async (email) => {
      try {
        const emailContent = `
          New Task Assigned:
          Title: ${taskDetails.title}
          Description: ${taskDetails.description}
          Deadline: ${taskDetails.deadline}
          Priority: ${taskDetails.priority}
        `;
        console.log(`Attempting to send email to: ${email}`);

        let info = await transporter.sendMail({
          from: `"Task Management System" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'New Task Assigned',
          text: emailContent,
          html: `<div>${emailContent.replace(/\n/g, '<br>')}</div>`,
        });
        
        console.log(`Email sent successfully to ${email}`);
        return { email, status: 'sent', messageId: info.messageId };
      } catch (error) {
        failedEmails.push(email);
        return { email, status: 'failed', error: error.message };
      }
    }));

    const sentCount = results.filter(r => r.status === 'sent').length;
    
    return NextResponse.json({ 
      status: 'success', 
      message: `Emails sent successfully to ${sentCount} recipients`, 
      results, 
      sentCount, 
      failedEmails 
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to send emails',
      details: error.message
    }, { status: 500 });
  }
}
export async function OPTIONS(request) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}