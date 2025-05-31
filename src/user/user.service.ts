import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { MailService } from '../services/mail.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private mailService: MailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );
  }

  async register(registerDto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: number;
  }) {
    // Check for existing verified users
    const existingVerifiedUser = await this.userModel.findOne({
      where: { email: registerDto.email, status: 1 },
    });

    if (existingVerifiedUser) {
      throw new BadRequestException('Email already registered');
    }

    // Check for existing unverified users
    const existingUnverifiedUser = await this.userModel.findOne({
      where: { email: registerDto.email, status: 0 },
    });

    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    if (existingUnverifiedUser) {
      // Update existing unverified user
      await existingUnverifiedUser.update({
        ...registerDto,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        role: registerDto.role || 1, // Default to member if not specified
      });
    } else {
      // Create new user
      await this.userModel.create({
        ...registerDto,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        status: 0, // unverified
        role: registerDto.role || 1, // Default to member
      });
    }

    await this.mailService.sendOtpEmail(registerDto.email, otp);
    return { message: 'OTP sent to email', email: registerDto.email };
  }

  async verifyOtp(verifyOtpDto: { email: string; otp: string }) {
    const user = await this.userModel.findOne({ 
      where: { email: verifyOtpDto.email } 
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.status === 1) throw new BadRequestException('Already verified');
    if (user.otp !== verifyOtpDto.otp) throw new BadRequestException('Invalid OTP');
    if (new Date(user.otpExpiresAt) < new Date()) throw new BadRequestException('OTP expired');

    const accessToken = this.generateAccessToken(user);

    await user.update({
      status: 1, // active
      otp: null,
      otpExpiresAt: null,
      verifiedAt: new Date(),
      accessToken,
    });

    return {
      message: 'Account verified',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.userModel.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Check if account is verified
    if (user.status !== 1) {
      throw new BadRequestException('Account not verified. Please verify your email first');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user);

    // Update last login and access token
    await user.update({
      accessToken,
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    };
  }

  async resendOtp(email: string) {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.status === 1) {
      throw new BadRequestException('Account already verified');
    }

    // Check if OTP was sent less than 1 minute ago
    if (user.otpExpiresAt && new Date(user.otpExpiresAt.getTime() - 4 * 60 * 1000) > new Date()) {
      throw new BadRequestException('Please wait before requesting a new OTP');
    }

    // Generate new OTP
    const otp = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update user with new OTP
    await user.update({
      otp,
      otpExpiresAt,
    });

    // Send OTP email
    await this.mailService.sendOtpEmail(user.email, otp);

    return {
      message: 'New OTP sent to your email',
      email: user.email,
    };
  }
}