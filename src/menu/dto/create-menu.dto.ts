import { IsNotEmpty, IsNumber, IsBoolean ,IsString,IsEnum,IsOptional, IsUUID} from 'class-validator';
import { AvailabilityStatus } from 'src/enum';

export class CreateMenuDto {
    @IsUUID()  // ✅ Ensures it's a valid UUID
  companyId: string;
  @IsNotEmpty()
  item_name: string;

  @IsNumber()
  price: number;



  @IsString()
  description: string;

  

  @IsEnum(AvailabilityStatus)
  @IsOptional()
  availability?: AvailabilityStatus;
}
