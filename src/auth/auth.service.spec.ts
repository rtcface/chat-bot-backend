import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { ApiKey, ApiKeyPermission } from '../shared/entities/api-key.entity';
import { User } from '../shared/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let apiKeyRepository: Repository<ApiKey>;
  let userRepository: Repository<User>;

  const mockApiKeyRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    apiKeyRepository = module.get<Repository<ApiKey>>(
      getRepositoryToken(ApiKey),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateApiKey', () => {
    it('should return user and permissions when API key is valid', async () => {
      const mockApiKey = {
        id: '1',
        key: 'test-key',
        status: 'active',
        permissions: [ApiKeyPermission.READ, ApiKeyPermission.WRITE],
        user: { id: '1', name: 'Test User' },
      };

      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.validateApiKey('test-key');

      expect(result).toEqual({
        isValid: true,
        user: mockApiKey.user,
        permissions: mockApiKey.permissions,
        apiKey: mockApiKey,
      });
    });

    it('should return invalid when API key does not exist', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(null);

      const result = await service.validateApiKey('invalid-key');

      expect(result).toEqual({
        isValid: false,
        user: null,
        permissions: [],
        apiKey: null,
      });
    });

    it('should return invalid when API key is inactive', async () => {
      const mockApiKey = {
        id: '1',
        key: 'test-key',
        status: 'inactive',
        permissions: [ApiKeyPermission.READ],
        user: { id: '1', name: 'Test User' },
      };

      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.validateApiKey('test-key');

      expect(result).toEqual({
        isValid: false,
        user: null,
        permissions: [],
        apiKey: null,
      });
    });

    it('should return invalid when API key is expired', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const mockApiKey = {
        id: '1',
        key: 'test-key',
        status: 'active',
        permissions: ['read'],
        expiresAt: expiredDate,
        user: { id: '1', name: 'Test User' },
      };

      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.validateApiKey('test-key');

      expect(result).toEqual({
        isValid: false,
        user: null,
        permissions: [],
        apiKey: null,
      });
    });
  });

  describe('generateApiKey', () => {
    it('should generate a new API key for user', async () => {
      const mockUser = { id: '1', name: 'Test User' };
      const mockApiKey = {
        id: '1',
        key: 'generated-key',
        name: 'Test Key',
        permissions: [ApiKeyPermission.READ, ApiKeyPermission.WRITE],
        user: mockUser,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApiKeyRepository.create.mockReturnValue(mockApiKey);
      mockApiKeyRepository.save.mockResolvedValue(mockApiKey);

      const result = await service.generateApiKey('1', 'Test Key', [
        ApiKeyPermission.READ,
        ApiKeyPermission.WRITE,
      ]);

      expect(result).toEqual(mockApiKey);
      expect(mockApiKeyRepository.create).toHaveBeenCalledWith({
        key: expect.any(String),
        name: 'Test Key',
        permissions: [ApiKeyPermission.READ, ApiKeyPermission.WRITE],
        userId: '1',
        status: 'active',
      });
    });

    it('should throw error when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.generateApiKey('1', 'Test Key')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke API key successfully', async () => {
      const mockApiKey = {
        id: '1',
        key: 'test-key',
        status: 'active',
      };

      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockApiKeyRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.revokeApiKey('test-key');

      expect(result).toBe(true);
      expect(mockApiKeyRepository.update).toHaveBeenCalledWith('1', {
        status: 'revoked',
      });
    });

    it('should return false when API key does not exist', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(null);

      const result = await service.revokeApiKey('invalid-key');

      expect(result).toBe(false);
    });
  });
});
