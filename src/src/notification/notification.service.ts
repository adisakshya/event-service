import {Notification} from "@entity/notification.entity";
import {NotificationRequest} from "./notification.dto";
import {Injectable, Logger} from "@nestjs/common";
import {customAlphabet} from "nanoid";

@Injectable()
export class NotificationService {

    private readonly generateID = customAlphabet('1234567890' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz', 22);
    private readonly logger = new Logger("Notification Service");
    constructor() {}

    public async create(userId: string, notificationReq: NotificationRequest): Promise<{ id: string; }> {
        const {deliverAt, reminderId} = notificationReq;
        const notification = await Notification.create({
            id: this.generateID(), deliverAt, userId, reminderId
        }).save();
        return {
            id: notification.id
        };
    }

    public async update(userId: string, notificationReq: NotificationRequest): Promise<Notification> {
        const {deliverAt, reminderId} = notificationReq;
        const notification = await Notification.findNotificationsByReminderId(userId, reminderId);
        await Notification.update(notification.id, {deliverAt});
        await notification.reload();
        return notification;
    }

    public async delete(userId: string, notificationReq: NotificationRequest): Promise<void> {
        const {deliverAt, reminderId} = notificationReq;
        const notification = await Notification.findNotificationsByReminderId(userId, reminderId);
        const deletedNotificationId = notification.id;
        await notification.remove();
    }

}
