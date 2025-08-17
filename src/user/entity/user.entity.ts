import { BaseTable } from 'src/common/entities/base-table.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Link } from 'src/link/entity/link.entity';
import { GroupUserBookmark } from 'src/group/entity/group-user-bookmark.entity';
import { LinkUserBookmark } from 'src/link/entity/link-user-bookmark.entity';
import { Group } from 'src/group/entity/group.entity';

export enum LoginType {
  LOCAL = 'local',
  GOGGLE = 'google',
}

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

  @Column({
    type: 'enum',
    enum: LoginType,
    default: LoginType.LOCAL,
  })
  loginType: LoginType;

  @Column({ default: 'https://github.com/shadcn.png' })
  profile: string;

  @OneToMany(() => Link, (link) => link.user)
  createdLinks: Link[];

  @OneToMany(() => Group, (group) => group.user)
  createdGroups: Group[];

  @OneToMany(() => LinkUserBookmark, (lub) => lub.user)
  bookmarkedLinks: LinkUserBookmark[];

  @OneToMany(() => GroupUserBookmark, (lub) => lub.user)
  bookmarkedGroups: GroupUserBookmark[];
}
