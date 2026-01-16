package main

import (
	"context"
	"log"
	"os"

	"github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/internal/kafka"
	"github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/internal/repository"
)

func main() {
	log.Println("🚀 Starting Audit Service (Go 1.24)...")

	ctx := context.Background()

	// 1. Initialize DynamoDB
	repo, err := repository.NewDynamoRepository(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize DynamoDB: %v", err)
	}
	log.Println("✅ DynamoDB Connection Established")

	// 2. Initialize Kafka Consumer
	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		kafkaBrokers = "kafka:9092"
	}
	log.Printf("📨 Kafka Brokers: %s", kafkaBrokers)

	// We listen to the topic where pure domain events are published
	// Assuming 'healthcore.events' or broadly '*' for pattern matching?
	// For now, let's assume we consume the specific audit/domain topic.
	// In the Django producer (producer.py), we need to ensure where we send events.
	// Let's assume a topic "healthcore.audit.events" exists or we reuse "healthcore.events".
	// Let's stick to "healthcore.events" for now.
	topic := "healthcore.events"

	consumer := kafka.NewConsumer(kafkaBrokers, topic, repo)

	// 3. Start Consumer in Goroutine
	go consumer.Start(ctx)

	// 4. Start gRPC Server (Todo)
	log.Println("📡 gRPC Server listening on port 50051 (Placeholder)")

	// Block forever
	select {}
}
