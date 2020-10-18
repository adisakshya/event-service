import {CommonModule} from "@common/common.module";
import {Module} from "@nestjs/common";
import {EventModule} from "@event/event.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ApiConfigService} from "@common/api-config.service";
import {Notification} from "@entity/notification.entity";
import {NotificationModule} from "@notification/notification.module";

@Module({
    imports: [TypeOrmModule.forRootAsync({
            useFactory: (config: ApiConfigService) => ({
                type: 'postgres',
                username: config.dbUser,
                database: config.dbName,
                password: config.dbPassword,
                host: config.dbHost,
                entities: [Notification],
                logging: !config.isProduction,
                synchronize: false,
            }),
            imports: [CommonModule],
            inject: [ApiConfigService]
        }),
        CommonModule,
        EventModule,
        NotificationModule
    ],
})
export class AppModule {
}
