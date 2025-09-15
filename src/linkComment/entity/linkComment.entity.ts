import { BaseTable } from 'src/common/entities/base-table.entity';
import User from 'src/user/entity/user.entity';
import { Link } from 'src/link/entity/link.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class LinkComment extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Link, (link) => link.comments, { onDelete: 'CASCADE' })
  link: Link;

  @ManyToOne(() => LinkComment, (comment) => comment.replies, {
    nullable: true,
  })
  parentComment?: LinkComment;

  @OneToMany(() => LinkComment, (comment) => comment.parentComment)
  replies: LinkComment[];

  @Column({ nullable: true })
  parentCommentId?: number;
}
