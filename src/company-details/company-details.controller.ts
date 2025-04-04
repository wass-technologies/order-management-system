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
  UnauthorizedException,
  Delete
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Account } from 'src/account/entities/account.entity';;
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
import{CompanyDetailDto, StatusDto} from './dto/company-detail.dto';
import { CompanyDetail } from './entities/company-detail.entity';


@Controller('resataurant-details')
export class CompanyDetailsController {
  constructor(private readonly companyDetailsService: CompanyDetailsService) {}

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @CheckPermissions([PermissionAction.READ, 'company_detail'])
  async getAllCompanies(@Query() paginationDto: CommonPaginationDto) {
    return this.companyDetailsService.getAllCompanies(paginationDto);
  }

  @Get(':companyId/menu')
  @UseGuards(AuthGuard('jwt'), RolesGuard,PermissionsGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @CheckPermissions([PermissionAction.READ, 'company_detail'])
  async getMenuByCompanyIdforAdmin(
    @Param('companyId') companyId: string,
    @Query() paginationDto: CommonPaginationDto) {
    return this.companyDetailsService.getMenuByCompanyIdforAdmin(companyId, paginationDto);
  }


  @Put('update/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.RESTAURANT)
  async updatecompanyDetails(
    @Param('id') id: string,
    @Body() updateDto: CompanyDetailDto ): Promise<CompanyDetail> {
    return this.companyDetailsService.updatecompanyDetails(id, updateDto);
  }

 
  @Put('status/:id')
  @ApiOperation({ summary: 'For Admin' })
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @CheckPermissions([PermissionAction.UPDATE, 'company_detail'])
 @CheckPermissions([PermissionAction.UPDATE, 'company_detail'])
  status(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.companyDetailsService.status(id, dto);
  }

  @Delete('delete/:id')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.RESTAURANT)
async deleteCompanyDetails(@Param('id') id: string): Promise<{ message: string }> {
  return this.companyDetailsService.deleteCompanyDetails(id);
}















  // @Get('profiles')
  // async getApprovedCompanies(@Query() paginationDto: CommonPaginationDto) {
  //   return this.companyDetailsService.getApprovedCompanies(paginationDto);
  // }





    // @Put('update')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.RESTAURANT)
  // async updateCompanyDetail(
  //   @CurrentUser() user: { accountId: string },
  //   @Body() updateData
  // ) {
  //   if (!user?.accountId) {
  //     throw new UnauthorizedException('Invalid token');
  //   }
  //   return this.companyDetailsService.updateCompanyDetails(user.accountId, updateData);
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