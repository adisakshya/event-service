import {ApiConfigService} from "@common/api-config.service";
import {ConfigModule} from "@nestjs/config";
import {Logger, Module, Provider} from '@nestjs/common';
import * as AWS from "aws-sdk";
import { config } from "process";

const provideSNS = (): Provider => {
    return {
        provide: 'AWS-SNS',
        useFactory: (configService: ApiConfigService) => new AWS.SNS({
            region: configService.region,
        }),
        inject: [ApiConfigService],
    };
};

@Module({
    providers: [
        provideSNS(),
        Logger, ApiConfigService
    ],
    exports: [Logger, ApiConfigService, 'AWS-SNS'],
    imports: [ConfigModule.forRoot()]
})
export class CommonModule {
}
