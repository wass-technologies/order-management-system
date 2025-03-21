import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Menu } from '../../menu/entities/menu.entity';
import { CompanyDetail } from 'src/company-details/entities/company-detail.entity'; 
import{Account} from 'src/account/entities/account.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @ManyToOne(() => Account, (account) => account.carts, { eager: true, onDelete: 'CASCADE' })
  user: Account; 
  @ManyToOne(() => Menu, (menu) => menu.carts, { eager: true }) 
  menu: Menu;

  @ManyToOne(() => CompanyDetail, (company) => company.carts, { nullable: false })
  @JoinColumn({ name: 'companyId' })  
  company: CompanyDetail;


}
