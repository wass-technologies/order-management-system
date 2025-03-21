import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Cart } from 'src/cart/entities/cart.entity';

import { Menu } from 'src/menu/entities/menu.entity';
import { Account } from 'src/account/entities/account.entity';
import { CompanyDetail } from 'src/company-details/entities/company-detail.entity';
import { CartService } from 'src/cart/cart.service';

@Module({
  imports:[TypeOrmModule.forFeature([Order, Cart, Menu, Account, CompanyDetail])],
  controllers: [OrderController,],
  providers: [OrderService,CartService],
  exports: [OrderService,TypeOrmModule]
})
export class OrderModule {}
