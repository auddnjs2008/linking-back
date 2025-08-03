import { BaseTable } from 'src/common/entities/base-table.entity';
import User from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Link extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  linkUrl: string;

  @Column('simple-array', { default: [] })
  tags: string[];

  @ManyToOne(() => User, (user) => user.createdLinks, {
    onDelete: 'CASCADE',
  })
  user: User;
}
