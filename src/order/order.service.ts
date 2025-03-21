import { Injectable,NotFoundException, ForbiddenException} from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import{InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Menu } from 'src/menu/entities/menu.entity';
import { Account } from 'src/account/entities/account.entity';
import { CompanyDetail } from './../company-details/entities/company-detail.entity';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';
import { OrderStatus } from 'src/enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(CompanyDetail) private companyRepo: Repository<CompanyDetail>

  ) {}
// order place 
  async placeOrder(userId:string): Promise<Order> {
    console.log(userId);
    const user = await this.accountRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');

    }
  
    const cartItems = await this.cartRepo.find({ 
      where: { user: { id: userId } },  
      relations: ['menu', 'company', ]  
    });
    const allCartItems = await this.cartRepo.find();
    if (!cartItems || cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }
    const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    
    const order = this.orderRepo.create({
      user:user,
      company: cartItems[0].company,
      items: cartItems.map((item) => ({
        menuId: item.menu.id,
        menuName: item.menu.item_name, 
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      totalAmount,
      status: 'Pending',
    });
    
    await this.orderRepo.save(order);

    await this.cartRepo.delete({ user: { id: userId } });


    return order;
  }


  async getCompanytOrders(accountId: string, paginationDto: CommonPaginationDto) {
    const { limit, offset, keyword } = paginationDto;

    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    const company = await this.companyRepo.findOne({
      where: { account: { id: accountId } },
      relations: ['account'],
    });

    if (!company) {
      throw new NotFoundException('No restaurant found for this owner.');
    }

    
    const whereCondition: any = { company: { id: company.id } };
    if (keyword) {
        whereCondition['name'] = { $like: `%${keyword}%` }; 
    }

   
    const orders = await this.orderRepo.find({
      where: whereCondition,
      relations: ['company'],
      take: limit, 
      skip: offset, 
    });

    
    const totalOrders = await this.orderRepo.count({ where: whereCondition });

    return {
      totalOrders, 
      orders,      
    };
}

// update order by copany
async updateOrderStatus(orderId: number, newStatus: OrderStatus, accountId: string) {
  const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['company', 'company.account'],
  });

  if (!order) {
      throw new NotFoundException('Order not found');
  }

 
   if ((order.company.account.id) !== accountId) {
      throw new ForbiddenException('You are not authorized to update this order');
  }

  order.status = newStatus;
  await this.orderRepo.save(order);

  return {
      orderId: order.id,
      status: order.status,
      restaurant: {
          id: order.company.id,
          name: order.company.name,
          email: order.company.email,
           
      }
  };
}
// view order status for customer
async getOrderStatus(orderId: number, userId: string) {
  const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user', 'company'],
  });

  if (!order) {
      throw new NotFoundException('Order not found');
  }

  return { orderId: order.id, status: order.status };
}



}

