import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private producer: Producer;

    constructor() {
        this.kafka = new Kafka({
            clientId: 'auth-service',
            brokers: ['localhost:9092'],
        });
        this.producer = this.kafka.producer();
    }

    async onModuleInit() {
        await this.producer.connect();
        console.log("Connected to producer");
    }

    async sendLoginEvent(username: string) {
        try {
            const message = JSON.stringify({ username, timestamp: new Date() });
            console.log('Sending message to Kafka:', message);
            console.log('Message size:', Buffer.byteLength(message, 'utf8'), 'bytes');
            
            await this.producer.send({
                topic: 'Logins',
                messages: [{ value: message }],
            });
            
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Failed to send message to Kafka:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.producer.disconnect();
    }
}