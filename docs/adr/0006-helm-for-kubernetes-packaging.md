# ADR-0006: Helm for Kubernetes Application Packaging

**Status:** Accepted
**Date:** 2025-10-22

## Context

To deploy our application to Kubernetes in a repeatable, configurable, and manageable way, we need a standardized packaging format. Managing raw Kubernetes YAML manifests is prone to error, difficult to version, and does not scale well across different environments (development, staging, production).

## Decision

We will adopt **Helm** as the package manager for our Kubernetes applications.

A Helm chart will be created for the `healthcoreapi` monolith. This chart will contain templated Kubernetes manifests for all the necessary resources, including:
- `Deployment`: To manage the application pods.
- `Service`: To expose the application within the cluster.
- `Ingress`: To manage external access to the application.
- `ConfigMap` / `Secret`: To manage configuration and secrets (initially, with a plan to move to Azure Key Vault CSI driver).
- `HorizontalPodAutoscaler`: For automatic scaling based on CPU/memory.

The chart will be located in the `charts/` directory of the main repository.

## Consequences

**Positive:**
- **Repeatability & Versioning:** Charts can be versioned and stored in a repository, ensuring consistent deployments.
- **Configurability:** A single chart can be used to deploy to multiple environments using different `values.yaml` files.
- **Lifecycle Management:** Helm simplifies the process of installing, upgrading, and rolling back applications in Kubernetes.
- **Ecosystem:** Helm is the de facto standard for Kubernetes packaging, with a large community and a wealth of existing charts for third-party applications.

**Negative:**
- **Learning Curve:** Introduces a new tool and templating language (Go templates) that the team must learn.
- **Templating Complexity:** Complex charts can become difficult to read and debug. This will be mitigated by keeping the templates modular and well-commented.
