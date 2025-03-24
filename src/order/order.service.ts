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
async placeOrder(userId: string): Promise<Order> {
  console.log(userId);

  // Fetch user using QueryBuilder with select()
  const user = await this.accountRepo
    .createQueryBuilder('user')
    .select(['user.id', 'user.name']) // Selecting only necessary fields
    .where('user.id = :userId', { userId })
    .getOne();

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Fetch cart items using QueryBuilder with select() and joins
  const cartItems = await this.cartRepo
    .createQueryBuilder('cart')
    .select([
      'cart.id',
      'cart.quantity',
      'cart.totalPrice',
      'menu.id',
      'menu.item_name',
      'company.id',
      'company.name',
    ])
    .innerJoin('cart.menu', 'menu')
    .innerJoin('cart.company', 'company')
    .where('cart.userId = :userId', { userId })
    .getMany();

  if (!cartItems || cartItems.length === 0) {
    throw new NotFoundException('Cart is empty');
  }

  // Calculate total amount
  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

  // Create order entity
  const order = this.orderRepo.create({
    user,
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

  await this.cartRepo
    .createQueryBuilder()
    .delete()
    .where('userId = :userId', { userId })
    .execute();

  return order;
}


  async getCompanyOrders(accountId: string, paginationDto: CommonPaginationDto) {
    const { limit, offset, keyword } = paginationDto;

    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    const company = await this.companyRepo.findOne({
        where: { account: { id: accountId } },
        relations: ['account'],
    });

    if (!company) {
        throw new NotFoundException('No restaurant found for this owner.');
    }

    const queryBuilder = this.orderRepo.createQueryBuilder('order')
        .leftJoinAndSelect('order.company', 'company')
        .where('company.id = :companyId', { companyId: company.id });

    if (keyword) {
        queryBuilder.andWhere('order.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [orders, totalOrders] = await queryBuilder
        .take(limit)
        .skip(offset)
        .getManyAndCount();

    return {
        totalOrders,
        orders,
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



}

