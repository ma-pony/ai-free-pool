CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"campaign_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_user_campaign_unique" UNIQUE("user_id","campaign_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_condition_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_condition_tags_campaign_tag_unique" UNIQUE("campaign_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_tags_campaign_tag_unique" UNIQUE("campaign_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "campaign_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_translations_campaign_locale_unique" UNIQUE("campaign_id","locale")
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" uuid NOT NULL,
	"slug" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"free_credit" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"official_link" text NOT NULL,
	"ai_models" jsonb,
	"usage_limits" text,
	"difficulty_level" varchar(50),
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_until" timestamp,
	"submitted_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "campaigns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comment_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comment_reactions_user_comment_emoji_unique" UNIQUE("user_id","comment_id","emoji")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"is_marked_useful" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "condition_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"difficulty_weight" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "condition_tags_name_unique" UNIQUE("name"),
	CONSTRAINT "condition_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"logo" text,
	"website" text,
	"description" text,
	"social_links" jsonb,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_user_campaign_unique" UNIQUE("user_id","campaign_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_condition_tags" ADD CONSTRAINT "campaign_condition_tags_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_condition_tags" ADD CONSTRAINT "campaign_condition_tags_tag_id_condition_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."condition_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_tags" ADD CONSTRAINT "campaign_tags_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_tags" ADD CONSTRAINT "campaign_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_translations" ADD CONSTRAINT "campaign_translations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_campaign_id_idx" ON "bookmarks" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_condition_tags_campaign_id_idx" ON "campaign_condition_tags" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_condition_tags_tag_id_idx" ON "campaign_condition_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "campaign_tags_campaign_id_idx" ON "campaign_tags" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_tags_tag_id_idx" ON "campaign_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "campaign_translations_campaign_id_idx" ON "campaign_translations" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_slug_idx" ON "campaigns" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_end_date_idx" ON "campaigns" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "campaigns_platform_id_idx" ON "campaigns" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "campaigns_is_featured_idx" ON "campaigns" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "campaigns_submitted_by_idx" ON "campaigns" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "comment_reactions_comment_id_idx" ON "comment_reactions" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_reactions_user_id_idx" ON "comment_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_campaign_id_idx" ON "comments" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_parent_id_idx" ON "comments" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "condition_tags_slug_idx" ON "condition_tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "condition_tags_type_idx" ON "condition_tags" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "platforms_slug_idx" ON "platforms" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "platforms_status_idx" ON "platforms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reactions_campaign_id_idx" ON "reactions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "reactions_user_id_idx" ON "reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reactions_type_idx" ON "reactions" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");