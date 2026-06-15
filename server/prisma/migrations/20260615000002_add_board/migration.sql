CREATE TABLE "board_posts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_announcement" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "board_comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "board_posts_is_announcement_created_at_idx" ON "board_posts"("is_announcement", "created_at");
CREATE INDEX "board_comments_post_id_created_at_idx" ON "board_comments"("post_id", "created_at");

ALTER TABLE "board_posts" ADD CONSTRAINT "board_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "board_comments" ADD CONSTRAINT "board_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "board_comments" ADD CONSTRAINT "board_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "board_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
