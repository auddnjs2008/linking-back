import { BaseTable } from 'src/common/entities/base-table.entity';
import { Link } from 'src/link/entity/link.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GroupUserBookmark } from './group-user-bookmark.entity';
import User from 'src/user/entity/user.entity';

@Entity()
export class Group extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  views: number;

  @ManyToOne(() => User, (user) => user.createdGroups, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToMany(() => Link, (link) => link.linkedGroups)
  @JoinTable()
  linkedLinks: Link[];

  @OneToMany(() => GroupUserBookmark, (gub) => gub.group)
  bookmarkedUsers: GroupUserBookmark[];

  // 임시 속성 (데이터베이스 컬럼 아님)
  isBookmarked?: boolean;
}
