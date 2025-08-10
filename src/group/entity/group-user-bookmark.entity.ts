import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Group } from './group.entity';
import User from 'src/user/entity/user.entity';

@Entity()
export class GroupUserBookmark {
  @PrimaryColumn({
    name: 'groupId',
    type: 'int8',
  })
  @ManyToOne(() => Group, (group) => group.bookmarkedUsers, {
    onDelete: 'CASCADE',
  })
  group: Group;

  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.bookmarkedGroups, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  isBookmarked: boolean;
}
