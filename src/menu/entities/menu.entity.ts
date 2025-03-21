import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany,JoinColumn } from 'typeorm';
import { CompanyDetail } from 'src/company-details/entities/company-detail.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { AvailabilityStatus } from 'src/enum';
@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  item_name: string;

  @Column('decimal')
  price: number;

  @Column()
  description: string;
  
  @Column()
  companyId: number; 

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
  })
  availability: AvailabilityStatus;


 
  @ManyToOne(() => CompanyDetail, (company) => company.menus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })  // Foreign key
  company: CompanyDetail;


  @OneToMany(() => Cart, (cart) => cart.menu)
  carts: Cart[];
}