import { Controller, Get, Post, Body, Patch, Param, Delete,Put ,NotFoundException} from '@nestjs/common';
import { StaffDetailService } from './staff_detail.service';
import { CreateStaffDetailDto } from './dto/create-staff_detail.dto';
import { UpdateStaffDetailDto } from './dto/update-staff_detail.dto';
import { StaffDetail } from './entities/staff_detail.entity';



@Controller('staff-detail')
export class StaffDetailController {
  constructor(private readonly staffService: StaffDetailService) {}


  @Put(':id')
  async updateStaff(
    @Param('id') id: string,
    @Body() updateDto: UpdateStaffDetailDto ): Promise<StaffDetail> {
    return this.staffService.updateStaff(id, updateDto);
  }

  @Delete(':id')
  async deleteStaff(@Param() id: string) {
    const deleted = await this.staffService.deleteStaff(id);
    if (!deleted) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return { message: 'Staff deleted successfully' };
  }

}
