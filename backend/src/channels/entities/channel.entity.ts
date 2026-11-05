import bcrypt from 'bcrypt';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Message } from '../../messages/entities/message.entity.js';
import { User } from '../../users/entities/user.entity.js';

const SALT_ROUNDS = 12;

@Entity('channel')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  /** Always a bcrypt hash; never read/write this directly, use setPassword(). */
  @Column({ select: false })
  password: string;

  /** Hashes and assigns a new plaintext password. Call + save() to persist it. */
  async setPassword(plainPassword: string): Promise<void> {
    this.password = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  @OneToMany(() => Message, (message) => message.channel)
  messages: Relation<Message>[];

  @ManyToMany(() => User, (user) => user.channels)
  users: Relation<User>[];
}
