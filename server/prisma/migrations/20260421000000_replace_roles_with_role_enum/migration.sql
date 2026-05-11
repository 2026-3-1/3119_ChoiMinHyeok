-- Add single role column migrating data from roles array
ALTER TABLE "users" ADD COLUMN "role" "Roles" NOT NULL DEFAULT 'STUDENT';

UPDATE "users" SET "role" =
  CASE
    WHEN 'ADMIN'      = ANY(roles) THEN 'ADMIN'::"Roles"
    WHEN 'INSTRUCTOR' = ANY(roles) THEN 'INSTRUCTOR'::"Roles"
    ELSE 'STUDENT'::"Roles"
  END;

ALTER TABLE "users" DROP COLUMN "roles";
