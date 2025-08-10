import { BaseTable } from 'src/common/entities/base-table.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Link } from 'src/link/entity/link.entity';
import { LinkUserBookMark } from 'src/link/entity/link-user-bookmark.entity';

@Entity()
export default class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: 'local' })
  loginType: string; // 'local' | 'google' | 'github' 등

  @Column({ default: 'https://github.com/shadcn.png' })
  profile: string;

  @OneToMany(() => Link, (link) => link.user)
  createdLinks: Link[];

  @OneToMany(() => LinkUserBookMark, (lub) => lub.user)
  bookmarkedLinks: LinkUserBookMark[];
}
