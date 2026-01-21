package repository

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AuditLog represents the audit log document in MongoDB
type AuditLog struct {
	// MongoDB auto-generates _id, but we'll also keep EventID for consistency
	EventID      string    `bson:"event_id"`
	TargetID     string    `bson:"target_id"`     // Indexed for queries
	Timestamp    time.Time `bson:"timestamp"`     // Indexed for sorting
	ActorID      string    `bson:"actor_id"`      // Who performed the action
	Action       string    `bson:"action"`        // e.g., "VIEWED", "CREATED", "UPDATED"
	ResourceType string    `bson:"resource_type"` // e.g., "PATIENT", "APPOINTMENT"
	IPAddress    string    `bson:"ip_address"`    // Source IP
	Details      string    `bson:"details"`       // JSON payload
}

type MongoRepository struct {
	client     *mongo.Client
	collection *mongo.Collection
}

// NewMongoRepository creates a new MongoDB repository for audit logs
func NewMongoRepository(ctx context.Context) (*MongoRepository, error) {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://mongodb:27017" // Default for docker-compose
	}

	// Connect to MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Ping to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	log.Printf("Connected to MongoDB at %s", mongoURI)

	// Get database and collection
	database := client.Database("audit_logs")
	collection := database.Collection("events")

	repo := &MongoRepository{
		client:     client,
		collection: collection,
	}

	// Create indexes for performance
	if err := repo.createIndexes(ctx); err != nil {
		log.Printf("Warning: failed to create indexes: %v", err)
	}

	return repo, nil
}

// createIndexes creates indexes on target_id and timestamp for efficient queries
func (r *MongoRepository) createIndexes(ctx context.Context) error {
	// Index on target_id (for "Who accessed Patient X?" queries)
	targetIDIndex := mongo.IndexModel{
		Keys: bson.D{{Key: "target_id", Value: 1}},
	}

	// Compound index on target_id + timestamp (for sorted queries)
	compoundIndex := mongo.IndexModel{
		Keys: bson.D{
			{Key: "target_id", Value: 1},
			{Key: "timestamp", Value: -1}, // Descending (newest first)
		},
	}

	// Index on actor_id (for "What did User X do?" queries - future use)
	actorIDIndex := mongo.IndexModel{
		Keys: bson.D{{Key: "actor_id", Value: 1}},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		targetIDIndex,
		compoundIndex,
		actorIDIndex,
	})

	if err != nil {
		return err
	}

	log.Println("MongoDB indexes created successfully")
	return nil
}

// SaveLog saves an audit log entry to MongoDB
func (r *MongoRepository) SaveLog(ctx context.Context, logEntry AuditLog) error {
	// Generate UUID if not provided
	if logEntry.EventID == "" {
		logEntry.EventID = uuid.New().String()
	}

	// Set timestamp if not provided
	if logEntry.Timestamp.IsZero() {
		logEntry.Timestamp = time.Now().UTC()
	}

	_, err := r.collection.InsertOne(ctx, logEntry)
	if err != nil {
		return fmt.Errorf("failed to insert audit log: %v", err)
	}

	log.Printf("Audit log saved: %s (target: %s, actor: %s)", logEntry.EventID, logEntry.TargetID, logEntry.ActorID)
	return nil
}

// GetLogs retrieves audit logs for a specific target (e.g., Patient ID)
// Returns logs sorted by timestamp (newest first)
func (r *MongoRepository) GetLogs(ctx context.Context, targetID string) ([]AuditLog, error) {
	// Query filter
	filter := bson.M{"target_id": targetID}

	// Sort options (newest first)
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to query audit logs: %v", err)
	}
	defer cursor.Close(ctx)

	var logs []AuditLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, fmt.Errorf("failed to decode audit logs: %v", err)
	}

	log.Printf("Retrieved %d audit logs for target: %s", len(logs), targetID)
	return logs, nil
}

// Close closes the MongoDB connection
func (r *MongoRepository) Close(ctx context.Context) error {
	return r.client.Disconnect(ctx)
}
