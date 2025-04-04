import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Brackets, Repository } from 'typeorm';
import { PaginationSDto, UpdateUserDetailDto } from './dto/update-user-details';
import { UserDetail } from './entities/user-detail.entity';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';


@Injectable()
export class UserDetailsService {
  constructor(
    @InjectRepository(UserDetail) private readonly repo: Repository<UserDetail>,
    @InjectRepository(Account)
    private readonly accountrepo: Repository<Account>,
  ) {}



  async getAllUserDetails(paginationDto: CommonPaginationDto) {
    const { limit, offset, keyword } = paginationDto;
  
    const queryBuilder = this.repo.createQueryBuilder('user');
  
    if (keyword) {
      queryBuilder.where('user.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
  
    const [users, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  
    return {
      data: users,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  }


  
  async updateUserDetails(id: string, dto: UpdateUserDetailDto) {
    const result = await this.repo.findOne({ where: { accountId: id } });
    if (!result) {
      throw new NotFoundException('Company not found!');
    }
    const obj = Object.assign(result, dto);
    return this.repo.save(obj);
  }

 

 
  
  























  
   // async updateusrDetails(accountId: string, updateData: UpdateUserDetailDto) {
  //   let userDetail = await this.repo.findOne({
  //     where: { account: { id: accountId } },
  //     relations: ['account'], 
  //   });
  
  //   if (!userDetail) {
  //     const account = await this.accountrepo.findOne({ where: { id: accountId } });
  //     if (!account) {
  //       throw new NotFoundException('Account not found');
  //     }
  
  //     userDetail = this.repo.create({ ...updateData, account }); 
  //   } else {
  //     Object.assign(userDetail, updateData); 
  //   }
  
  //   return this.repo.save(userDetail); 
  // }
  

  async getProfile(id: string) {
    const result = await this.repo
      .createQueryBuilder('userDetail')
      .leftJoinAndSelect('userDetail.account', 'account')
      .leftJoinAndSelect('account.userAddress', 'userAddress')
      .select([
        'userDetail.id',
        'userDetail.name',
        'userDetail.email',
        'userDetail.gstNo',
        'userDetail.address',
        'userDetail.city',
        'userDetail.state',
        'userDetail.zipCode',
        'userDetail.businessType',
        'userDetail.gstCertificate',
        'userDetail.businessReg',
        'userDetail.profile',
        'userDetail.profileName',
        'userDetail.createdAt',
        'userDetail.updatedAt',
        'userDetail.accountId',

        'account.id',
        'account.phoneNumber',
        'account.roles',
        'account.status',
        'account.totalCoin',
        'account.usedCoin',
        'account.createdAt',

        'userAddress.id',
        'userAddress.name',
        'userAddress.altPhone',
        'userAddress.phone',
        'userAddress.city',
        'userAddress.state',
        'userAddress.pincode',
        'userAddress.address',
        'userAddress.status',
      ])
      .where('userDetail.accountId = :id', { id: id })
      .getOne();
    if (!result) {
      throw new NotFoundException('User not found!');
    }
    return result;
  }

  async findAll(dto: PaginationSDto) {
    const keyword = dto.keyword || '';
    const [result, total] = await this.repo
      .createQueryBuilder('userDetail')
      .leftJoinAndSelect('userDetail.account', 'account')
      // .where('userDetail.status = :status', { status: dto.status })
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            'account.phoneNumber LIKE :phoneNumber OR userDetail.name LIKE :name OR userDetail.gstNo LIKE :gstNo',
            {
              phoneNumber: '%' + keyword + '%',
              name: '%' + keyword + '%',
              gstNo: '%' + keyword + '%',
            },
          );
        }),
      )
      .skip(dto.offset)
      .take(dto.limit)
      .orderBy({ 'userDetail.name': 'ASC' })
      .getManyAndCount();
    return { result, total };
  }

  async findOne(id: string) {
    const result = await this.repo.findOne({
      where: { accountId: id },
    });
    if (!result) {
      throw new NotFoundException('User not found!');
    }
    return result;
  }

  async update(dto: UpdateUserDetailDto, accountId: string) {
    const result = await this.repo.findOne({ where: { accountId: accountId } });
    if (!result) {
      throw new NotFoundException('User profile not found!');
    }
    const obj = Object.assign(result, dto);
    return await this.repo.save(obj);
  }

  async profileImage(image: string, result: UserDetail) {
    const obj = Object.assign(result, {
      profile: process.env.BL_CDN_LINK + image,
      profileName: image,
    });
    return this.repo.save(obj);
  }
}
