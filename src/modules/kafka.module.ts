import { Module } from '@nestjs/common';
import { KafkaProducerService } from '../services/kafkaProducer.service';

@Module({
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
