import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1760832853426 implements MigrationInterface {
  name = 'Init1760832853426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type first if it doesn't exist
    const enumExists = await queryRunner.query(`
      SELECT 1 FROM pg_type WHERE typname = 'user_logintype_enum'
    `);
    if (enumExists.length === 0) {
      await queryRunner.query(
        `CREATE TYPE "public"."user_logintype_enum" AS ENUM('local', 'google')`,
      );
    }

    await queryRunner.query(
      `CREATE TABLE "link_user_bookmark" ("linkId" integer NOT NULL, "userId" integer NOT NULL, "isBookmarked" boolean NOT NULL, CONSTRAINT "PK_ff0c4585ff3ad17b1f4ef18d190" PRIMARY KEY ("linkId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "link_comment" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "comment" character varying NOT NULL, "parentCommentId" integer, "userId" integer, "linkId" integer, CONSTRAINT "PK_d63efc3b7b4fbde1b47a7dea5e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_user_bookmark" ("groupId" integer NOT NULL, "userId" integer NOT NULL, "isBookmarked" boolean NOT NULL, CONSTRAINT "PK_e2e24f4696a7bb34860202eac27" PRIMARY KEY ("groupId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "views" integer NOT NULL DEFAULT '0', "userId" integer, CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "usageCount" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "link" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "linkUrl" character varying NOT NULL, "thumbnail" character varying NOT NULL, "views" integer NOT NULL DEFAULT '0', "userId" integer, CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "loginType" "public"."user_logintype_enum" NOT NULL DEFAULT 'local', "profile" character varying NOT NULL DEFAULT 'https://github.com/shadcn.png', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_linked_links_link" ("groupId" integer NOT NULL, "linkId" integer NOT NULL, CONSTRAINT "PK_7065ae120f159fd6ebaa67975a3" PRIMARY KEY ("groupId", "linkId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da6090d979fc386837e66e0180" ON "group_linked_links_link" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05a74da7ae8d34890d725823f6" ON "group_linked_links_link" ("linkId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "link_tags_tag" ("linkId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_af9e81b096db9900bc997fde194" PRIMARY KEY ("linkId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b03401324b4e31baeee031a114" ON "link_tags_tag" ("linkId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a044ee32e54804033d403432d" ON "link_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "link_user_bookmark" ADD CONSTRAINT "FK_8b8b96b2402ab368b382ec9c358" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_user_bookmark" ADD CONSTRAINT "FK_2971706f2b241e6275210bffc1e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_comment" ADD CONSTRAINT "FK_628bd094a6c3365aaeee93a7864" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_comment" ADD CONSTRAINT "FK_d1654c69fe23b3eb4bc552984e1" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_comment" ADD CONSTRAINT "FK_1a27c1f3a73cb858ed3390ce0ac" FOREIGN KEY ("parentCommentId") REFERENCES "link_comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user_bookmark" ADD CONSTRAINT "FK_8341fa46c66e8759a94bece7e76" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user_bookmark" ADD CONSTRAINT "FK_e72e540cd0d4db16c59acbcbcac" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "FK_7bec24423f57c3786409cc3cc8d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD CONSTRAINT "FK_14a562b14bb83fc8ba73d30d3e0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_linked_links_link" ADD CONSTRAINT "FK_da6090d979fc386837e66e0180e" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_linked_links_link" ADD CONSTRAINT "FK_05a74da7ae8d34890d725823f68" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_tags_tag" ADD CONSTRAINT "FK_b03401324b4e31baeee031a114c" FOREIGN KEY ("linkId") REFERENCES "link"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_tags_tag" ADD CONSTRAINT "FK_2a044ee32e54804033d403432da" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "link_tags_tag" DROP CONSTRAINT "FK_2a044ee32e54804033d403432da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_tags_tag" DROP CONSTRAINT "FK_b03401324b4e31baeee031a114c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_linked_links_link" DROP CONSTRAINT "FK_05a74da7ae8d34890d725823f68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_linked_links_link" DROP CONSTRAINT "FK_da6090d979fc386837e66e0180e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link" DROP CONSTRAINT "FK_14a562b14bb83fc8ba73d30d3e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "FK_7bec24423f57c3786409cc3cc8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user_bookmark" DROP CONSTRAINT "FK_e72e540cd0d4db16c59acbcbcac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_user_bookmark" DROP CONSTRAINT "FK_8341fa46c66e8759a94bece7e76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_comment" DROP CONSTRAINT "FK_1a27c1f3a73cb858ed3390ce0ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_comment" DROP CONSTRAINT "FK_d1654c69fe23b3eb4bc552984e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_comment" DROP CONSTRAINT "FK_628bd094a6c3365aaeee93a7864"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_user_bookmark" DROP CONSTRAINT "FK_2971706f2b241e6275210bffc1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "link_user_bookmark" DROP CONSTRAINT "FK_8b8b96b2402ab368b382ec9c358"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a044ee32e54804033d403432d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b03401324b4e31baeee031a114"`,
    );
    await queryRunner.query(`DROP TABLE "link_tags_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05a74da7ae8d34890d725823f6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da6090d979fc386837e66e0180"`,
    );
    await queryRunner.query(`DROP TABLE "group_linked_links_link"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "link"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TABLE "group_user_bookmark"`);
    await queryRunner.query(`DROP TABLE "link_comment"`);
    await queryRunner.query(`DROP TABLE "link_user_bookmark"`);
    await queryRunner.query(`DROP TYPE "public"."user_logintype_enum"`);
  }
}
