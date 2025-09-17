export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  sessionId?: string;
  roleConfig?: RoleConfig;
}

export interface ChatResponse {
  message: string;
  model: string;
  tokenCount: number;
  finishReason: string;
  metadata?: Record<string, any>;
}

export interface RoleConfig {
  name: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  supportsStreaming: boolean;
}

export interface IAiAdapter {
  /**
   * Send a chat request to the AI model
   */
  sendMessage(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Get available models for this adapter
   */
  getModels(): Promise<ModelInfo[]>;

  /**
   * Get the provider name (e.g., 'openai', 'anthropic', 'deepseek')
   */
  getProviderName(): string;

  /**
   * Check if the adapter is properly configured
   */
  isConfigured(): boolean;

  /**
   * Get rate limit information
   */
  getRateLimitInfo(): { requestsPerMinute: number; requestsPerHour: number };
}
