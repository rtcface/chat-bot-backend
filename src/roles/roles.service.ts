import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from '../shared/entities/role.entity';

export interface CreateRoleDto {
  name: string;
  description: string;
  systemPrompt: string;
  configuration?: Record<string, any>;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  systemPrompt?: string;
  configuration?: Record<string, any>;
  isActive?: boolean;
}

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Find all active roles
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find a role by ID
   */
  async findOne(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id, isActive: true },
    });
  }

  /**
   * Find a role by name
   */
  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name, isActive: true },
    });
  }

  /**
   * Create a new role
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new Error('Role name already exists');
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      type: RoleType.CUSTOM,
      isActive: true,
    });

    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`Created new role: ${savedRole.name}`);

    return savedRole;
  }

  /**
   * Update an existing role
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, isActive: true },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if new name conflicts with existing role
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new Error('Role name already exists');
      }
    }

    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);

    this.logger.log(`Updated role: ${updatedRole.name}`);
    return updatedRole;
  }

  /**
   * Remove (deactivate) a role
   */
  async remove(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, isActive: true },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Soft delete by deactivating
    role.isActive = false;
    const updatedRole = await this.roleRepository.save(role);

    this.logger.log(`Deactivated role: ${updatedRole.name}`);
    return updatedRole;
  }

  /**
   * Get system roles (predefined roles)
   */
  async getSystemRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { type: RoleType.SYSTEM, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get custom roles (user-created roles)
   */
  async getCustomRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { type: RoleType.CUSTOM, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Increment usage count for a role
   */
  async incrementUsageCount(id: string): Promise<void> {
    await this.roleRepository.increment({ id }, 'usageCount', 1);
  }
}
