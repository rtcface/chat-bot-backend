import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DeepSeekAdapter } from './deepseek.adapter';
import { ChatRequest, ChatResponse } from '../interfaces/ai-adapter.interface';

describe('DeepSeekAdapter', () => {
  let adapter: DeepSeekAdapter;
  let configService: ConfigService;
  let mockConfigService: { get: jest.Mock };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DeepSeekAdapter,
          useFactory: (config: ConfigService) => {
            return new DeepSeekAdapter(config);
          },
          inject: [ConfigService],
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    adapter = module.get<DeepSeekAdapter>(DeepSeekAdapter);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('isConfigured', () => {
    it('should return true when API key is configured', () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      expect(adapter.isConfigured()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(adapter.isConfigured()).toBe(false);
    });
  });

  describe('getProviderName', () => {
    it('should return "deepseek"', () => {
      expect(adapter.getProviderName()).toBe('deepseek');
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return rate limit information', () => {
      const rateLimit = adapter.getRateLimitInfo();
      expect(rateLimit).toHaveProperty('requestsPerMinute');
      expect(rateLimit).toHaveProperty('requestsPerHour');
      expect(rateLimit.requestsPerMinute).toBeGreaterThan(0);
      expect(rateLimit.requestsPerHour).toBeGreaterThan(0);
    });
  });

  describe('sendMessage', () => {
    it('should throw error when not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(adapter.sendMessage(request)).rejects.toThrow(
        'DeepSeek API key not configured',
      );
    });

    it('should validate request parameters', async () => {
      mockConfigService.get.mockReturnValue('test-key');
      const request: ChatRequest = {
        messages: [],
      };

      await expect(adapter.sendMessage(request)).rejects.toThrow(
        'Messages array cannot be empty',
      );
    });

    it('should handle API response correctly', async () => {
      mockConfigService.get.mockReturnValue('test-key');

      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [
                {
                  message: { content: 'Test response' },
                  finish_reason: 'stop',
                },
              ],
              usage: { total_tokens: 50 },
            }),
        }),
      ) as jest.Mock;

      const request: ChatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const response = await adapter.sendMessage(request);

      expect(response).toBeInstanceOf(Object);
      expect(response.message).toBe('Test response');
      expect(response.tokenCount).toBe(50);
      expect(response.finishReason).toBe('stop');
    });
  });

  describe('getModels', () => {
    it('should return available models', async () => {
      mockConfigService.get.mockReturnValue('test-key');

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                { id: 'deepseek-chat', object: 'model' },
                { id: 'deepseek-coder', object: 'model' },
              ],
            }),
        }),
      ) as jest.Mock;

      const models = await adapter.getModels();

      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('provider', 'deepseek');
    });
  });
});
