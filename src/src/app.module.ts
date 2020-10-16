import {CommonModule} from "@common/common.module";
import {Module} from "@nestjs/common";
import {EventModule} from "@event/event.module";

@Module({
    imports: [
        CommonModule,
        EventModule
    ],
})
export class AppModule {
}
