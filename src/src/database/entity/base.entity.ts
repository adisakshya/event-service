import { Exclude } from "class-transformer";
import { BaseEntity, Column, CreateDateColumn, Index, PrimaryColumn, UpdateDateColumn } from "typeorm";

export class UserItemEntity extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @Column()
    @Index()
    userId: string;
}
