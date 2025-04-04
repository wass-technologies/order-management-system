
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { MenusService } from 'src/menus/menus.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { UserPermissionsService } from 'src/user-permissions/user-permissions.service';
import { AccountService } from './account.service';
import { BusinessPaginationDto, PaginationDto, StatusDto } from './dto/account.dto';
import { Account } from './entities/account.entity';
import { SearchHistoryService } from 'src/search-history/search-history.service';
import { CreateAccountDto } from 'src/account/dto/account.dto';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly searchHistoryService: SearchHistoryService,
    private readonly menuService: MenusService,
    private readonly permissionService: PermissionsService,
    private readonly userPermService: UserPermissionsService,
    
  ) { }

  @Post('add-staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
  //@CheckPermissions([PermissionAction.CREATE, 'account'])
  async create(@Body() dto: CreateAccountDto, @CurrentUser() user: Account) {
    const account = await this.accountService.create(dto, user.id);
    const menus = await this.menuService.findAll();
    const perms = await this.permissionService.findAll();
    const obj = [];
    menus.forEach((menu) => {
      perms.forEach((perm) => {
        obj.push({
          accountId: account.id,
          menuId: menu.id,
          permissionId: perm.id,
        });
      });
    });
    await this.userPermService.create(obj);
    return account;
  }


  @Get('all')
  @Roles(UserRole.ADMIN,)
  async getAllAccounts(@Body() dto: PaginationDto) {
    return this.accountService.findAllAccounts(dto);
  }
 
  @Get('RESTAURANT')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.RESTAURANT)
  profile(@CurrentUser() user: Account){
    return this.accountService.detail(user.id);
  }

  
  @Get('Customer-details')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.CUSTOMER)
  getCustomerAccount(@CurrentUser() user: Account){
    return this.accountService.userdetails(user.id);
  }
  @Get('Staff-details')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STAFF)
  getStaffacoount(@CurrentUser() user: Account){
    return this.accountService.staffdetails(user.id);
  }

  }




  
  

 




