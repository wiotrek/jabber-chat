import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChannels1793733477499 implements MigrationInterface {
    name = 'AddChannels1793733477499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_channel_id" PRIMARY KEY ("id"))`);

        await queryRunner.query(`CREATE TABLE "channel_users" ("userId" uuid NOT NULL, "channelId" uuid NOT NULL, CONSTRAINT "PK_channel_users" PRIMARY KEY ("userId", "channelId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_channel_users_userId" ON "channel_users" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_channel_users_channelId" ON "channel_users" ("channelId")`);
        await queryRunner.query(`ALTER TABLE "channel_users" ADD CONSTRAINT "FK_channel_users_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "channel_users" ADD CONSTRAINT "FK_channel_users_channelId" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

        // messages.recipientId/readAt belonged to the old 1:1 DM model; dropping them
        // discards any existing rows' recipient/read-receipt data (dev schema only).
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_f548818d46a1315d4e1d5e62da5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f548818d46a1315d4e1d5e62da"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "recipientId"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "readAt"`);

        await queryRunner.query(`ALTER TABLE "messages" ADD "channelId" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_channelId" ON "messages" ("channelId")`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_channelId" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_channelId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_messages_channelId"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "channelId"`);

        await queryRunner.query(`ALTER TABLE "messages" ADD "readAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "recipientId" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_f548818d46a1315d4e1d5e62da" ON "messages" ("recipientId")`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_f548818d46a1315d4e1d5e62da5" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "channel_users" DROP CONSTRAINT "FK_channel_users_channelId"`);
        await queryRunner.query(`ALTER TABLE "channel_users" DROP CONSTRAINT "FK_channel_users_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_channel_users_channelId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_channel_users_userId"`);
        await queryRunner.query(`DROP TABLE "channel_users"`);

        await queryRunner.query(`DROP TABLE "channel"`);
    }

}
