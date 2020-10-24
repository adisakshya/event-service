import {ApiConfigService} from "@common/api-config.service";
import {CommonModule} from "@common/common.module";
import {Logger, Module} from '@nestjs/common';
import * as AWS from "aws-sdk";
import {EventRepo} from "./event.repo";
import {EventService} from "./event.service";
import {EventController} from "./event.controller";
import {NotificationModule} from "@notification/notification.module";

@Module({
    providers: [
        {
            provide: 'AWS-SNS',
            inject: [Logger],
            useFactory: () => new AWS.SNS({
                region: 'us-east-1'
            }),
        },
        {
            provide: EventRepo,
            inject: [ApiConfigService],
            useFactory: (config: ApiConfigService) => new EventRepo(
                new AWS.DynamoDB.DocumentClient({
                    "apiVersion": "2012-08-10",
                    "region":"us-east-1",
                    "endpoint": config.isProduction ? undefined : "http://192.168.99.100:8000"               
                }),
                config.eventTable
            ),
        },
        EventService,
    ],
    controllers: [EventController],
    imports: [
        NotificationModule,
        CommonModule
    ],
})
export class EventModule {
}
