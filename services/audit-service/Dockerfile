# Build Stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install system dependencies (for potential CGO or SSL)
RUN apk add --no-cache git ca-certificates

# Copy go mod definitions
COPY go.mod ./
# COPY go.sum ./ # Not created yet, will be created by `go mod tidy` in the container

# Download dependencies
# RUN go mod download # Skipped for now, will run in the next step when we build

# Copy source code
COPY . .

# Build the application
# We will build it as a static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o audit-service ./cmd/server

# Development Stage
FROM golang:1.24-alpine AS development
WORKDIR /app
RUN apk add --no-cache git protobuf protobuf-dev
# Install Go Protobuf plugins
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@latest && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
# Copy mod files first for caching
COPY go.mod ./
# Copy source
COPY . .
# Keep container running for exec interactions or use air/go run
CMD ["go", "run", "./cmd/server/main.go"]

# Final Stage (Distroless for security and size)
FROM gcr.io/distroless/static-debian12

WORKDIR /app

COPY --from=builder /app/audit-service .

# Expose gRPC port
EXPOSE 50051

# Run the binary
CMD ["./audit-service"]
