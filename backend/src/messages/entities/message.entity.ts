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
import { Channel } from '../../channels/entities/channel.entity.js';

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

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'senderId' })
  user: Relation<User>;

  @Index()
  @Column()
  channelId: string;

  @ManyToOne(() => Channel, (channel) => channel.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channelId' })
  channel: Relation<Channel>;

  @CreateDateColumn()
  createdAt: Date;
}
