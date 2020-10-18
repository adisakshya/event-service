import {UserItemEntity} from "@entity/base.entity";
import {Column, CreateDateColumn, Entity} from "typeorm";

@Entity()
export class Notification extends UserItemEntity {
    @CreateDateColumn()
    deliverAt: Date;

    @Column({nullable: false})
    reminderId: string;

    public static findNotificationsByReminderId(userId: string, reminderId: string): Promise<Notification> {
        return this.findOne({
            where: {userId, reminderId},
            order: {createdAt: "DESC"}
        });
    }
}
