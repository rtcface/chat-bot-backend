import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RoleType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.CUSTOM,
  })
  type: RoleType;

  @Column('text')
  systemPrompt: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
