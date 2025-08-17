import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Link } from './link.entity';
import User from 'src/user/entity/user.entity';

@Entity()
export class LinkUserBookmark {
  @PrimaryColumn({
    name: 'linkId',
    type: 'int8',
  })
  linkId: number;

  @ManyToOne(() => Link, (link) => link.bookmarkedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'linkId' })
  link: Link;

  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  userId: number;
  @ManyToOne(() => User, (user) => user.bookmarkedLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  isBookmarked: boolean;
}
