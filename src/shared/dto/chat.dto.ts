import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can you help me?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description:
      'Conversation ID (optional, creates new conversation if not provided)',
    example: 'uuid-conversation-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({
    description: 'Role configuration ID (optional)',
    example: 'uuid-role-id',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiProperty({
    description: 'AI model to use (optional, uses default if not specified)',
    example: 'deepseek-chat',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    description: 'Temperature for response generation (0.0 to 2.0)',
    example: 0.7,
    required: false,
    minimum: 0,
    maximum: 2,
  })
  @IsOptional()
  temperature?: number;

  @ApiProperty({
    description: 'Maximum tokens to generate',
    example: 1000,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  maxTokens?: number;

  @ApiProperty({
    description: 'Additional metadata',
    example: { source: 'web', userAgent: 'Chrome' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'uuid-message-id',
  })
  id: string;

  @ApiProperty({
    description: 'Message role',
    example: 'assistant',
    enum: ['user', 'assistant', 'system'],
  })
  role: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello! I can help you with various tasks...',
  })
  content: string;

  @ApiProperty({
    description: 'Token count used',
    example: 150,
  })
  tokenCount: number;

  @ApiProperty({
    description: 'Model used for generation',
    example: 'deepseek-chat',
  })
  modelUsed: string;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2024-01-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Additional metadata',
    example: {
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 140 },
    },
    required: false,
  })
  metadata?: Record<string, any>;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'AI response message',
    type: MessageResponseDto,
  })
  message: MessageResponseDto;

  @ApiProperty({
    description: 'Conversation ID',
    example: 'uuid-conversation-id',
  })
  conversationId: string;

  @ApiProperty({
    description: 'Session ID for multi-turn conversations',
    example: 'session-12345',
  })
  sessionId: string;
}

export class ConversationDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'uuid-conversation-id',
  })
  id: string;

  @ApiProperty({
    description: 'Conversation title',
    example: 'Chat about NestJS development',
  })
  title: string;

  @ApiProperty({
    description: 'Conversation status',
    example: 'active',
    enum: ['active', 'archived', 'deleted'],
  })
  status: string;

  @ApiProperty({
    description: 'Session ID',
    example: 'session-12345',
    required: false,
  })
  sessionId?: string;

  @ApiProperty({
    description: 'Message count in conversation',
    example: 15,
  })
  messageCount: number;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2024-01-01T12:00:00.000Z',
    required: false,
  })
  lastActivityAt?: Date;

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

export class CreateConversationDto {
  @ApiProperty({
    description: 'Conversation title',
    example: 'New chat conversation',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Initial system message',
    example: 'You are a helpful assistant.',
    required: false,
  })
  @IsOptional()
  @IsString()
  systemMessage?: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { tags: ['important', 'work'] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ConversationHistoryDto {
  @ApiProperty({
    description: 'Conversation details',
    type: ConversationDto,
  })
  conversation: ConversationDto;

  @ApiProperty({
    description: 'List of messages in the conversation',
    type: [MessageResponseDto],
  })
  messages: MessageResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 20 },
      total: { type: 'number', example: 150 },
      totalPages: { type: 'number', example: 8 },
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
