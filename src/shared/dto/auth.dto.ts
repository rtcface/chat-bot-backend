import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User role (optional, defaults to user)',
    example: 'user',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'uuid' },
      email: { type: 'string', example: 'user@example.com' },
      name: { type: 'string', example: 'John Doe' },
      role: { type: 'string', example: 'user' },
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;
}

export class ApiKeyResponseDto {
  @ApiProperty({
    description: 'Generated API key',
    example: 'sk-abcd1234efgh5678ijkl9012',
  })
  apiKey: string;

  @ApiProperty({
    description: 'API key name',
    example: 'My Chatbot Key',
  })
  name: string;

  @ApiProperty({
    description: 'API key permissions',
    example: ['read', 'write'],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    description: 'API key expiration date (optional)',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  expiresAt?: Date;
}
