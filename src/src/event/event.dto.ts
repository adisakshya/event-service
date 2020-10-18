type ReminderEvents = "reminder:created" | "reminder:updated" | "reminder:deleted";
type NotificationEvents = "notification:created" | "notification:updated" | "notification:deleted";
type EventItemType = "reminder" | "notification";
export type EventType = ReminderEvents | NotificationEvents;

export default interface Event {
    id: string;
    userId: string;
    createdAt: number;
    itemType: EventItemType;
    itemId: string;
    eventType: EventType;
    eventData: {
        [key: string]: any
    };
}
