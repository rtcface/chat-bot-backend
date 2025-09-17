import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAiAdapter,
  ChatRequest,
  ChatResponse,
  ModelInfo,
  RoleConfig,
} from '../interfaces/ai-adapter.interface';

@Injectable()
export abstract class BaseAiAdapter implements IAiAdapter {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  abstract sendMessage(request: ChatRequest): Promise<ChatResponse>;
  abstract getModels(): Promise<ModelInfo[]>;
  abstract getProviderName(): string;
  abstract isConfigured(): boolean;
  abstract getRateLimitInfo(): {
    requestsPerMinute: number;
    requestsPerHour: number;
  };

  /**
   * Build messages array with system prompt if role config is provided
   */
  protected buildMessages(request: ChatRequest): any[] {
    const messages = [];

    // Add system message if role config is provided
    if (request.roleConfig) {
      messages.push({
        role: 'system',
        content: request.roleConfig.systemPrompt,
      });
    }

    // Add conversation messages
    messages.push(
      ...request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    );

    return messages;
  }

  /**
   * Handle API errors with retry logic
   */
  protected async handleApiError(error: any, retryCount = 0): Promise<never> {
    this.logger.error(`API Error: ${error.message}`, error.stack);

    // Implement exponential backoff for rate limits
    if (error.status === 429 && retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000;
      this.logger.warn(`Rate limited, retrying in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      throw error; // Let the caller handle retry
    }

    // Handle other errors
    if (error.status === 401) {
      throw new Error('Invalid API key or authentication failed');
    }

    if (error.status === 403) {
      throw new Error('Access forbidden - check API permissions');
    }

    if (error.status >= 500) {
      throw new Error('AI service temporarily unavailable');
    }

    throw new Error(`AI service error: ${error.message}`);
  }

  /**
   * Validate request parameters
   */
  protected validateRequest(request: ChatRequest): void {
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    if (
      request.temperature !== undefined &&
      (request.temperature < 0 || request.temperature > 2)
    ) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (request.maxTokens !== undefined && request.maxTokens < 1) {
      throw new Error('Max tokens must be greater than 0');
    }
  }

  /**
   * Calculate token count (simplified estimation)
   */
  protected estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Get default model for the adapter
   */
  protected abstract getDefaultModel(): string;

  /**
   * Get API base URL for the provider
   */
  protected abstract getApiBaseUrl(): string;
}
