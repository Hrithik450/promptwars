CREATE TABLE "bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_type" text NOT NULL,
	"account_number" text NOT NULL,
	"balance" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"holder_name" text DEFAULT 'Alex Mercer' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bank_accounts_account_type_unique" UNIQUE("account_type")
);
--> statement-breakpoint
CREATE TABLE "bank_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_type" text NOT NULL,
	"recipient" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"memo" text,
	"status" text DEFAULT 'COMPLETED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firewall_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" text NOT NULL,
	"session_id" text,
	"user_input" text NOT NULL,
	"sanitized_input" text NOT NULL,
	"verdict" text NOT NULL,
	"risk_score" numeric(4, 2) NOT NULL,
	"risk_level" text NOT NULL,
	"threat_category" text NOT NULL,
	"explanation" text NOT NULL,
	"parsed_intent" jsonb,
	"layer_details" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
