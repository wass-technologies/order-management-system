import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Account } from 'src/account/entities/account.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/enum';
import { PaginationSDto, UpdateUserDetailDto } from './dto/update-user-details';
import { UserDetailsService } from './user-details.service';
import{Request} from 'express';
import { PaginationDto } from 'src/pagination.dto';


@Controller('user-details')
export class UserDetailsController {
  constructor(private readonly userDetailsService: UserDetailsService) {}
// user details update
  @UseGuards(AuthGuard('jwt'), RolesGuard)
 
    @Put('update')
    async updateCompanyDetail(@Req() req: Request,  @Body() updateData: UpdateUserDetailDto) {
   const user = req.user as { accountId: string };
   
  
      if (!user || !user.accountId) {
        throw new UnauthorizedException('Invalid token');
      }
      return this.userDetailsService.updateCompanyDetails(user.accountId, updateData);
    }

// user details check by admin
    @UseGuards(AuthGuard('jwt'), RolesGuard)
      @Roles('ADMIN') 
      @Get('all')
      async getAllUserDetails(
        @Query() paginationDto: PaginationDto
      ) {
        const { page, limit } = paginationDto;
        return this.userDetailsService.getAllUserDetails(page, limit);
      }

  // @Get()
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.ADMIN)
  // findAll(@Query() dto: PaginationSDto) {
  //   return this.userDetailsService.findAll(dto);
  // }

  // @Get('profile')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(...Object.values(UserRole))
  // profile(@CurrentUser() user: Account) {
  //   return this.userDetailsService.getProfile(user.id);
  // }

  // @Patch('user/register')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(UserRole.USER)
  // update(@Body() dto: UpdateUserDetailDto, @CurrentUser() user: Account) {
  //   dto.accountId = user.id;
  //   return this.userDetailsService.update(dto, user.id);
  // }

  // @Put('profile')
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads/UserDetail/profile',
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
//   async profileImage(
//     @CurrentUser() user: Account,
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1 }),
//         ],
//       }),
//     )
//     file: Express.Multer.File,
//   ) {
//     const fileData = await this.userDetailsService.findOne(user.id);
//     return this.userDetailsService.profileImage(file.path, fileData);
//   }

}