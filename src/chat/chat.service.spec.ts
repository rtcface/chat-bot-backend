import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ConversationsService } from '../conversations/conversations.service';
import { DeepSeekAdapter } from '../adapters/deepseek/deepseek.adapter';
import { RolesService } from '../roles/roles.service';
import { SendMessageDto, ChatResponseDto } from '../shared/dto/chat.dto';
import { MessageRole } from '../shared/entities/message.entity';

describe('ChatService', () => {
  let service: ChatService;
  let conversationsService: ConversationsService;
  let deepSeekAdapter: DeepSeekAdapter;
  let rolesService: RolesService;

  const mockConversationsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    addMessage: jest.fn(),
    updateLastActivity: jest.fn(),
    getConversationMessages: jest.fn(),
  };

  const mockDeepSeekAdapter = {
    sendMessage: jest.fn(),
    isConfigured: jest.fn(),
    getProviderName: jest.fn(),
  };

  const mockRolesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
        {
          provide: DeepSeekAdapter,
          useValue: mockDeepSeekAdapter,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    conversationsService =
      module.get<ConversationsService>(ConversationsService);
    deepSeekAdapter = module.get<DeepSeekAdapter>(DeepSeekAdapter);
    rolesService = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should create new conversation if none provided', async () => {
      const mockConversation = { id: '1', title: 'New Chat' };
      const mockRole = { id: '1', systemPrompt: 'You are helpful' };
      const mockAiResponse = {
        message: 'Hello! How can I help you?',
        model: 'deepseek-chat',
        tokenCount: 10,
        finishReason: 'stop',
      };

      mockConversationsService.create.mockResolvedValue(mockConversation);
      mockConversationsService.getConversationMessages.mockResolvedValue({
        messages: [],
        total: 0,
        totalPages: 0,
      });
      mockRolesService.findOne.mockResolvedValue(mockRole);
      mockDeepSeekAdapter.sendMessage.mockResolvedValue(mockAiResponse);
      mockConversationsService.addMessage.mockResolvedValue({
        id: '1',
        content: 'Hello! How can I help you?',
        role: MessageRole.ASSISTANT,
        tokenCount: 10,
      });
      mockDeepSeekAdapter.isConfigured.mockReturnValue(true);
      mockDeepSeekAdapter.getProviderName.mockReturnValue('deepseek');

      const dto: SendMessageDto = {
        content: 'Hello',
      };

      const result = await service.sendMessage('user1', dto);

      expect(result).toBeDefined();
      expect(result.message.content).toBe('Hello! How can I help you?');
      expect(mockConversationsService.create).toHaveBeenCalled();
    });

    it('should use existing conversation if provided', async () => {
      const mockConversation = { id: '1', title: 'Existing Chat' };
      const mockRole = { id: '1', systemPrompt: 'You are helpful' };
      const mockAiResponse = {
        message: 'Hello! How can I help you?',
        model: 'deepseek-chat',
        tokenCount: 10,
        finishReason: 'stop',
      };

      mockConversationsService.findOne.mockResolvedValue(mockConversation);
      mockConversationsService.getConversationMessages.mockResolvedValue({
        messages: [],
        total: 0,
        totalPages: 0,
      });
      mockRolesService.findOne.mockResolvedValue(mockRole);
      mockDeepSeekAdapter.sendMessage.mockResolvedValue(mockAiResponse);
      mockConversationsService.addMessage.mockResolvedValue({
        id: '1',
        content: 'Hello! How can I help you?',
        role: MessageRole.ASSISTANT,
        tokenCount: 10,
      });
      mockDeepSeekAdapter.isConfigured.mockReturnValue(true);
      mockDeepSeekAdapter.getProviderName.mockReturnValue('deepseek');

      const dto: SendMessageDto = {
        content: 'Hello',
        conversationId: '1',
      };

      const result = await service.sendMessage('user1', dto);

      expect(result).toBeDefined();
      expect(result.message.content).toBe('Hello! How can I help you?');
      expect(mockConversationsService.findOne).toHaveBeenCalledWith('1');
      expect(mockConversationsService.create).toHaveBeenCalledWith(
        'user1',
        'Hello',
      );
    });

    it('should throw error if AI adapter is not configured', async () => {
      mockDeepSeekAdapter.isConfigured.mockReturnValue(false);

      const dto: SendMessageDto = {
        content: 'Hello',
      };

      await expect(service.sendMessage('user1', dto)).rejects.toThrow(
        'AI service not configured',
      );
    });

    it('should handle role configuration', async () => {
      const mockConversation = { id: '1', title: 'Role Chat' };
      const mockRole = { id: '1', systemPrompt: 'You are an expert' };
      const mockAiResponse = {
        message: 'As an expert, I can help you...',
        model: 'deepseek-chat',
        tokenCount: 15,
        finishReason: 'stop',
      };

      mockConversationsService.create.mockResolvedValue(mockConversation);
      mockConversationsService.getConversationMessages.mockResolvedValue({
        messages: [],
        total: 0,
        totalPages: 0,
      });
      mockRolesService.findOne.mockResolvedValue(mockRole);
      mockDeepSeekAdapter.sendMessage.mockResolvedValue(mockAiResponse);
      mockConversationsService.addMessage.mockResolvedValue({
        id: '1',
        content: 'As an expert, I can help you...',
        role: MessageRole.ASSISTANT,
        tokenCount: 15,
      });
      mockDeepSeekAdapter.isConfigured.mockReturnValue(true);
      mockDeepSeekAdapter.getProviderName.mockReturnValue('deepseek');

      const dto: SendMessageDto = {
        content: 'Hello',
        roleId: '1',
      };

      const result = await service.sendMessage('user1', dto);

      expect(result).toBeDefined();
      expect(mockRolesService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('getConversationHistory', () => {
    it('should return conversation with messages', async () => {
      const mockConversation = {
        id: '1',
        title: 'Test Chat',
        messages: [],
      };

      const mockMessagesResult = {
        messages: [
          {
            id: '1',
            content: 'Hello',
            role: MessageRole.USER,
            createdAt: new Date(),
            tokenCount: 5,
            modelUsed: 'deepseek-chat',
          },
        ],
        total: 1,
        totalPages: 1,
      };

      mockConversationsService.findOne.mockResolvedValue(mockConversation);
      mockConversationsService.getConversationMessages.mockResolvedValue(
        mockMessagesResult,
      );

      const result = await service.getConversationHistory('1');

      expect(result.conversation).toEqual(mockConversation);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('Hello');
      expect(result.pagination).toBeDefined();
    });
  });
});
