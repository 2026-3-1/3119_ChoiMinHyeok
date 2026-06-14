CREATE TABLE "webhook_endpoints" (
    "id"         SERIAL PRIMARY KEY,
    "url"        TEXT NOT NULL,
    "event"      TEXT NOT NULL,
    "secret"     TEXT NOT NULL,
    "is_active"  BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "webhook_endpoints_event_is_active_idx" ON "webhook_endpoints"("event", "is_active");
