import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class ApiConfigService {

    constructor(private readonly configService: ConfigService) {
    }

    get region(): string {
        return this.configService.get('ECS_REGION') ?? 'us-east-1';
    }

    get isProduction(): boolean {
        return this.configService.get<string>('NODE_ENV') === 'production';
    }

    get eventTable(): string {
        return this.configService.get<string>('EVENT_STORE') ?? 'event-store';
    }

    get notificationTopicArn(): string{
        return this.configService.get<string>('NOTIFICATION_EVENTS_TOPIC_ARN') ?? 'arn:aws:sns:us-east-1:000000000000:notification';
    }
}