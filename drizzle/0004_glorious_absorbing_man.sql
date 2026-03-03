ALTER TABLE `subscribers` ADD `unsubscribeToken` varchar(64);--> statement-breakpoint
ALTER TABLE `subscribers` ADD CONSTRAINT `subscribers_unsubscribeToken_unique` UNIQUE(`unsubscribeToken`);