package kafka

import (
	"context"
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/internal/repository"
	"github.com/segmentio/kafka-go"
)

// EventPayload matches the Django event structure
type EventPayload struct {
	EventID   string `json:"event_id"`
	Type      string `json:"type"`
	Timestamp string `json:"timestamp"`
	Payload   struct {
		ActorID      string `json:"actor_id"`
		TargetID     string `json:"target_id"`
		ResourceType string `json:"resource_type"`
		Action       string `json:"action"`
		Details      string `json:"details"` // Or map[string]interface{}
	} `json:"payload"`
}

type Consumer struct {
	reader *kafka.Reader
	repo   *repository.DynamoRepository
}

func NewConsumer(brokers string, topic string, repo *repository.DynamoRepository) *Consumer {
	brokersList := strings.Split(brokers, ",")

	// Custom dialer to force TCP network and proper DNS resolution
	dialer := &kafka.Dialer{
		Timeout:   10 * time.Second,
		DualStack: true,
	}

	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  brokersList,
		Topic:    topic,
		GroupID:  "audit-service-group",
		Dialer:   dialer,
		MinBytes: 10e3,
		MaxBytes: 10e6,
		MaxWait:  1 * time.Second,
	})

	return &Consumer{
		reader: r,
		repo:   repo,
	}
}

func (c *Consumer) Start(ctx context.Context) {
	log.Println("Starting Kafka Consumer...")
	log.Println("✅ Kafka Consumer connected successfully! Waiting for messages...")

	for {
		// Use FetchMessage with timeout instead of ReadMessage to avoid blocking forever
		ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
		m, err := c.reader.FetchMessage(ctx)
		cancel()

		if err != nil {
			if err == context.DeadlineExceeded {
				// Timeout is normal when no messages - show heartbeat
				log.Println("💓 Consumer heartbeat: No messages yet, still listening...")
				continue
			}
			log.Printf("Error reading message: %v", err)
			time.Sleep(5 * time.Second) // Backoff before retry
			continue
		}

		// Process message
		log.Printf("Received message from partition %d: %s", m.Partition, string(m.Value))

		var event EventPayload
		if err := json.Unmarshal(m.Value, &event); err != nil {
			log.Printf("Error unmarshalling event: %v", err)
			c.reader.CommitMessages(context.Background(), m) // Commit even on error to move forward
			continue
		}

		// Transform to AuditLog
		auditLog := repository.AuditLog{
			TargetID:     event.Payload.TargetID,
			Timestamp:    event.Timestamp,
			EventID:      event.EventID,
			ActorID:      event.Payload.ActorID,
			Action:       event.Payload.Action,
			ResourceType: event.Payload.ResourceType,
			Details:      event.Payload.Details,
		}

		// If TargetID is missing, use ActorID as partitioning key
		if auditLog.TargetID == "" {
			auditLog.TargetID = auditLog.ActorID
		}

		// Save to DynamoDB
		if err := c.repo.SaveLog(context.Background(), auditLog); err != nil {
			log.Printf("Error saving to DynamoDB: %v", err)
		} else {
			log.Println("✅ Audit Log saved successfully via Kafka!")
		}

		// Commit the message
		if err := c.reader.CommitMessages(context.Background(), m); err != nil {
			log.Printf("Error committing message: %v", err)
		}
	}
}
