import {Notification} from "@entity/notification.entity";
import {NotificationRequest} from "./notification.dto";
import {Injectable, Logger} from "@nestjs/common";
import {customAlphabet} from "nanoid";

@Injectable()
export class NotificationService {
    private readonly generateID = customAlphabet('1234567890' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz', 22);
    private readonly logger = new Logger("Notification Service");
    constructor() {}
    
    public async create(notificationReq: NotificationRequest): Promise<Notification> {
        this.logger.log(`Creating notification for user ${notificationReq.userId} corresponding to reminder ${notificationReq.reminderId}`);
        const {deliverAt, reminderId, userId} = notificationReq;
        const notification = await Notification.create({
            id: this.generateID(), deliverAt, reminderId, userId
        }).save();
        this.logger.log(`Created notification for user ${notificationReq.userId} corresponding to reminder ${notificationReq.reminderId}`);
        return notification;
    }

    public async update(notificationReq: NotificationRequest): Promise<Notification> {
        this.logger.log(`Updating notification for user ${notificationReq.userId} corresponding to reminder ${notificationReq.reminderId}`);
        const {deliverAt, reminderId, userId} = notificationReq;
        const notification = await Notification.findNotificationsByReminderId(userId, reminderId);
        if(!notification) {
            this.logger.warn(`Update failed: Notification for reminder ${reminderId} doesn't exists`);
            return null;
        }
        await Notification.update(notification.id, {deliverAt});
        await notification.reload();
        this.logger.log(`Updated notification for user ${notificationReq.userId} corresponding to reminder ${notificationReq.reminderId}`);
        return notification;
    }

    public async delete(notificationReq: NotificationRequest): Promise<{ id: string; item: Notification; }> {
        this.logger.log(`Deleting notification for user ${notificationReq.userId} corresponding to reminder ${notificationReq.reminderId}`);
        const {reminderId, userId} = notificationReq;
        const notification = await Notification.findNotificationsByReminderId(userId, reminderId);
        if(!notification) {
            this.logger.warn(`Deletion failed: Notification for reminder ${reminderId} doesn't exists`);
            return null;
        }
        const deletedNotificationId = notification.id;
        this.logger.log(`Deleted notification ${deletedNotificationId} for user ${notificationReq.userId} corresponding to reminder ${notificationReq.reminderId}`);
        await notification.remove();
        return {
            id: deletedNotificationId,
            item: notification
        };
    }
}
