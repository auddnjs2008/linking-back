import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Link } from './link.entity';
import User from 'src/user/entity/user.entity';

@Entity()
export class LinkUserBookMark {
  @PrimaryColumn({
    name: 'linkId',
    type: 'int8',
  })
  @ManyToOne(() => Link, (link) => link.bookmarkedUsers, {
    onDelete: 'CASCADE',
  })
  link: Link;

  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.bookmarkedLinks, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  isBookmarked: boolean;
}
