CREATE TABLE "campaign_emoji_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_emoji_reactions_user_campaign_emoji_unique" UNIQUE("user_id","campaign_id","emoji")
);
--> statement-breakpoint
ALTER TABLE "campaign_emoji_reactions" ADD CONSTRAINT "campaign_emoji_reactions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_emoji_reactions_campaign_id_idx" ON "campaign_emoji_reactions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_emoji_reactions_user_id_idx" ON "campaign_emoji_reactions" USING btree ("user_id");