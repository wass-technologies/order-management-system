import { Injectable ,NotFoundException} from '@nestjs/common';
import { CreateStaffDetailDto } from './dto/create-staff_detail.dto';
import { UpdateStaffDetailDto } from './dto/update-staff_detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffDetail } from './entities/staff_detail.entity';

@Injectable()
export class StaffDetailService {
 
  constructor(
    @InjectRepository(StaffDetail)
    private readonly repo: Repository<StaffDetail>
  ) {}

  async updateStaff(id: string, updateDto: UpdateStaffDetailDto): Promise<StaffDetail> {
    const staff = await this.repo.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    Object.assign(staff, updateDto);
    return this.repo.save(staff);
  }
}
