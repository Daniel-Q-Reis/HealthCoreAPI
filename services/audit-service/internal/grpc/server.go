package grpc

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/internal/repository"
	pb "github.com/Daniel-Q-Reis/HealthCoreAPI/services/audit-service/proto"
	"github.com/google/uuid"
)

// AuditServer implements the AuditService gRPC interface
type AuditServer struct {
	pb.UnimplementedAuditServiceServer
	repo *repository.DynamoRepository
}

// NewAuditServer creates a new gRPC server instance
func NewAuditServer(repo *repository.DynamoRepository) *AuditServer {
	return &AuditServer{
		repo: repo,
	}
}

// LogEvent records a new audit event directly via gRPC
// This is an alternative to Kafka for synchronous logging
func (s *AuditServer) LogEvent(ctx context.Context, req *pb.LogEventRequest) (*pb.LogEventResponse, error) {
	log.Printf("📝 gRPC LogEvent called: actor=%s, action=%s, target=%s", req.ActorId, req.Action, req.TargetId)

	// Generate event ID if not provided
	eventID := uuid.New().String()

	// Use provided timestamp or current time
	timestamp := time.Now().UTC().Format(time.RFC3339)
	if req.Timestamp > 0 {
		timestamp = time.Unix(req.Timestamp, 0).UTC().Format(time.RFC3339)
	}

	// Default target to actor if not provided (self-action like login)
	targetID := req.TargetId
	if targetID == "" {
		targetID = req.ActorId
	}

	// Create audit log entry
	auditLog := repository.AuditLog{
		EventID:      eventID,
		TargetID:     targetID,
		Timestamp:    timestamp,
		ActorID:      req.ActorId,
		Action:       req.Action,
		ResourceType: req.ResourceType,
		IPAddress:    req.IpAddress,
		Details:      req.Details,
	}

	// Save to DynamoDB
	if err := s.repo.SaveLog(ctx, auditLog); err != nil {
		log.Printf("❌ Error saving audit log via gRPC: %v", err)
		return nil, fmt.Errorf("failed to save audit log: %w", err)
	}

	log.Printf("✅ Audit log saved via gRPC: event_id=%s", eventID)

	return &pb.LogEventResponse{
		Success: true,
		EventId: eventID,
	}, nil
}

// GetAuditLogs retrieves audit logs for a specific entity
func (s *AuditServer) GetAuditLogs(ctx context.Context, req *pb.GetAuditLogsRequest) (*pb.GetAuditLogsResponse, error) {
	log.Printf("🔍 gRPC GetAuditLogs called: target_id=%s, limit=%d", req.TargetId, req.Limit)

	// Validate request
	if req.TargetId == "" {
		return nil, fmt.Errorf("target_id is required")
	}

	// Query DynamoDB
	logs, err := s.repo.GetLogs(ctx, req.TargetId)
	if err != nil {
		log.Printf("❌ Error retrieving audit logs: %v", err)
		return nil, fmt.Errorf("failed to retrieve audit logs: %w", err)
	}

	// Apply limit if specified
	limit := int(req.Limit)
	if limit > 0 && len(logs) > limit {
		logs = logs[:limit]
	}

	// Convert to protobuf format
	entries := make([]*pb.AuditLogEntry, 0, len(logs))
	for _, log := range logs {
		entries = append(entries, &pb.AuditLogEntry{
			EventId:      log.EventID,
			ActorId:      log.ActorID,
			Action:       log.Action,
			TargetId:     log.TargetID,
			ResourceType: log.ResourceType,
			IpAddress:    log.IPAddress,
			Details:      log.Details,
			Timestamp:    log.Timestamp,
		})
	}

	log.Printf("✅ Retrieved %d audit logs for target_id=%s", len(entries), req.TargetId)

	return &pb.GetAuditLogsResponse{
		Logs:      entries,
		NextToken: "", // TODO: Implement pagination token if needed
	}, nil
}
