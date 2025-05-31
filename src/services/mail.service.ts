import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const mailOptions = {
      from: process.env.NODEMAILER_FROM,
      to,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
