type ReminderEvents = "reminder:created" | "reminder:updated" | "reminder:deleted";
type EventItemType = "reminder";
export type EventType = ReminderEvents;

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
