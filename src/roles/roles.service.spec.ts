import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role, RoleType } from '../shared/entities/role.entity';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: Repository<Role>;

  const mockRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active roles', async () => {
      const mockRoles = [
        { id: '1', name: 'Assistant', isActive: true },
        { id: '2', name: 'Expert', isActive: true },
      ];

      mockRoleRepository.find.mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const mockRole = { id: '1', name: 'Assistant', isActive: true };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.findOne('1');

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', isActive: true },
      });
    });

    it('should return null if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new custom role', async () => {
      const createRoleDto = {
        name: 'Custom Assistant',
        description: 'A custom assistant role',
        systemPrompt: 'You are a helpful assistant.',
        configuration: { temperature: 0.7 },
      };

      const mockRole = {
        id: '1',
        ...createRoleDto,
        type: RoleType.CUSTOM,
        isActive: true,
      };

      mockRoleRepository.create.mockReturnValue(mockRole);
      mockRoleRepository.save.mockResolvedValue(mockRole);

      const result = await service.create(createRoleDto);

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        ...createRoleDto,
        type: RoleType.CUSTOM,
        isActive: true,
      });
    });

    it('should throw error if role name already exists', async () => {
      const createRoleDto = {
        name: 'Assistant',
        description: 'A test role',
        systemPrompt: 'You are a helpful assistant.',
      };

      mockRoleRepository.findOne.mockResolvedValue({
        id: '1',
        name: 'Assistant',
      });

      await expect(service.create(createRoleDto)).rejects.toThrow(
        'Role name already exists',
      );
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const updateRoleDto = {
        description: 'Updated description',
        systemPrompt: 'Updated prompt',
      };

      const existingRole = {
        id: '1',
        name: 'Assistant',
        description: 'Old description',
        systemPrompt: 'Old prompt',
      };

      const updatedRole = {
        ...existingRole,
        ...updateRoleDto,
      };

      mockRoleRepository.findOne.mockResolvedValue(existingRole);
      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const result = await service.update('1', updateRoleDto);

      expect(result).toEqual(updatedRole);
    });

    it('should throw error if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', { description: 'Test' }),
      ).rejects.toThrow('Role not found');
    });
  });

  describe('remove', () => {
    it('should deactivate a role', async () => {
      const mockRole = { id: '1', name: 'Assistant', isActive: true };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleRepository.save.mockResolvedValue({
        ...mockRole,
        isActive: false,
      });

      const result = await service.remove('1');

      expect(result.isActive).toBe(false);
    });

    it('should throw error if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow('Role not found');
    });
  });

  describe('findByName', () => {
    it('should return role by name', async () => {
      const mockRole = { id: '1', name: 'Assistant', isActive: true };

      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.findByName('Assistant');

      expect(result).toEqual(mockRole);
    });
  });
});
