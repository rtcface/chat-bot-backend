import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationsService } from './conversations.service';
import {
  Conversation,
  ConversationStatus,
} from '../shared/entities/conversation.entity';
import { Message, MessageRole } from '../shared/entities/message.entity';
import { User } from '../shared/entities/user.entity';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let conversationRepository: Repository<Conversation>;
  let messageRepository: Repository<Message>;
  let userRepository: Repository<User>;

  const mockConversationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    conversationRepository = module.get<Repository<Conversation>>(
      getRepositoryToken(Conversation),
    );
    messageRepository = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const mockUser = { id: '1', name: 'Test User' };
      const mockConversation = {
        id: '1',
        title: 'New Conversation',
        userId: '1',
        user: mockUser,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockConversationRepository.create.mockReturnValue(mockConversation);
      mockConversationRepository.save.mockResolvedValue(mockConversation);

      const result = await service.create('1', 'New Conversation');

      expect(result).toEqual(mockConversation);
      expect(mockConversationRepository.create).toHaveBeenCalledWith({
        title: 'New Conversation',
        userId: '1',
        status: ConversationStatus.ACTIVE,
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create('999', 'Test')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('findOne', () => {
    it('should return conversation with messages', async () => {
      const mockConversation = {
        id: '1',
        title: 'Test Conversation',
        messages: [],
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);

      const result = await service.findOne('1');

      expect(result).toEqual(mockConversation);
    });
  });

  describe('findUserConversations', () => {
    it('should return paginated user conversations', async () => {
      const mockConversations = [
        { id: '1', title: 'Conversation 1' },
        { id: '2', title: 'Conversation 2' },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockConversations, 2]),
      };

      mockConversationRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findUserConversations('1', 1, 10);

      expect(result.conversations).toEqual(mockConversations);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('addMessage', () => {
    it('should add message to conversation', async () => {
      const mockConversation = {
        id: '1',
        messageCount: 5,
        lastActivityAt: new Date(),
      };

      const mockMessage = {
        id: '1',
        content: 'Test message',
        role: MessageRole.USER,
        conversationId: '1',
        tokenCount: 10,
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.create.mockReturnValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);
      mockConversationRepository.save.mockResolvedValue({
        ...mockConversation,
        messageCount: 6,
      });

      const result = await service.addMessage('1', {
        content: 'Test message',
        role: MessageRole.USER,
        tokenCount: 10,
      });

      expect(result).toEqual(mockMessage);
    });
  });

  describe('updateLastActivity', () => {
    it('should update conversation last activity', async () => {
      const mockConversation = { id: '1', title: 'Test' };

      mockConversationRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateLastActivity('1');

      expect(result).toBe(true);
    });
  });
});
