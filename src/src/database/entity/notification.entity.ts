import {UserItemEntity} from "@entity/base.entity";
import {Column, CreateDateColumn, Entity} from "typeorm";

@Entity()
export class Notification extends UserItemEntity {
    /**
     * Date and time of delivery of notification
     */
    @CreateDateColumn()
    deliverAt: Date;

    /**
     * Source of notification
     */
    @Column({nullable: false})
    itemType: string;

    /**
     * Notification Data - Stringified JSON data
     */
    @Column({nullable: false})
    notificationData: string;

    public static findNotificationsByReminderId(userId: string, reminderId: string): Promise<Notification> {
        return this.findOne({
            where: {userId, reminderId},
            order: {createdAt: "DESC"}
        });
    }
}
