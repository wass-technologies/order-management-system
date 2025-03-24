import { Injectable,NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import{InjectRepository} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import{Cart} from 'src/cart/entities/cart.entity';
import{Menu} from 'src/menu/entities/menu.entity';
import{CompanyDetail} from 'src/company-details/entities/company-detail.entity';
import{Account} from 'src/account/entities/account.entity';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
    @InjectRepository(CompanyDetail) private companyRepo: Repository<CompanyDetail>, 
    @InjectRepository(Account) private accountRepo: Repository<Account>, 
  ) {}

  async addItemToCart(userId: string, createCartDto: CreateCartDto) {
    const { menuItemId, quantity } = createCartDto;
    const menuItem = await this.menuRepo
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.company', 'company')
      .where('menu.id = :menuItemId', { menuItemId })
      .getOne();

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    
    const user = await this.accountRepo
      .createQueryBuilder('account')
      .select(['account.id', 'account.name', 'account.email'])
      .where('account.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    let cartItem = await this.cartRepo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.menu', 'menu')
      .leftJoinAndSelect('cart.user', 'user')
      .leftJoinAndSelect('cart.company', 'company')
      .where('cart.user = :userId', { userId })
      .andWhere('cart.menu = :menuItemId', { menuItemId })
      .getOne();
    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.totalPrice = menuItem.price ? menuItem.price * cartItem.quantity : 0;

      await this.cartRepo
        .createQueryBuilder()
        .update(Cart)
        .set({
          quantity: cartItem.quantity,
          totalPrice: cartItem.totalPrice,
        })
        .where('id = :cartId', { cartId: cartItem.id })
        .execute();
    } else {
      
      cartItem = this.cartRepo.create({
        menu: menuItem,
        user: user,
        quantity,
        totalPrice: menuItem.price ? menuItem.price * quantity : 0,
        company: menuItem.company,
      });

      await this.cartRepo
        .createQueryBuilder()
        .insert()
        .into(Cart)
        .values(cartItem)
        .execute();
    }

    return {
      id: cartItem.id,
      quantity: cartItem.quantity,
      totalPrice: cartItem.totalPrice,
      company: { id: menuItem.company.id, name: menuItem.company.name },
      user: { id: user.id, name: user.name, email: user.email },
      menu: { id: menuItem.id, item_name: menuItem.item_name, price: menuItem.price, description: menuItem.description },
    };
  }



async getCartItems(userId: string, paginationDto: CommonPaginationDto) {
  const { limit = 10, offset = 0, keyword } = paginationDto;

  const query = this.cartRepo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.menu', 'menu')
      .leftJoinAndSelect('cart.company', 'company')
      .where('cart.userId = :userId', { userId });

  if (keyword) {
      query.andWhere('menu.item_name LIKE :keyword OR company.name LIKE :keyword', {
          keyword: `%${keyword}%`,
      });
  }

  const total = await query.getCount();
  const cartItems = await query
      .orderBy('cart.id', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

  return {
      data: cartItems,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
      pageSize: limit,
  };
}


async updateCartItem(userId: string, cartId: number, updateCartDto: UpdateCartDto): Promise<Cart> {
  let cartItem = await this.cartRepo.findOne({
    where: { id: cartId, user: { id: userId } },
    relations: ['menu', 'user', 'company'],
});

  if (!cartItem) {
    throw new NotFoundException('Cart item not found');
  }

  if (updateCartDto.quantity) {
    cartItem.quantity = updateCartDto.quantity;
    
    cartItem.totalPrice = Number(cartItem.menu.price) * cartItem.quantity;
  }
return await this.cartRepo.save(cartItem);
}


async removeCartItem(userId: string, cartId: number): Promise<{ message: string }> {
  
  const cartItem = await this.cartRepo.findOne({ 
    where: { id: cartId, user: { id: userId } },
  });
  
  if (!cartItem) {
    throw new NotFoundException('Cart item not found');
  }

  await this.cartRepo.remove(cartItem);

  return { message: 'Cart item removed successfully' };
}
}
