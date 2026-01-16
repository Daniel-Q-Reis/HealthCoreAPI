package repository

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
)

// AuditLog represents the schema in DynamoDB
type AuditLog struct {
	// PK: ACTOR#<ActorID> | TARGET#<TargetID> (We might need GSI for robust querying)
	// For this MVP, let's stick to PK=EntityID (TargetID) to answer "Who accessed Patient X?"
	// In a real system, we'd use single-table design more aggressively.
	TargetID  string `dynamodbav:"target_id"` // Partition Key
	Timestamp string `dynamodbav:"timestamp"` // Sort Key (ISO8601)

	EventID      string `dynamodbav:"event_id"`
	ActorID      string `dynamodbav:"actor_id"`
	Action       string `dynamodbav:"action"`
	ResourceType string `dynamodbav:"resource_type"`
	IPAddress    string `dynamodbav:"ip_address"`
	Details      string `dynamodbav:"details"`
}

type DynamoRepository struct {
	client    *dynamodb.Client
	tableName string
}

func NewDynamoRepository(ctx context.Context) (*DynamoRepository, error) {
	endpoint := os.Getenv("DYNAMODB_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://dynamodb-local:8000"
	}

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("dummy", "dummy", "")),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	// Override endpoint for local/custom resolver
	client := dynamodb.NewFromConfig(cfg, func(o *dynamodb.Options) {
		o.BaseEndpoint = aws.String(endpoint)
	})

	repo := &DynamoRepository{
		client:    client,
		tableName: "AuditLogs",
	}

	// Create table if not exists (for dev convenience)
	_ = repo.createTableIfNotExists(ctx)

	return repo, nil
}

func (r *DynamoRepository) createTableIfNotExists(ctx context.Context) error {
	_, err := r.client.DescribeTable(ctx, &dynamodb.DescribeTableInput{
		TableName: aws.String(r.tableName),
	})

	if err == nil {
		return nil // Table exists
	}

	log.Printf("Creating DynamoDB table %s...", r.tableName)
	_, err = r.client.CreateTable(ctx, &dynamodb.CreateTableInput{
		TableName: aws.String(r.tableName),
		AttributeDefinitions: []types.AttributeDefinition{
			{AttributeName: aws.String("target_id"), AttributeType: types.ScalarAttributeTypeS},
			{AttributeName: aws.String("timestamp"), AttributeType: types.ScalarAttributeTypeS},
		},
		KeySchema: []types.KeySchemaElement{
			{AttributeName: aws.String("target_id"), KeyType: types.KeyTypeHash},  // PK
			{AttributeName: aws.String("timestamp"), KeyType: types.KeyTypeRange}, // SK
		},
		ProvisionedThroughput: &types.ProvisionedThroughput{
			ReadCapacityUnits:  aws.Int64(5),
			WriteCapacityUnits: aws.Int64(5),
		},
	})
	return err
}

func (r *DynamoRepository) SaveLog(ctx context.Context, logEntry AuditLog) error {
	if logEntry.EventID == "" {
		logEntry.EventID = uuid.New().String()
	}

	item, err := attributevalue.MarshalMap(logEntry)
	if err != nil {
		return err
	}

	_, err = r.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(r.tableName),
		Item:      item,
	})
	return err
}

func (r *DynamoRepository) GetLogs(ctx context.Context, targetID string) ([]AuditLog, error) {
	// Query: PK = targetID
	out, err := r.client.Query(ctx, &dynamodb.QueryInput{
		TableName:              aws.String(r.tableName),
		KeyConditionExpression: aws.String("target_id = :tid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":tid": &types.AttributeValueMemberS{Value: targetID},
		},
		ScanIndexForward: aws.Bool(false), // Newest first
	})
	if err != nil {
		return nil, err
	}

	var logs []AuditLog
	err = attributevalue.UnmarshalListOfMaps(out.Items, &logs)
	return logs, err
}
