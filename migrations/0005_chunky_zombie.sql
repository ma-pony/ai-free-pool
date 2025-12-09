ALTER TABLE "campaigns" ALTER COLUMN "platform_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "pending_platform" jsonb;