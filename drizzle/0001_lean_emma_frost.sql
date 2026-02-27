CREATE TABLE `interview_verifications` (
	`id` varchar(128) NOT NULL,
	`schoolName` varchar(256) NOT NULL,
	`portalUrl` text NOT NULL,
	`verifiedDeadline` varchar(16),
	`rawDeadlineText` text,
	`matches` boolean,
	`status` enum('ok','changed','not_found','error') NOT NULL DEFAULT 'ok',
	`errorMessage` text,
	`rawContent` text,
	`lastVerifiedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interview_verifications_id` PRIMARY KEY(`id`)
);
