import { IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 1, 
    description: 'New status (0=unverified, 1=active, 2=inactive)',
  })
  @IsIn([0, 1, 2])
  status: number;
}