import {Inject, Injectable, Logger} from '@nestjs/common';
import {classToPlain} from "class-transformer";
import Event from "./event.dto";
import {EventRepo} from "./event.repo";
import * as AWS from "aws-sdk";

type NewEvent = Omit<Event, "createdAt" | "id" | "itemType" | "ttl" | "eventType">

@Injectable()
export class EventService {
    private readonly logger = new Logger("Event Service");
    constructor(private readonly eventRepo: EventRepo,
                @Inject("AWS-SNS")
                private readonly sns: AWS.SNS) {
    }

    private async createEvent(params: Pick<Event, "itemId" | "itemType" | "eventType" | "eventData" | "userId">): Promise<Event> {
        this.logger.log(`Creating event ${params.eventType} for user ${params.userId} on item ${params.itemId}`);
        const event = await this.eventRepo.create(params);
        this.logger.log(`Event created ${event.id} for user ${params.userId}`);
        return event;
    }

    public async reminderAdded(event: NewEvent) {
        return this.createEvent({
            ...event, eventData: classToPlain(event.eventData),
            eventType: "reminder:created", itemType: "reminder",
        });
    }

    public async reminderUpdated(event: NewEvent & { userEmail: string, bookmark: any }) {
        return this.createEvent({
            ...event, eventData: classToPlain(event.eventData),
            eventType: "reminder:updated", itemType: "reminder"
        });
    }

    public async reminderDeleted(event: NewEvent & { userEmail: string}) {
        return this.createEvent({
            ...event, eventData: classToPlain(event.eventData),
            eventType: "reminder:deleted", itemType: "reminder"
        });
    }

}
