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

    get dbName(): string {
        // Get name of the database from environment or use alternative for local development
        return this.configService.get<string>('DB_NAME') ?? 'notifications';
    }

    get dbHost(): string {
        // Get host of the database from environment or use alternative for local development
        return this.configService.get<string>('DB_HOST') ?? '192.168.99.100';
    }

    get dbPassword(): string {
        // Get password of the database from environment or use alternative for local development
        return this.configService.get<string>('DB_PASS') ?? 'root';
    }

    get dbUser(): string {
        // Get user of the database from environment or use alternative for local development
        return this.configService.get<string>('DB_USER') ?? 'root';
    }

    get eventTable(): string {
        return this.configService.get<string>('EVENT_STORE') ?? 'event-store';
    }

    get eventTopicArn(): string{
        return this.configService.get<string>('EVENT_TOPIC_ARN') ?? 'arn:aws:sns:us-east-1:000000000000:event';
    }
}
