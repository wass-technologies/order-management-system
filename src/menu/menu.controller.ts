import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards,Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PaginationDto } from 'src/pagination.dto';
import{CurrentUser} from 'src/auth/decorators/current-user.decorator';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
// crete menu item
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('RESTAURANT')  
  @Post('create')
  async addMenu(
    @Body() createMenuDto: CreateMenuDto) {
    return this.menuService.addMenuItem(createMenuDto);
  }


   
  @Get('company/:companyId')
  async getMenuByCompany(
    @Param('companyId') companyId: string,
    @Query() paginationDto: CommonPaginationDto
  ) {
    return this.menuService.getMenuByCompanyId(companyId, paginationDto);
  }
  

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('RESTAURANT') 
  @Patch(':menuId')
  async updateMenuItem(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto
  ) {
    return this.menuService.updateMenuItem(menuId, updateMenuDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('RESTAURANT') 
  @Delete(':menuId')
async deleteMenu(@Param('menuId') menuId: string) {
  return this.menuService.deleteMenuItem(menuId);
}
}
