import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyStatus, UserRole } from 'src/enum';
import { Brackets, Repository } from 'typeorm';
import { BusinessPaginationDto, PaginationDto } from './dto/account.dto';
import { Account } from './entities/account.entity';
import { RatingFeedbackService } from 'src/rating-feedback/rating-feedback.service';
import bcrypt from 'bcrypt';
import { CreateAccountDto } from 'src/account/dto/account.dto';
import { StaffDetail } from 'src/staff_detail/entities/staff_detail.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private readonly repo: Repository<Account>,
    @InjectRepository(StaffDetail)
    private readonly staffRepo: Repository<StaffDetail>,
    private readonly ratingFeedbackService: RatingFeedbackService,
  ) {}

  async create(dto: CreateAccountDto, createdBy: string) {
    const user = await this.repo.findOne({
      where: { email: dto.email, roles: UserRole.STAFF },
    });
    if (user) {
      throw new ConflictException('Login id already exists!');
    }

    const encryptedPassword = await bcrypt.hash(dto.password, 13);
    const obj = Object.assign({
      email: dto.email,
      password: encryptedPassword,
      createdBy,
      roles: UserRole.STAFF,
    });
    const payload = await this.repo.save(obj);
    const object = Object.assign({
      name: dto.name,
      email: dto.email,
      dob: dto.dob,
      accountId: payload.id,
    });
    await this.staffRepo.save(object);
    return payload;
  }

  async detail(id: string) {
    const result = await this.repo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.companyDetail', 'companyDetail')
      .where('account.id = :id', { id })
      .andWhere(
        'companyDetail.status IS NULL OR companyDetail.status = :status',
        {
          status: CompanyStatus.APPROVED,
        },
      )
      .select([
        'account.id',
        'account.roles',
        'account.status',
        'companyDetail.id',
        'companyDetail.name',
      
      ])
      .getOne();
    if (!result) {
      throw new NotFoundException('Account or company details not found');
    }
    return result;
  }

  async userdetails(id: string) {
    const result = await this.repo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.userDetail', 'userDetail')
      .select([
        'account.id',
        'account.email',
        'account.roles',
        'account.status',
        'UserDetail.id',
      
      ])
      .where('account.id = :id', { id: id })
      .getOne();
    if (!result) {
      throw new NotFoundException('Account or user  details not found');
    }
    return result;
  }

  async staffdetails(id: string) {
    const result = await this.repo
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.staffDetail', 'staffDetail')
      .where('account.id = :id', { id })

      .select([
        'account.id',
        'account.roles',
        'account.status',
        'staffDetail.id',
        'staffDetail.name',
  
      ])
      .getOne();
    if (!result) {
      throw new NotFoundException('Account or  staff details not found');
    }
    return result;
  }

  async findAllAccounts(dto: PaginationDto) {
    const keyword = dto.keyword || '';
  
    const queryBuilder = this.repo.createQueryBuilder('account')
        .leftJoinAndSelect('account.companyDetail', 'companyDetail')
        .leftJoinAndSelect('account.userDetail', 'userDetail')
        .leftJoinAndSelect('account.staffDetail', 'staffDetail')
        .select([
            'account.id',
            'account.name',
            'account.email',
            'account.role',
            'account.status',
            'account.createdAt',
            'companyDetail.id',
            'companyDetail.name',
            'userDetail.id',
            'userDetail.name',
            'staffDetail.id',
            'staffDetail.name'
        ])
        .where(
            new Brackets(qb => {
                qb.where('account.email LIKE :keyword', { keyword: `%${keyword}%` })
                    .orWhere('companyDetail.name LIKE :keyword', { keyword: `%${keyword}%` })
                    .orWhere('userDetail.name LIKE :keyword', { keyword: `%${keyword}%` })
                    .orWhere('staffDetail.name LIKE :keyword', { keyword: `%${keyword}%` });
            })
        )
        .orderBy('account.createdAt', 'DESC')
        .skip(dto.offset)
        .take(dto.limit);
  
    const [result, total] = await queryBuilder.getManyAndCount();
    return { result, total };
  }
}