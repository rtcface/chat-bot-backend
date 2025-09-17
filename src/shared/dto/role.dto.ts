import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'Code Reviewer',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Specialized in code review and technical feedback',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'System prompt for the role',
    example: 'You are an expert code reviewer with years of experience...',
  })
  @IsString()
  @IsNotEmpty()
  systemPrompt: string;

  @ApiProperty({
    description: 'Additional configuration for the role',
    example: { temperature: 0.3, maxTokens: 500 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;
}

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role name (optional)',
    example: 'Senior Code Reviewer',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Role description (optional)',
    example: 'Updated description for code review role',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'System prompt for the role (optional)',
    example: 'You are a senior code reviewer...',
    required: false,
  })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({
    description: 'Additional configuration (optional)',
    example: { temperature: 0.2, maxTokens: 600 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiProperty({
    description: 'Role active status (optional)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: 'uuid-role-id',
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Code Reviewer',
  })
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Specialized in code review and technical feedback',
  })
  description: string;

  @ApiProperty({
    description: 'Role type',
    example: 'custom',
    enum: ['system', 'custom'],
  })
  type: string;

  @ApiProperty({
    description: 'System prompt',
    example: 'You are an expert code reviewer...',
  })
  systemPrompt: string;

  @ApiProperty({
    description: 'Role configuration',
    example: { temperature: 0.3, maxTokens: 500 },
    required: false,
  })
  configuration?: Record<string, any>;

  @ApiProperty({
    description: 'Role active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Usage count',
    example: 42,
  })
  usageCount: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Update timestamp',
    example: '2024-01-01T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class RolesListResponseDto {
  @ApiProperty({
    description: 'List of roles',
    type: [RoleResponseDto],
  })
  roles: RoleResponseDto[];

  @ApiProperty({
    description: 'Total number of roles',
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: 'Pagination information',
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 10 },
      totalPages: { type: 'number', example: 1 },
    },
  })
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}
