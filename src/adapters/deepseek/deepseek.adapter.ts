import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAiAdapter } from '../base/base-ai-adapter';
import {
  ChatRequest,
  ChatResponse,
  ModelInfo,
} from '../interfaces/ai-adapter.interface';

@Injectable()
export class DeepSeekAdapter extends BaseAiAdapter {
  private readonly baseUrl = 'http://localhost:8080/api/v1';

  constructor(configService: ConfigService) {
    super(configService);
  }

  private get apiKey(): string {
    return this.configService.get('DEEPSEEK_API_KEY');
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    this.validateRequest(request);

    if (!this.isConfigured()) {
      throw new Error('DeepSeek API key not configured');
    }

    try {
      const messages = this.buildMessages(request);
      const model = request.model || this.getDefaultModel();

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1000,
          stream: false,
        }),
      });

      if (!response.ok) {
        await this.handleApiError({
          status: response.status,
          message: response.statusText,
        });
      }

      const data = await response.json();

      return {
        message: data.choices[0].message.content,
        model: data.model,
        tokenCount:
          data.usage?.total_tokens ||
          this.estimateTokenCount(data.choices[0].message.content),
        finishReason: data.choices[0].finish_reason,
        metadata: {
          provider: this.getProviderName(),
          model: data.model,
          usage: data.usage,
        },
      };
    } catch (error) {
      await this.handleApiError(error);
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();

      return data.data.map((model) => ({
        id: model.id,
        name: model.id,
        provider: this.getProviderName(),
        contextWindow: this.getContextWindow(model.id),
        supportsStreaming: true,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch DeepSeek models', error);
      // Return default models if API call fails
      return this.getDefaultModels();
    }
  }

  getProviderName(): string {
    return 'deepseek';
  }

  isConfigured(): boolean {
    return !!this.configService.get('DEEPSEEK_API_KEY');
  }

  getRateLimitInfo(): { requestsPerMinute: number; requestsPerHour: number } {
    return {
      requestsPerMinute: 60, // DeepSeek rate limits
      requestsPerHour: 1000,
    };
  }

  protected getDefaultModel(): string {
    return 'deepseek-r1:1.5b';
  }

  protected getApiBaseUrl(): string {
    return this.baseUrl;
  }

  private getContextWindow(modelId: string): number {
    // DeepSeek context windows
    const contextWindows = {
      'deepseek-chat': 32768,
      'deepseek-coder': 16384,
    };
    return contextWindows[modelId] || 4096;
  }

  private getDefaultModels(): ModelInfo[] {
    return [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        provider: 'deepseek',
        contextWindow: 32768,
        supportsStreaming: true,
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        provider: 'deepseek',
        contextWindow: 16384,
        supportsStreaming: true,
      },
    ];
  }
}
