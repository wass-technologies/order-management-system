import { Module } from '@nestjs/common';
import { StaffDetailService } from './staff_detail.service';
import { StaffDetailController } from './staff_detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffDetail } from './entities/staff_detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffDetail]),
    
  ],
  controllers: [StaffDetailController],
  providers: [StaffDetailService],
})
export class StaffDetailModule {}
