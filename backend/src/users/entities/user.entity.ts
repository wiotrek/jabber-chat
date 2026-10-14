import bcrypt from 'bcrypt';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Message } from '../../messages/entities/message.entity.js';

const SALT_ROUNDS = 12;

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

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

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Relation<Message>[];

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Relation<Message>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
