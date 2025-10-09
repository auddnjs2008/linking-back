import { BaseTable } from 'src/common/entities/base-table.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Link } from 'src/link/entity/link.entity';

@Entity()
export class Tag extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  usageCount: number; // 태그 사용 횟수 (통계용)

  @ManyToMany(() => Link, (link) => link.tags)
  links: Link[];
}
