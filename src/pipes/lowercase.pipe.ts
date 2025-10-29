import { PipeTransform, Injectable, Inject, ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class LowercasePipe implements PipeTransform {
    transform(value: any) {
        return value.toLowerCase();
    }
}