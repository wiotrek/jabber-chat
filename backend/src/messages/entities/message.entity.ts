import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { EncryptedColumnTransformer } from '../../common/crypto/encrypted-column.transformer.js';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Stored encrypted at rest (AES-256-GCM) via EncryptedColumnTransformer;
   * read/write this property with plaintext, TypeORM handles the rest.
   */
  @Column({ type: 'text', transformer: new EncryptedColumnTransformer() })
  content: string;

  @Index()
  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: Relation<User>;

  @Index()
  @Column()
  recipientId: string;

  @ManyToOne(() => User, (user) => user.receivedMessages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipientId' })
  recipient: Relation<User>;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
