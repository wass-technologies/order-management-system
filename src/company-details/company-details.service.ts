import { Injectable, NotFoundException,UsePipes, ValidationPipe, BadRequestException,ForbiddenException,UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyStatus } from 'src/enum';
import { Brackets, Repository } from 'typeorm';
import { CompanyDetailDto,StatusDto,} from './dto/company-detail.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/enum';
import { CompanyDetail } from './entities/company-detail.entity';
import { CommonPaginationDto } from 'src/common/dto/common-pagination.dto';
import { Account } from 'src/account/entities/account.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { Menus } from 'src/menus/entities/menu.entity';


@Injectable()
export class CompanyDetailsService {
  constructor(
    @InjectRepository(CompanyDetail)
    private readonly repo: Repository<CompanyDetail>,
    @InjectRepository(Account)
    private readonly accountrepo: Repository<Account>,
  ) {}

  

  // Get all companies 
  async getAllCompanies(paginationDto: CommonPaginationDto) {
    const { limit = 10, offset = 0, keyword } = paginationDto;

    const query = this.repo.createQueryBuilder('company');

    if (keyword) {
      query.andWhere('company.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [companies, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      data: companies,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  }

  
  // Get menu by company ID for admin 
  async getMenuByCompanyIdforAdmin(companyId: string, paginationDto: CommonPaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const companyDetail = await this.repo
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.menus', 'menu')
      .where('company.id = :id', { id: companyId })
      .skip(offset)
      .take(limit)
      .getOne();

    if (!companyDetail) {
      throw new NotFoundException('Company not found');
    }

    return {
      total: companyDetail.menus.length,
      data: companyDetail.menus,
      totalPages: Math.ceil(companyDetail.menus.length / limit),
      currentPage: Math.floor(offset / limit) + 1,
      pageSize: limit,
      
    };
  }


  async updatecompanyDetails(id: string, dto: CompanyDetailDto) {
    const result = await this.repo.findOne({ where: { accountId: id } });
    if (!result) {
      throw new NotFoundException('Company not found!');
    }
    const obj = Object.assign(result, dto);
    return this.repo.save(obj);
  }

 // staust update
  async status(id: string, dto: StatusDto) {
    const result = await this.repo.findOne({ where: { accountId: id } });
    if (!result) {
      throw new NotFoundException('Company detail not found!');
    }
    const obj = Object.assign(result, dto);
    return this.repo.save(obj);
  }
  








  
  // async updateCompanyDetails(accountId: string, updateData: Partial<CompanyDetail>) {
  //   let companyDetails = await this.repo.findOne({ where: { account: { id: accountId } } });
  //   if (!companyDetails) {
  //     const account = await this.accountrepo.findOne({ where: { id: accountId } });
  //     if (!account) {
  //       throw new Error('Account not found');
  //     }
  //     companyDetails = this.repo.create({ ...updateData, account });
  //   } else {
  //     Object.assign(companyDetails, updateData);
  //   }
  //   return this.repo.save(companyDetails);
  // }

  // async findList(dto: PaginationDto) {
  //   const category = JSON.parse(dto.category);
  //   const subcategory = JSON.parse(dto.subCategory);
  //   const keyword = dto.keyword || '';
  //   const query = this.repo
  //     .createQueryBuilder('companyDetail')
  //     .leftJoinAndSelect('companyDetail.state', 'state')
  //     .leftJoinAndSelect('companyDetail.city', 'city')
  //     .leftJoinAndSelect('companyDetail.companyCategory', 'companyCategory')
  //     .leftJoinAndSelect(
  //       'companyDetail.companySubCategory',
  //       'companySubCategory',
  //     )
  //     .leftJoinAndSelect('companySubCategory.subCategory', 'subCategory')
  //     .leftJoinAndSelect('companyCategory.category', 'category')
  //     .select([
  //       'companyDetail.id',
  //       'companyDetail.businessName',
  //       'companyDetail.personName',
  //       'companyDetail.logo',

  //       'state.id',
  //       'state.name',

  //       'city.id',
  //       'city.name',

  //       'companyCategory.id',
  //       'category.id',
  //       'category.name',

  //       'companySubCategory.id',
  //       'subCategory.id',
  //       'subCategory.name',
  //     ])
  //     .where('companyDetail.status = :status', {
  //       status: CompanyStatus.APPROVED,
  //     });
  //   if (category.length > 0) {
  //     query.andWhere('category.id IN :categorys', { categorys: category });
  //   }
  //   if (subcategory.length > 0) {
  //     query.andWhere('subCategory.id IN :subCategorys', {
  //       subCategorys: subcategory,
  //     });
  //   }
  //   query.andWhere(
  //     new Brackets((qb) => {
  //       qb.where('companyDetail.businessName LIKE :businessName', {
  //         businessName: '%' + keyword + '%',
  //       });
  //     }),
  //   );
  //   const [result, total] = await query
  //     .skip(dto.offset)
  //     .take(dto.limit)
  //     .orderBy({ 'companyDetail.businessName': 'ASC' })
  //     .getManyAndCount();
  //   return { result, total };
  // }

//   async findCompany(id: string) {
//     const result = await this.repo
//       .createQueryBuilder('companyDetail')
//       .where('companyDetail.accountId = :accountId', { accountId: id })
//       .getOne();
//     if (!result) {
//       throw new NotFoundException('Company not found!');
//     }
//     return result;
//   }

//   async update(id: string, dto: CompanyDetailDto) {
//     const result = await this.repo.findOne({ where: { accountId: id } });
//     if (!result) {
//       throw new NotFoundException('Company not found!');
//     }
//     const obj = Object.assign(result, dto);
//     return this.repo.save(obj);
//   }

//   async profileImage(image: string, result: CompanyDetail) {
//     const obj = Object.assign(result, {
//       profile: process.env.BL_CDN_LINK + image,
//       profileName: image,
//     });
//     return this.repo.save(obj);
//   }
// async updateStatus(companyId: string, status: CompanyStatus) {
  //   const company = await this.repo.findOne({ where: { id: companyId } });
  //   if (!company) {
  //     throw new NotFoundException('Company not found');
  //   }
  //   company.status = status;
  //   return this.repo.save(company);
  // }

    // // Get approved companies 
  // async getApprovedCompanies(paginationDto: CommonPaginationDto) {
  //   const { limit = 10, offset = 0, keyword } = paginationDto;

  //   const query = this.repo
  //     .createQueryBuilder('company')
  //     .where('company.status = :status', { status: CompanyStatus.APPROVED });

  //   if (keyword) {
  //     query.andWhere('company.name LIKE :keyword', { keyword: `%${keyword}%` });
  //   }

  //   const [approvedCompanies, total] = await query
  //     .skip(offset)
  //     .take(limit)
  //     .getManyAndCount();

  //   return {
  //     total,
  //     companies: approvedCompanies,
  //     totalPages: Math.ceil(total / limit),
  //     currentPage: Math.floor(offset / limit) + 1,
  //     pageSize: limit,
      
  //   };
  // }
 
}