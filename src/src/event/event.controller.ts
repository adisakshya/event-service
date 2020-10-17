import {Controller} from '@nestjs/common';
import {Logger} from '@nestjs/common';
import {Consumer} from 'sqs-consumer';
import {EventService} from "@event/event.service";
import {NotificationService} from '@notification/notification.service';

@Controller('event')
export class EventController {
    private readonly logger = new Logger("Event Controller");
    private readonly app = Consumer.create({
        queueUrl: process.env.EVENT_QUEUE_URL,
        handleMessage: async (message) => {
            await this.handleEvent(message);
        }
    })
    .on('error', (err) => {
        this.logger.error(err);
    })
    .on('processing_error', (err) => {
        this.logger.error(err);
    })
    .on('timeout_error', (err) => {
        this.logger.error(err);
    });

    constructor(private readonly notificationService: NotificationService,
                private readonly eventService: EventService) {
        this.app.start();
        this.logger.log(`SQS event consumer running: ${this.app.isRunning}`);
    }

    private async handleEvent(message): Promise<void> {
        this.logger.log('Received event message');
        const eventData = JSON.parse(message.Body);
        if (!eventData?.MessageAttributes?.eventItemType) {
            // Error
            this.logger.error('Event item-type is undefined');
            return;
        }
        switch(eventData.MessageAttributes.eventItemType.Value) {
            case 'reminder':
                await this.reminderEvent(eventData);
                break;
            case 'notification':
                await this.notificationEvent(eventData);
                break;
            default:
                this.logger.error('Unknown event-item');
        }
    }

    private async reminderEvent(eventData: any): Promise<void> {
        this.logger.log(`Recieved ${eventData.MessageAttributes.eventType.Value} event`);
        switch(eventData.MessageAttributes.eventType.Value) {
            case 'reminder:created':
                await this.eventService.reminderAdded(JSON.parse(eventData.Message));
                break;
            case 'reminder:updated':
                await this.eventService.reminderUpdated(JSON.parse(eventData.Message));
                break;
            case 'reminder:deleted':
                await this.eventService.reminderDeleted(JSON.parse(eventData.Message));
                break;
            default:
                this.logger.error('Unknown event-type');
        }
    }

    private async notificationEvent(eventData: any): Promise<void> {
        this.logger.log(`Recieved ${eventData.MessageAttributes.eventType.Value} event`);
        const eventMessage = JSON.parse(eventData.Message);
        switch(eventData.MessageAttributes.eventType.Value) {
            case 'notification:create':
                const createdNotification = await this.notificationService.create({
                    userId: eventMessage.userId,
                    userEmail: eventMessage.userEmail,
                    reminderId: eventMessage.itemId,
                    deliverAt: eventMessage.eventData.date
                });
                await this.eventService.notificationCreated({
                    userId: eventMessage.userId,
                    userEmail: eventMessage.userEmail,
                    itemId: createdNotification.id,
                    eventData: {...createdNotification}
                });
                break;
            case 'notification:update':
                const updatedNotification = await this.notificationService.update({
                    userId: eventMessage.userId,
                    userEmail: eventMessage.userEmail,
                    reminderId: eventMessage.itemId,
                    deliverAt: eventMessage.eventData.date
                });
                if(!updatedNotification) {
                    break;
                }
                await this.eventService.notificationUpdated({
                    userId: eventMessage.userId,
                    userEmail: eventMessage.userEmail,
                    itemId: updatedNotification.id,
                    eventData: {...updatedNotification}
                });
                break;
            case 'notification:delete':
                const deletedNotification = await this.notificationService.delete({
                    userId: eventMessage.userId,
                    userEmail: eventMessage.userEmail,
                    reminderId: eventMessage.itemId,
                    deliverAt: eventMessage.eventData.date
                });
                if(!deletedNotification) {
                    break;
                }
                await this.eventService.notificationDeleted({
                    userId: eventMessage.userId,
                    userEmail: eventMessage.userEmail,
                    itemId: deletedNotification.id,
                    eventData: {...deletedNotification}
                });
                break;
            default:
                this.logger.error('Unknown event-type');
        }
    }
}
