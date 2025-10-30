import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Consumer, Kafka } from "kafkajs";

@Injectable()
export class LoginCounterService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private consumer: Consumer;
    private loginCounts: Map<string, number> = new Map();

    constructor() {
        this.kafka = new Kafka({
            clientId: 'auth-service',
            brokers: ['localhost:9092']
        })
        this.consumer = this.kafka.consumer({ groupId: 'login-counter' });
    }

    async onModuleInit() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'Logins' });

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) {
                    console.warn('Received message with null value, skipping...');
                    return;
                }

                try {
                    const { username } = JSON.parse(message.value.toString());
                    if (!username) {
                        console.warn('Received message without username, skipping...');
                        return;
                    }
                    
                    const count = (this.loginCounts.get(username) || 0) + 1;
                    this.loginCounts.set(username, count);
                    console.log(`${username} has logged in ${count} times`);
                } catch (error) {
                    console.error('Error processing Kafka message:', error);
                }
            },
        });

    }
    getLoginCount(username: string): number {
        return this.loginCounts.get(username) || 0;
    }

    async onModuleDestroy() {
        await this.consumer.disconnect();
    }
}