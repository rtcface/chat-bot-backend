import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ConversationsService } from '../conversations/conversations.service';
import { DeepSeekAdapter } from '../adapters/deepseek/deepseek.adapter';
import { RolesService } from '../roles/roles.service';
import { Conversation } from '../shared/entities/conversation.entity';
import { Message } from '../shared/entities/message.entity';
import { Role } from '../shared/entities/role.entity';
import { User } from '../shared/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Role, User])],
  controllers: [ChatController],
  providers: [ChatService, ConversationsService, DeepSeekAdapter, RolesService],
  exports: [ChatService],
})
export class ChatModule {}
