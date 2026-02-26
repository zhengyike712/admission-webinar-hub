CREATE TABLE `crawl_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`schoolName` varchar(256) NOT NULL,
	`crawlUrl` text NOT NULL,
	`status` enum('success','failed','partial') NOT NULL,
	`sessionsFound` int NOT NULL DEFAULT 0,
	`sessionsUpdated` int NOT NULL DEFAULT 0,
	`consecutiveFailures` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`rawContent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crawl_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(128) NOT NULL,
	`schoolId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`type` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`dates` json,
	`time` varchar(64),
	`duration` varchar(64),
	`registrationUrl` text NOT NULL,
	`isRolling` boolean NOT NULL DEFAULT false,
	`partnerSchools` json,
	`lastCrawledAt` timestamp,
	`crawlSourceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`regions` json,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
