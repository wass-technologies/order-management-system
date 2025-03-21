import { Controller, Get, Post, Body, Patch, Param, Delete,Req,UnauthorizedException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { UseGuards } from '@nestjs/common';
import{CurrentUser} from 'src/auth/decorators/current-user.decorator';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @Post('add')
  async addItemToCart(@Body() createCartDto: CreateCartDto, @CurrentUser() user: { accountId: string }) {
    const userId = user.accountId;
    console.log(userId)
    return this.cartService.addItemToCart(userId, createCartDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @Get()
  async getCartItems(@CurrentUser() user: { accountId: string }, @Body() paginationDto: CommonPaginationDto) {
    const userId = user.accountId; 
    if (!userId) {
      throw new UnauthorizedException('User ID not found in token');
    }
    return this.cartService.getCartItems(userId, paginationDto);
  }

 @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @Patch(':id')
  async updateCartItem(
    @Param('id') id: number,
    @Body() updateCartDto: UpdateCartDto,
    @CurrentUser() user: { accountId: string }
  ) {
    const userId = user.accountId 
    return this.cartService.updateCartItem(userId, id, updateCartDto);
  }
  
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('CUSTOMER')
  @Delete(':id')
  async removeCartItem(@Param('id') id: number, @Req() req) {
    const userId = req.user.userid; 
    return this.cartService.removeCartItem(userId, id);
  }
  
}
