import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Delete,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  SendMessageDto,
  ChatResponseDto,
  ConversationHistoryDto,
} from '../shared/dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid message or AI service error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async sendMessage(
    @Request() req,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<ChatResponseDto> {
    return this.chatService.sendMessage(req.user.id, sendMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserConversations(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.chatService.getUserConversations(req.user.id, page, limit);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
  })
  async createConversation(@Request() req, @Body() body: { title?: string }) {
    return this.chatService.createConversation(req.user.id, body.title);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation history' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation history retrieved successfully',
    type: ConversationHistoryDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found',
  })
  async getConversationHistory(
    @Param('id') conversationId: string,
  ): Promise<ConversationHistoryDto> {
    return this.chatService.getConversationHistory(conversationId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages with pagination' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.chatService.getConversationMessages(
      conversationId,
      page,
      limit,
    );
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found',
  })
  async deleteConversation(
    @Request() req,
    @Param('id') conversationId: string,
  ): Promise<{ success: boolean }> {
    const success = await this.chatService.deleteConversation(
      conversationId,
      req.user.id,
    );
    return { success };
  }

  @Put('conversations/:id/archive')
  @ApiOperation({ summary: 'Archive conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation archived successfully',
  })
  async archiveConversation(
    @Request() req,
    @Param('id') conversationId: string,
  ): Promise<{ success: boolean }> {
    const success = await this.chatService.archiveConversation(
      conversationId,
      req.user.id,
    );
    return { success };
  }

  @Put('conversations/:id/title')
  @ApiOperation({ summary: 'Update conversation title' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'Title updated successfully',
  })
  async updateConversationTitle(
    @Request() req,
    @Param('id') conversationId: string,
    @Body() body: { title: string },
  ): Promise<{ success: boolean }> {
    const success = await this.chatService.updateConversationTitle(
      conversationId,
      req.user.id,
      body.title,
    );
    return { success };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user chat statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getUserStats(@Request() req) {
    return this.chatService.getUserStats(req.user.id);
  }
}
