import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/enum';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}