import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Menu } from 'src/menu/entities/menu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { UserDetail } from 'src/user-details/entities/user-detail.entity';
import { CompanyDetail } from 'src/company-details/entities/company-detail.entity';
import { Account } from 'src/account/entities/account.entity';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Menu,Account,CompanyDetail]),  AccountModule,],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService,TypeOrmModule],
})
export class CartModule {}
