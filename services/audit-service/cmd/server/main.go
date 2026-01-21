package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"

	grpcservice "github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/internal/grpc"
	"github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/internal/kafka"
	"github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/internal/repository"
	pb "github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/proto"
	"google.golang.org/grpc"
)

func main() {
	log.Println("🚀 Starting Audit Service (Go 1.24)...")

	ctx := context.Background()

	// 1. Initialize MongoDB
	repo, err := repository.NewMongoRepository(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize MongoDB: %v", err)
	}
	log.Println("✅ MongoDB Connection Established")

	// 2. Initialize Kafka Consumer
	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		kafkaBrokers = "kafka:9092"
	}
	log.Printf("📨 Kafka Brokers: %s", kafkaBrokers)

	topic := "healthcore.events"
	consumer := kafka.NewConsumer(kafkaBrokers, topic, repo)

	// 3. Start Consumer in Goroutine
	go consumer.Start(ctx)

	// 4. Start gRPC Server
	log.Println("📡 Starting gRPC Server on port 50051...")
	if err := startGRPCServer(repo); err != nil {
		log.Fatalf("Failed to start gRPC server: %v", err)
	}
}

func startGRPCServer(repo *repository.MongoRepository) error {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		return fmt.Errorf("failed to listen: %w", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterAuditServiceServer(grpcServer, grpcservice.NewAuditServer(repo))

	log.Println("✅ gRPC Server listening on :50051")
	return grpcServer.Serve(lis)
}
