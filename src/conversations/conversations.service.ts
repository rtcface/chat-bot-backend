import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Conversation,
  ConversationStatus,
} from '../shared/entities/conversation.entity';
import { Message, MessageRole } from '../shared/entities/message.entity';
import { User } from '../shared/entities/user.entity';

export interface CreateMessageData {
  content: string;
  role: MessageRole;
  tokenCount: number;
  modelUsed?: string;
  metadata?: Record<string, any>;
}

export interface ConversationWithMessages {
  conversations: Conversation[];
  total: number;
  totalPages: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new conversation
   */
  async create(
    userId: string,
    title?: string,
    systemMessage?: string,
  ): Promise<Conversation> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const conversation = this.conversationRepository.create({
      title: title || `Conversation ${new Date().toLocaleString()}`,
      userId,
      status: ConversationStatus.ACTIVE,
      metadata: systemMessage ? { systemMessage } : undefined,
    });

    const savedConversation =
      await this.conversationRepository.save(conversation);
    this.logger.log(
      `Created conversation ${savedConversation.id} for user ${userId}`,
    );

    return savedConversation;
  }

  /**
   * Find conversation by ID with messages
   */
  async findOne(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id, status: ConversationStatus.ACTIVE },
      relations: ['messages', 'user'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });
  }

  /**
   * Find user conversations with pagination
   */
  async findUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ConversationWithMessages> {
    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user', 'user')
      .where('conversation.userId = :userId', { userId })
      .andWhere('conversation.status = :status', {
        status: ConversationStatus.ACTIVE,
      })
      .orderBy('conversation.lastActivityAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      conversations,
      total,
      totalPages,
      pagination: {
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    messageData: CreateMessageData,
  ): Promise<Message> {
    // Verify conversation exists
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, status: ConversationStatus.ACTIVE },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Create message
    const message = this.messageRepository.create({
      ...messageData,
      conversationId,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation metadata
    await this.conversationRepository.update(conversationId, {
      messageCount: conversation.messageCount + 1,
      lastActivityAt: new Date(),
    });

    this.logger.log(
      `Added message ${savedMessage.id} to conversation ${conversationId}`,
    );

    return savedMessage;
  }

  /**
   * Get conversation messages with pagination
   */
  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      messages,
      total,
      totalPages,
    };
  }

  /**
   * Update conversation last activity
   */
  async updateLastActivity(conversationId: string): Promise<boolean> {
    try {
      const result = await this.conversationRepository.update(
        { id: conversationId },
        { lastActivityAt: new Date() },
      );

      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Failed to update last activity for conversation ${conversationId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const result = await this.conversationRepository.update(
        { id: conversationId, userId },
        { status: ConversationStatus.ARCHIVED },
      );

      if (result.affected > 0) {
        this.logger.log(
          `Archived conversation ${conversationId} for user ${userId}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to archive conversation ${conversationId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Delete conversation (soft delete)
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const result = await this.conversationRepository.update(
        { id: conversationId, userId },
        { status: ConversationStatus.DELETED },
      );

      if (result.affected > 0) {
        this.logger.log(
          `Deleted conversation ${conversationId} for user ${userId}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to delete conversation ${conversationId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Update conversation title
   */
  async updateTitle(
    conversationId: string,
    userId: string,
    title: string,
  ): Promise<boolean> {
    try {
      const result = await this.conversationRepository.update(
        { id: conversationId, userId },
        { title },
      );

      return result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Failed to update title for conversation ${conversationId}`,
        error,
      );
      return false;
    }
  }

  /**
   * Get conversation statistics for user
   */
  async getUserStats(userId: string): Promise<{
    totalConversations: number;
    activeConversations: number;
    totalMessages: number;
  }> {
    const totalConversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.userId = :userId', { userId })
      .andWhere('conversation.status != :deleted', {
        deleted: ConversationStatus.DELETED,
      })
      .getCount();

    const activeConversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.userId = :userId', { userId })
      .andWhere('conversation.status = :active', {
        active: ConversationStatus.ACTIVE,
      })
      .getCount();

    // Get total messages (this is a simplified approach)
    const totalMessages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.conversation', 'conversation')
      .where('conversation.userId = :userId', { userId })
      .getCount();

    return {
      totalConversations,
      activeConversations,
      totalMessages,
    };
  }
}
