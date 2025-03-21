import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Account } from 'src/account/entities/account.entity';
;
import { CheckPermissions } from 'src/auth/decorators/permissions.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionAction, UserRole } from 'src/enum';
import { CompanyDetailsService } from './company-details.service';
import { Request } from 'express'; 
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';
import { CompanyStatus } from 'src/enum';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import{StatusDto} from './dto/company-detail.dto';


@Controller('resataurant-details')
export class CompanyDetailsController {
  constructor(private readonly companyDetailsService: CompanyDetailsService) {}


  @Put('update')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.RESTAURANT)
  async updateCompanyDetail(
    @CurrentUser() user: { accountId: string },
    @Body() updateData
  ) {
    if (!user?.accountId) {
      throw new UnauthorizedException('Invalid token');
    }
    return this.companyDetailsService.updateCompanyDetails(user.accountId, updateData);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllCompanies(@Query() paginationDto: CommonPaginationDto) {
    return this.companyDetailsService.getAllCompanies(paginationDto);
  }

  @Get(':companyId/menu')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async getMenuByCompanyIdforAdmin(
    @Param('companyId') companyId: string,
    @Query() paginationDto: CommonPaginationDto
  ) {
    return this.companyDetailsService.getMenuByCompanyIdforAdmin(companyId, paginationDto);
  }

 
  @Put(':id')
  @ApiOperation({ summary: 'For Admin' })
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.ADMIN)
 // @CheckPermissions([PermissionAction.UPDATE, 'company_detail'])
  status(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.companyDetailsService.status(id, dto);
  }
  

  // @Get('profiles')
  // async getApprovedCompanies(@Query() paginationDto: CommonPaginationDto) {
  //   return this.companyDetailsService.getApprovedCompanies(paginationDto);
  // }



  // @Put('profile')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.VENDOR)
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads/companyDetail/profile',
  //       filename: (req, file, callback) => {
  //         const randomName = Array(32)
  //           .fill(null)
  //           .map(() => Math.round(Math.random() * 16).toString(16))
  //           .join('');
  //         return callback(null, `${randomName}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  // async profileImage(
  //   @CurrentUser() user: Account,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
  //         new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1 }),
  //       ],
  //     }),
  //   )
  //   file: Express.Multer.File,
  // ) {
  //   const fileData = await this.companyDetailsService.findCompany(user.id);
  //   return this.companyDetailsService.profileImage(file.path, fileData);
  // }

}