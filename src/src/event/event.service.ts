import {Inject, Injectable, Logger} from '@nestjs/common';
import {ApiConfigService} from "@common/api-config.service";
import {classToPlain} from "class-transformer";
import Event from "./event.dto";
import {EventRepo} from "./event.repo";
import * as AWS from "aws-sdk";

type NewEvent = Omit<Event, "createdAt" | "id" | "itemType" | "ttl" | "eventType">

@Injectable()
export class EventService {
    private readonly logger = new Logger("Event Service");
    constructor(private readonly eventRepo: EventRepo,
                @Inject('AWS-SNS')
                private readonly sns: AWS.SNS,
                private readonly configService: ApiConfigService) {
    }

    private async createEvent(params: Pick<Event, "itemId" | "itemType" | "eventType" | "eventData" | "userId">): Promise<Event> {
        this.logger.log(`Creating event ${params.eventType} for user ${params.userId} on item ${params.itemId}`);
        const event = await this.eventRepo.create(params);
        this.logger.log(`Event created ${event.id} for user ${params.userId}`);
        return event;
    }

    public async reminderAdded(event: NewEvent & { userEmail: string }): Promise<void> {
        this.sns.publish({
            Message: JSON.stringify({
                userId: event.userId,
                userEmail: event.userEmail,
                itemId: event.itemId,
                eventData: event.eventData
            }),
            MessageAttributes: {
                eventItemType: {
                    DataType: 'String',
                    StringValue: 'notification'
                },
                eventType: {
                    DataType: 'String',
                    StringValue: 'notification:create'
                }
            },
            TopicArn: this.configService.eventTopicArn
        }).promise();
        await this.createEvent({
            ...event, eventData: classToPlain(event.eventData),
            eventType: "reminder:created", itemType: "reminder",
        });
    }

    public async reminderUpdated(event: NewEvent & { userEmail: string, bookmark: any }): Promise<void> {
        this.sns.publish({
            Message: JSON.stringify({
                userId: event.userId,
                userEmail: event.userEmail,
                itemId: event.itemId,
                eventData: event.eventData
            }),
            MessageAttributes: {
                eventItemType: {
                    DataType: 'String',
                    StringValue: 'notification'
                },
                eventType: {
                    DataType: 'String',
                    StringValue: 'notification:update'
                }
            },
            TopicArn: this.configService.eventTopicArn
        }).promise();
        await this.createEvent({
            ...event, eventData: classToPlain(event.eventData),
            eventType: "reminder:updated", itemType: "reminder"
        });
    }

    public async reminderDeleted(event: NewEvent & { userEmail: string}): Promise<void> {
        this.sns.publish({
            Message: JSON.stringify({
                userId: event.userId,
                userEmail: event.userEmail,
                itemId: event.itemId,
                eventData: event.eventData
            }),
            MessageAttributes: {
                eventItemType: {
                    DataType: 'String',
                    StringValue: 'notification'
                },
                eventType: {
                    DataType: 'String',
                    StringValue: 'notification:delete'
                }
            },
            TopicArn: this.configService.eventTopicArn
        }).promise();
        await this.createEvent({
            ...event, eventData: classToPlain(event.eventData),
            eventType: "reminder:deleted", itemType: "reminder"
        });
    }

    public async notificationAdded() {
        this.logger.debug('Add notification:created event in event-store');
    }

    public async notificationUpdated() {
        this.logger.debug('Add notification:updated event in event-store');
    }

    public async notificationDeleted() {
        this.logger.debug('Add notification:deleted event in event-store');
    }

}
