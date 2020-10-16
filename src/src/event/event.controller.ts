import {Controller} from '@nestjs/common';
import {Logger} from '@nestjs/common';
import {Consumer} from 'sqs-consumer';
import {EventService} from "@event/event.service";

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

    constructor(private readonly eventService: EventService ) {
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
}
