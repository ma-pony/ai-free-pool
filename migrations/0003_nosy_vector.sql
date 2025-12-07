CREATE TABLE "featured_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "featured_impressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" varchar(255),
	"session_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "featured_clicks" ADD CONSTRAINT "featured_clicks_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_impressions" ADD CONSTRAINT "featured_impressions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "featured_clicks_campaign_id_idx" ON "featured_clicks" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "featured_clicks_created_at_idx" ON "featured_clicks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "featured_impressions_campaign_id_idx" ON "featured_impressions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "featured_impressions_created_at_idx" ON "featured_impressions" USING btree ("created_at");