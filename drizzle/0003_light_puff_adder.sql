CREATE TABLE `portal_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`schoolId` int NOT NULL,
	`schoolName` varchar(256) NOT NULL,
	`round` varchar(32) NOT NULL,
	`releaseDate` varchar(32) NOT NULL,
	`notified` boolean NOT NULL DEFAULT false,
	`notifiedAt` timestamp,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portal_subscriptions_id` PRIMARY KEY(`id`)
);
