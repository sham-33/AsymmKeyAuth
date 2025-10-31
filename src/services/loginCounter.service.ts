import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Consumer, Kafka } from "kafkajs";
import { User } from "../entities/user.entity";

@Injectable()
export class LoginCounterService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private consumer: Consumer;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
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
                    
                    // Increment login count in database
                    await this.incrementLoginCount(username);
                    
                    // Get current count from database
                    const count = await this.getLoginCount(username);
                    console.log(`${username} has logged in ${count} times`);
                } catch (error) {
                    console.error('Error processing Kafka message:', error);
                }
            },
        });
    }

    async incrementLoginCount(username: string): Promise<void> {
        await this.userRepository.increment({ username }, 'loginCount', 1);
    }

    async getLoginCount(username: string): Promise<number> {
        const user = await this.userRepository.findOne({ where: { username } });
        return user?.loginCount ?? 0;
    }

    async resetLoginCount(username: string): Promise<void> {
        await this.userRepository.update({ username }, { loginCount: 0 });
    }

    isBlocked(loginCount: number): boolean {
        return loginCount >= 3;
    }

    async onModuleDestroy() {
        await this.consumer.disconnect();
    }
}