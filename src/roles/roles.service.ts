import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from '../shared/entities/role.entity';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Find role by ID
   */
  async findOne(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id, isActive: true },
    });
  }

  /**
   * Find role by name
   */
  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name, isActive: true },
    });
  }

  /**
   * Get all active roles
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create a new role
   */
  async create(roleData: {
    name: string;
    description: string;
    systemPrompt: string;
    type?: RoleType;
    configuration?: Record<string, any>;
  }): Promise<Role> {
    const role = this.roleRepository.create({
      ...roleData,
      type: roleData.type || RoleType.CUSTOM,
      isActive: true,
    });

    const savedRole = await this.roleRepository.save(role);
    this.logger.log(`Created role: ${savedRole.name}`);

    return savedRole;
  }

  /**
   * Update role
   */
  async update(id: string, updateData: Partial<Role>): Promise<Role> {
    const role = await this.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleRepository.update(id, updateData);
    this.logger.log(`Updated role: ${id}`);

    return this.roleRepository.findOne({ where: { id } });
  }

  /**
   * Delete role (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.roleRepository.update(id, { isActive: false });
    if (result.affected > 0) {
      this.logger.log(`Deleted role: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Get system roles (predefined roles)
   */
  async getSystemRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { type: RoleType.SYSTEM, isActive: true },
    });
  }

  /**
   * Get custom roles
   */
  async getCustomRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { type: RoleType.CUSTOM, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}
