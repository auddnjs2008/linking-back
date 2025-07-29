import { BaseTable } from 'src/common/entities/base-table.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export default class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: 'https://github.com/shadcn.png' })
  profile: string;
}
