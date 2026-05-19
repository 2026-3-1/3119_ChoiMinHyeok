-- Add single role column migrating data from roles array
ALTER TABLE "users" ADD COLUMN "role" "Roles" NOT NULL DEFAULT 'STUDENT';

UPDATE "users" SET "role" = roles;

ALTER TABLE "users" DROP COLUMN "roles";
