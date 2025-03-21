import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Menus} from './entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menus) private readonly repo: Repository<Menus>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    let menus: Menus[] = await this.cacheManager.get('menus');
    if (!menus) {
      menus = await this.repo.find();
      this.cacheManager.set('menus', menus, 0);
    }
    return menus;
  }
}
