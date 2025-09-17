-- Initial database setup for Chatbot Backend

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert default system roles
INSERT INTO roles (id, name, description, "systemPrompt", type, "isActive", "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'Assistant', 'General purpose AI assistant', 'You are a helpful and knowledgeable AI assistant. Provide accurate, concise, and helpful responses to user queries.', 'system', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Expert', 'Technical expert assistant', 'You are a technical expert with deep knowledge in software development, system architecture, and best practices. Provide detailed, technical responses with code examples when appropriate.', 'system', true, NOW(), NOW()),
  (uuid_generate_v4(), 'Creative', 'Creative writing assistant', 'You are a creative writing assistant. Help users with creative tasks, storytelling, content creation, and imaginative problem-solving.', 'system', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys (key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys ("userId");
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations ("userId");
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations ("sessionId");
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages ("conversationId");
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (name);
CREATE INDEX IF NOT EXISTS idx_roles_type ON roles (type);

-- Create a default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO users (id, email, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'admin@chatbot.com',
  'System Administrator',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;