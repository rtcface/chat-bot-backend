import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ConversationsService,
  CreateMessageData,
} from '../conversations/conversations.service';
import { DeepSeekAdapter } from '../adapters/deepseek/deepseek.adapter';
import { RolesService } from '../roles/roles.service';
import {
  SendMessageDto,
  ChatResponseDto,
  ConversationHistoryDto,
} from '../shared/dto/chat.dto';
import { MessageRole } from '../shared/entities/message.entity';
import { Conversation } from '../shared/entities/conversation.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly deepSeekAdapter: DeepSeekAdapter,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    userId: string,
    dto: SendMessageDto,
  ): Promise<ChatResponseDto> {
    // Validate AI adapter configuration
    if (!this.deepSeekAdapter.isConfigured()) {
      throw new BadRequestException('AI service not configured');
    }

    let conversation: Conversation;

    // Get or create conversation
    if (dto.conversationId) {
      conversation = await this.conversationsService.findOne(
        dto.conversationId,
      );
      if (!conversation) {
        // Create new conversation with specified ID as title reference
        const title =
          dto.content.length > 50
            ? dto.content.substring(0, 50) + '...'
            : dto.content;

        conversation = await this.conversationsService.create(userId, title);
        this.logger.log(
          `Created new conversation ${conversation.id} for user ${userId} (requested ID: ${dto.conversationId})`,
        );
      }
    } else {
      // Create new conversation
      const title =
        dto.content.length > 50
          ? dto.content.substring(0, 50) + '...'
          : dto.content;

      conversation = await this.conversationsService.create(userId, title);
      this.logger.log(
        `Created new conversation ${conversation.id} for user ${userId}`,
      );
    }

    // Get role configuration if specified
    let roleConfig = null;
    if (dto.roleId) {
      const role = await this.rolesService.findOne(dto.roleId);
      if (role) {
        roleConfig = {
          name: role.name,
          systemPrompt: role.systemPrompt,
          temperature: dto.temperature || role.configuration?.temperature,
          maxTokens: dto.maxTokens || role.configuration?.maxTokens,
        };
      }
    }

    // Add user message to conversation
    const userMessageData: CreateMessageData = {
      content: dto.content,
      role: MessageRole.USER,
      tokenCount: this.estimateTokenCount(dto.content),
      metadata: dto.metadata,
    };

    await this.conversationsService.addMessage(
      conversation.id,
      userMessageData,
    );

    // Prepare messages for AI (get recent conversation history)
    const conversationHistory =
      await this.conversationsService.getConversationMessages(
        conversation.id,
        1, // page
        20, // limit - last 20 messages for context
      );

    const messages = conversationHistory.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Send to AI and get response
    try {
      const aiRequest = {
        messages,
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        sessionId: conversation.sessionId,
        roleConfig,
      };

      const aiResponse = await this.deepSeekAdapter.sendMessage(aiRequest);

      // Add AI response to conversation
      const aiMessageData: CreateMessageData = {
        content: aiResponse.message,
        role: MessageRole.ASSISTANT,
        tokenCount: aiResponse.tokenCount,
        modelUsed: aiResponse.model,
        metadata: {
          provider: this.deepSeekAdapter.getProviderName(),
          finishReason: aiResponse.finishReason,
          usage: aiResponse.metadata?.usage,
        },
      };

      const savedAiMessage = await this.conversationsService.addMessage(
        conversation.id,
        aiMessageData,
      );

      // Update conversation activity
      await this.conversationsService.updateLastActivity(conversation.id);

      this.logger.log(
        `Processed chat message for conversation ${conversation.id}: ${aiResponse.tokenCount} tokens used`,
      );

      return {
        message: {
          id: savedAiMessage.id,
          role: savedAiMessage.role,
          content: savedAiMessage.content,
          tokenCount: savedAiMessage.tokenCount,
          modelUsed: savedAiMessage.modelUsed,
          createdAt: savedAiMessage.createdAt,
          metadata: savedAiMessage.metadata,
        },
        conversationId: conversation.id,
        sessionId: conversation.sessionId,
      };
    } catch (error) {
      this.logger.error(
        `AI service error for conversation ${conversation.id}:`,
        error,
      );

      // Add error message to conversation for tracking
      const errorMessageData: CreateMessageData = {
        content:
          'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        role: MessageRole.ASSISTANT,
        tokenCount: 20,
        metadata: { error: error.message },
      };

      await this.conversationsService.addMessage(
        conversation.id,
        errorMessageData,
      );

      throw new BadRequestException('Error processing message with AI service');
    }
  }

  /**
   * Get conversation history with messages
   */
  async getConversationHistory(
    conversationId: string,
  ): Promise<ConversationHistoryDto> {
    const conversation =
      await this.conversationsService.findOne(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Get messages with pagination (first page, reasonable limit)
    const messagesResult =
      await this.conversationsService.getConversationMessages(
        conversationId,
        1, // page
        50, // limit
      );

    return {
      conversation,
      messages: messagesResult.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        tokenCount: msg.tokenCount,
        modelUsed: msg.modelUsed || 'unknown',
        createdAt: msg.createdAt,
        metadata: msg.metadata,
      })),
      pagination: {
        page: 1,
        limit: 50,
        total: messagesResult.total,
        totalPages: messagesResult.totalPages,
      },
    };
  }

  /**
   * Get conversation messages with pagination
   */
  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const conversation =
      await this.conversationsService.findOne(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.conversationsService.getConversationMessages(
      conversationId,
      page,
      limit,
    );
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    userId: string,
    title?: string,
  ): Promise<Conversation> {
    return this.conversationsService.create(userId, title);
  }

  /**
   * Get user conversations
   */
  async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    return this.conversationsService.findUserConversations(userId, page, limit);
  }

  /**
   * Delete conversation
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    return this.conversationsService.deleteConversation(conversationId, userId);
  }

  /**
   * Archive conversation
   */
  async archiveConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    return this.conversationsService.archiveConversation(
      conversationId,
      userId,
    );
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string,
  ): Promise<boolean> {
    return this.conversationsService.updateTitle(conversationId, userId, title);
  }

  /**
   * Get user chat statistics
   */
  async getUserStats(userId: string) {
    return this.conversationsService.getUserStats(userId);
  }

  /**
   * Estimate token count for a text (simple approximation)
   */
  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}
