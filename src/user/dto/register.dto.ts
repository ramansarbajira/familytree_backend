import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number (optional)', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ 
    example: 1, 
    description: 'User role (1=member, 2=admin, 3=superadmin). Defaults to 1 if not provided.',
    required: false,
    default: 1,
  })
  @IsIn([1, 2, 3])
  @IsOptional()
  role?: number;
}