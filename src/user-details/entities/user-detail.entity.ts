import { Account } from 'src/account/entities/account.entity';
import {Cart} from 'src/cart/entities/cart.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class UserDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 55, nullable: true })
  name: string;
  
  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;
  
  @Column({ type: 'varchar', length: 200, nullable: true })
  interest: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  wpNo: string;

  @Column({ type: 'text', nullable: true })
  profile: string;

  @Column({ type: 'text', nullable: true })
  profileName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  accountId: string;

  @ManyToOne(() => Account, (account) => account.userDetail, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  account: Account;

  @OneToMany(() => Cart, (cart) => cart.user)
carts: Cart[];

}
