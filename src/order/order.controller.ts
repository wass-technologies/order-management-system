import { Controller, Get, Post, Body, Patch, Param, Delete ,Query,Req, UnauthorizedException} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';
import { CompanyDetail } from 'src/company-details/entities/company-detail.entity';
import { Request } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { OrderStatus } from 'src/enum';
import { Account } from './../account/entities/account.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/enum';


@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService,
  @InjectRepository(CompanyDetail)
    private readonly repo: Repository<CompanyDetail>
  ) {}

  @Post("place")
@UseGuards(AuthGuard('jwt'), RolesGuard)
 @Roles('CUSTOMER') 
async placeOrder(@CurrentUser() user: { accountId: string }) {
  return this.orderService.placeOrder(user.accountId);
}

// company check order
@Get()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('RESTAURANT') 
async getCompanytOrders(@CurrentUser() user: { accountId: string }, @Query() paginationDto: CommonPaginationDto) {
    return this.orderService.getCompanyOrders(user.accountId, paginationDto);
}


// check the status of order
@Get(':id/status')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CUSTOMER) 
async getOrderStatus(@Param('id') orderId: number,@CurrentUser() user: { accountId: string }) {
  if (!user.accountId) {
    throw new UnauthorizedException('User not authenticated');
  }
  const userId = user.accountId; 
  return this.orderService.getOrderStatus(orderId, userId);
}

//  update order status
@Patch(':id/status')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('RESTAURANT')
async updateOrderStatus(
  @Param('id') orderId: number, 
  @Body('status') newStatus: OrderStatus,
  @CurrentUser() user: { accountId: string }
) {
    const accountId =user.accountId; 
    return this.orderService.updateOrderStatus(orderId, newStatus,accountId );
}


 
}
