import {Notification} from "@entity/notification.entity";
import {NotificationRequest} from "./notification.dto";
import {Injectable, Logger} from "@nestjs/common";
import {customAlphabet} from "nanoid";
import { brotliCompress } from "zlib";

@Injectable()
export class NotificationService {
    private readonly generateID = customAlphabet('1234567890' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz', 22);
    private readonly logger = new Logger("Notification Service");
    constructor() {}
    
    public async create(userId: string, notificationReq: NotificationRequest): Promise<{ id: string; }> {
        this.logger.log(`Creating notification for user ${userId} corresponding to reminder ${notificationReq.reminderId}`);
        const {deliverAt, reminderId} = notificationReq;
        const notification = await Notification.create({
            id: this.generateID(), deliverAt, userId, reminderId
        }).save();
        this.logger.log(`Created notification for user ${userId} corresponding to reminder ${notificationReq.reminderId}`);
        return {
            id: notification.id
        };
    }

    public async update(userId: string, notificationReq: NotificationRequest): Promise<Notification> {
        this.logger.log(`Updating notification for user ${userId} corresponding to reminder ${notificationReq.reminderId}`);
        const {deliverAt, reminderId} = notificationReq;
        const notification = await Notification.findNotificationsByReminderId(userId, reminderId);
        await Notification.update(notification.id, {deliverAt});
        await notification.reload();
        this.logger.log(`Updated notification for user ${userId} corresponding to reminder ${notificationReq.reminderId}`);
        return notification;
    }

    public async delete(userId: string, notificationReq: NotificationRequest): Promise<void> {
        this.logger.log(`Deleting notification for user ${userId} corresponding to reminder ${notificationReq.reminderId}`);
        const {reminderId} = notificationReq;
        const notification = await Notification.findNotificationsByReminderId(userId, reminderId);
        if(!notification) {
            this.logger.warn(`Deletion failed: Notification for reminder ${reminderId} doesn't exists`);
            return;
        }
        const deletedNotificationId = notification.id;
        this.logger.log(`Deleted notification ${deletedNotificationId} for user ${userId} corresponding to reminder ${notificationReq.reminderId}`);
        await notification.remove();
    }
}
