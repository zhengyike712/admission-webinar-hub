CREATE TABLE `crawl_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`schoolName` varchar(256) NOT NULL,
	`crawlUrl` text NOT NULL,
	`status` enum('success','failed','partial') NOT NULL,
	`sessionsFound` int NOT NULL DEFAULT 0,
	`sessionsUpdated` int NOT NULL DEFAULT 0,
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
	`dates` json DEFAULT ('null'),
	`time` varchar(64),
	`duration` varchar(64),
	`registrationUrl` text NOT NULL,
	`isRolling` boolean NOT NULL DEFAULT false,
	`partnerSchools` json DEFAULT ('[]'),
	`lastCrawledAt` timestamp,
	`crawlSourceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
