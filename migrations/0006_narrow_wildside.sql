CREATE TABLE "user_participated_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"campaign_id" uuid NOT NULL,
	"participated_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_participated_campaigns_user_campaign_unique" UNIQUE("user_id","campaign_id")
);
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_comments_id_fk";
--> statement-breakpoint
ALTER TABLE "user_participated_campaigns" ADD CONSTRAINT "user_participated_campaigns_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_participated_campaigns_user_id_idx" ON "user_participated_campaigns" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_participated_campaigns_campaign_id_idx" ON "user_participated_campaigns" USING btree ("campaign_id");