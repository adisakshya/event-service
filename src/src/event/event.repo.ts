import * as AWS from "aws-sdk";
import {customAlphabet} from "nanoid";
import Event from "./event.dto";

type NewEvent = Omit<Event, | "createdAt" | "id" | "ttl">

export class EventRepo {
    private readonly generateID = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 22);
    constructor(private dynamoDB: AWS.DynamoDB.DocumentClient,
                private readonly table: string) {
    }

    async create(params: NewEvent): Promise<Event> {
        const timestamp = Date.now();
        const dynamoItemKV = {
            PK: `USER|${params.userId}`,
            SK: `${new Date(timestamp).toISOString()}`,
            eventType: `${params.eventType}`,
            ttl: timestamp + 90 * 24 * 60 * 60
        };
        const event: Event = {
            id: this.generateID(),
            createdAt: timestamp,
            ...params,
            //@ts-ignore
            eventData: JSON.stringify(params.eventData),
        };
        return this.dynamoDB.put({
            TableName: this.table,
            Item: {...event, ...dynamoItemKV}
        }).promise().then(() => event);
    }
}
