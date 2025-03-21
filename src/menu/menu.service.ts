import { Injectable, NotFoundException,ForbiddenException ,BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CompanyDetail } from 'src/company-details/entities/company-detail.entity';
import { UserRole } from 'src/enum';
import { AvailabilityStatus } from 'src/enum';
import { PaginationDto } from 'src/pagination.dto';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';


@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepo: Repository<Menu>,
    
    @InjectRepository(CompanyDetail)
    private readonly repo: Repository<CompanyDetail>,
  ) {}

  async addMenuItem(menuDto: CreateMenuDto) {
    const { companyId, item_name, price, description,  } = menuDto;
  

    
    const restaurant = await this.repo.findOne({ where: { id: companyId  } });
    if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
    }
    const existingMenuItem = await this.menuRepo.findOne({
      where: {
        item_name, 
        company: { id: companyId  } 
      }
    });
    if (existingMenuItem) {
      throw new BadRequestException('A menu item with this name already exists for this restaurant');
    }

    
    const menuItem = this.menuRepo.create({
        item_name,
        price,
        description,
        availability: AvailabilityStatus.AVAILABLE ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.UNAVAILABLE,
        company: restaurant,
    });
    return await this.menuRepo.save(menuItem);
  }

  async getMenuByCompanyId(companyId: string, paginationDto: CommonPaginationDto) {
    const { limit = 10, offset = 0, keyword } = paginationDto;

    const company = await this.repo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const queryBuilder = this.menuRepo
      .createQueryBuilder('menu')
      .where('menu.companyId = :companyId', { companyId });

    if (keyword) {
      queryBuilder.andWhere('LOWER(menu.item_name) LIKE LOWER(:keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    const total = await queryBuilder.getCount();

    const menuItems = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      totalItems: total,
      menuItems,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  }

  async updateMenuItem(menuId: string, updateMenuDto: UpdateMenuDto) {
    const menuItem = await this.menuRepo.findOne({ where: { id: Number(menuId) } });
  
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuId} not found`);
    }
  
    Object.assign(menuItem, updateMenuDto);
    return this.menuRepo.save(menuItem);
  }


  async deleteMenuItem(menuId: string) {
    const menuItem = await this.menuRepo.findOne({ where: { id: Number(menuId) } });
  
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuId} not found`);
    }
  
    await this.menuRepo.remove(menuItem);
    return { message: 'Menu item deleted successfully' };
  }
  
  
}