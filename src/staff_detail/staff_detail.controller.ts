import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StaffDetailService } from './staff_detail.service';
import { CreateStaffDetailDto } from './dto/create-staff_detail.dto';
import { UpdateStaffDetailDto } from './dto/update-staff_detail.dto';

@Controller('staff-detail')
export class StaffDetailController {
  constructor(private readonly staffDetailService: StaffDetailService) {}

 
}
