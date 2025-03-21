import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { OrderStatus } from 'src/enum'

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsNumber()
  @IsNotEmpty()
  restaurantId: number;

  @IsNumber()
  totalPrice: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
