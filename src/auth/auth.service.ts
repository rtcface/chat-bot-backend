import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiKey,
  ApiKeyStatus,
  ApiKeyPermission,
} from '../shared/entities/api-key.entity';
import { User } from '../shared/entities/user.entity';
import { randomBytes } from 'crypto';

export interface ApiKeyValidationResult {
  isValid: boolean;
  user: User | null;
  permissions: ApiKeyPermission[];
  apiKey: ApiKey | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Validate an API key and return user information and permissions
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    try {
      const keyEntity = await this.apiKeyRepository.findOne({
        where: { key: apiKey },
        relations: ['user'],
      });

      if (!keyEntity) {
        return {
          isValid: false,
          user: null,
          permissions: [],
          apiKey: null,
        };
      }

      // Check if key is active
      if (keyEntity.status !== ApiKeyStatus.ACTIVE) {
        return {
          isValid: false,
          user: null,
          permissions: [],
          apiKey: null,
        };
      }

      // Check if key is expired
      if (keyEntity.expiresAt && keyEntity.expiresAt < new Date()) {
        return {
          isValid: false,
          user: null,
          permissions: [],
          apiKey: null,
        };
      }

      // Update last used timestamp
      await this.apiKeyRepository.update(keyEntity.id, {
        lastUsedAt: new Date(),
        requestCount: keyEntity.requestCount + 1,
      });

      return {
        isValid: true,
        user: keyEntity.user,
        permissions: keyEntity.permissions,
        apiKey: keyEntity,
      };
    } catch (error) {
      this.logger.error(
        `Error validating API key: ${error.message}`,
        error.stack,
      );
      return {
        isValid: false,
        user: null,
        permissions: [],
        apiKey: null,
      };
    }
  }

  /**
   * Generate a new API key for a user
   */
  async generateApiKey(
    userId: string,
    name: string,
    permissions: ApiKeyPermission[] = [
      ApiKeyPermission.READ,
      ApiKeyPermission.WRITE,
    ],
    expiresAt?: Date,
  ): Promise<ApiKey> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate secure random key
    const key = this.generateSecureKey();

    const apiKey = this.apiKeyRepository.create({
      key,
      name,
      permissions,
      userId,
      status: ApiKeyStatus.ACTIVE,
      expiresAt,
    });

    const savedApiKey = await this.apiKeyRepository.save(apiKey);
    this.logger.log(`Generated new API key for user ${userId}: ${name}`);

    return savedApiKey;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(apiKey: string): Promise<boolean> {
    try {
      const keyEntity = await this.apiKeyRepository.findOne({
        where: { key: apiKey },
      });

      if (!keyEntity) {
        return false;
      }

      await this.apiKeyRepository.update(keyEntity.id, {
        status: ApiKeyStatus.REVOKED,
      });

      this.logger.log(`Revoked API key: ${apiKey}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error revoking API key: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * List API keys for a user
   */
  async listUserApiKeys(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(
    permissions: ApiKeyPermission[],
    requiredPermission: ApiKeyPermission,
  ): boolean {
    return (
      permissions.includes(requiredPermission) ||
      permissions.includes(ApiKeyPermission.ADMIN)
    );
  }

  /**
   * Generate a secure random API key
   */
  private generateSecureKey(): string {
    // Generate 32 bytes of random data and encode as base64url
    const randomData = randomBytes(32);
    return randomData.toString('base64url');
  }
}
