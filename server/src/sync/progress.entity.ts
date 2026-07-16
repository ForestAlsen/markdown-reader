import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('progress')
@Unique('UQ_user_article', ['userId', 'articleId'])
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  articleId: string;

  @Column({ type: 'int' })
  scrollY: number;

  @Column({ type: 'float' })
  scrollRatio: number;

  @Column({ type: 'bigint' })
  updatedAt: number;
}
