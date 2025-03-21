
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column ,JoinColumn} from 'typeorm';
import { CompanyDetail } from 'src/company-details/entities/company-detail.entity';
import { Account } from 'src/account/entities/account.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.orders, { eager: true, onDelete: 'CASCADE' }) 
  user: Account;

 @ManyToOne(() => CompanyDetail, (company) => company.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })  // Foreign key
  company: CompanyDetail;
  

  @Column('json')
  items: { menuId: number; menuName: string; quantity: number; totalPrice: number }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: ['Pending', 'Confirmed', 'Delivered'], default: 'Pending' })
  status: string;
}
