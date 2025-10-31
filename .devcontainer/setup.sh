#!/bin/bash
set -e

echo "🔧 Configuring DevContainer..."

# Load environment variables from .env if it exists
load_env_vars() {
    if [ -f ".env" ]; then
        echo "📋 Loading environment variables from .env"
        # Safe loading with proper quote handling
        set -a  # Automatically export variables
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^[[:space:]]*# ]] && continue
            [[ -z $key ]] && continue
            # Remove surrounding quotes if present
            value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
            # Export the variable
            export "$key"="$value"
        done < <(grep -E '^[A-Z_][A-Z0-9_]*=' .env)
        set +a  # Stop automatically exporting
    fi
}

# Load environment variables
load_env_vars

# Configure Git with environment variables or sensible defaults
echo "🔧 Configuring Git..."
git_name="${GIT_AUTHOR_NAME:-Developer}"
git_email="${GIT_AUTHOR_EMAIL:-developer@localhost}"

git config --global user.name "$git_name"
git config --global user.email "$git_email"
git config --global init.defaultBranch main
git config --global --add safe.directory '/workspaces/*'

echo "✅ Git configured: $git_name <$git_email>"

# Fix .git permissions for non-root user
if [ -d ".git" ]; then
    sudo chown -R $(whoami) .git/
    chmod -R u+w .git/
    echo "✅ Git permissions fixed"
fi

# Configure kubectl based on environment detection
configure_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo "⚠️  kubectl not found, skipping Kubernetes configuration"
        return
    fi

    echo "🔧 Configuring kubectl..."

    # Clean any existing config
    rm -rf ~/.kube/config
    mkdir -p ~/.kube

    # Use environment variables for Azure configuration if provided
    local azure_rg="${AZURE_RESOURCE_GROUP:-}"
    local azure_cluster="${AZURE_CLUSTER_NAME:-}"

    # Detect environment with improved logic
    local environment="unknown"

    # Check for CI/CD with provided kubeconfig (highest priority)
    if [ -n "$KUBE_CONFIG_DATA" ]; then
        environment="ci-cd"
    # Check for Azure configuration with credentials
    elif [ -n "$azure_rg" ] && [ -n "$azure_cluster" ] && command -v az &> /dev/null && az account show &> /dev/null; then
        environment="azure-configured"
    # Check for Docker Desktop with multiple detection methods
    elif command -v docker &> /dev/null; then
        # Method 1: Check docker context
        if docker context ls 2>/dev/null | grep -q "docker-desktop"; then
            environment="docker-desktop"
        # Method 2: Check if we're in a container and can reach Docker Desktop API
        elif [ -f "/.dockerenv" ] && timeout 2 curl -s http://host.docker.internal:6443 &> /dev/null; then
            environment="docker-desktop"
        # Method 3: Check if we can reach Docker Desktop Kubernetes API directly
        elif timeout 2 curl -sk https://host.docker.internal:6443 &> /dev/null; then
            environment="docker-desktop"
        # Method 4: Check for common Docker Desktop indicators
        elif [ -n "$DOCKER_HOST" ] || docker info 2>/dev/null | grep -q "docker-desktop"; then
            environment="docker-desktop"
        fi
    # Check for general Azure CLI
    elif command -v az &> /dev/null && az account show &> /dev/null; then
        environment="azure"
    fi

    case $environment in
        "ci-cd")
            echo "📍 Detected: CI/CD environment with provided kubeconfig"
            echo "$KUBE_CONFIG_DATA" | base64 -d > ~/.kube/config
            echo "✅ kubectl configured from CI/CD secrets"
            ;;

        "azure-configured")
            echo "📍 Detected: Azure environment with configuration"
            echo "🔧 Configuring AKS access for: $azure_cluster in $azure_rg"
            if az aks get-credentials --resource-group "$azure_rg" --name "$azure_cluster" --overwrite-existing > /dev/null 2>&1; then
                echo "✅ kubectl configured for AKS cluster"
            else
                echo "⚠️  Failed to configure AKS - falling back to Docker Desktop"
                environment="fallback-docker-desktop"
            fi
            ;;

        "docker-desktop")
            echo "📍 Detected: Docker Desktop environment"

            # Docker Desktop configuration (development)
            kubectl config set-cluster docker-desktop \
                --server=https://host.docker.internal:6443 \
                --insecure-skip-tls-verify=true

            kubectl config set-credentials docker-desktop \
                --username=docker-desktop \
                --password=docker-desktop

            kubectl config set-context docker-desktop \
                --cluster=docker-desktop \
                --user=docker-desktop

            kubectl config use-context docker-desktop

            echo "✅ kubectl configured for Docker Desktop (development)"
            ;;

        "azure")
            echo "📍 Detected: Azure environment"
            echo "💡 Set AZURE_RESOURCE_GROUP and AZURE_CLUSTER_NAME in .env for automatic AKS configuration"
            echo "💡 Or use: az aks get-credentials --resource-group <rg> --name <cluster>"
            # Try Docker Desktop as fallback
            environment="fallback-docker-desktop"
            ;;

        "unknown"|"fallback-docker-desktop")
            echo "📍 Environment: Unknown - attempting Docker Desktop configuration"
            echo "🔧 Configuring kubectl for Docker Desktop (fallback)"

            # Try Docker Desktop configuration as fallback
            if kubectl config set-cluster docker-desktop \
                --server=https://host.docker.internal:6443 \
                --insecure-skip-tls-verify=true > /dev/null 2>&1; then

                kubectl config set-credentials docker-desktop \
                    --username=docker-desktop \
                    --password=docker-desktop

                kubectl config set-context docker-desktop \
                    --cluster=docker-desktop \
                    --user=docker-desktop

                kubectl config use-context docker-desktop

                echo "✅ kubectl configured for Docker Desktop (auto-fallback)"
            else
                echo "⚠️  Failed to configure kubectl automatically"
                echo "💡 Manual configuration may be required"
            fi
            ;;
    esac
}

# Execute kubectl configuration
configure_kubectl

# Test kubectl connection with timeout and proper error handling
test_kubectl_connection() {
    if ! command -v kubectl &> /dev/null; then
        return
    fi

    echo "🧪 Testing kubectl connection..."

    local context=$(kubectl config current-context 2>/dev/null || echo "none")
    if [ "$context" != "none" ]; then
        echo "📋 Current context: $context"

        # Test with timeout
        if timeout 5 kubectl cluster-info &> /dev/null; then
            echo "✅ Kubernetes cluster accessible"
            timeout 3 kubectl get nodes --no-headers 2>/dev/null | head -3 || echo "📊 Node details not available"
        else
            case $context in
                "docker-desktop")
                    echo "⚠️  Docker Desktop Kubernetes not accessible (normal during startup)"
                    echo "💡 Make sure Kubernetes is enabled in Docker Desktop settings"
                    ;;
                *)
                    echo "⚠️  Kubernetes cluster not accessible (normal during startup or missing credentials)"
                    ;;
            esac
        fi
    else
        echo "⚠️  No kubectl context configured"
    fi
}

# Execute connection test
test_kubectl_connection

# Install and configure pre-commit
echo "🔧 Setting up pre-commit..."
pip install pre-commit > /dev/null 2>&1
pre-commit install --hook-type pre-commit --hook-type pre-push > /dev/null 2>&1 || echo "⚠️  Pre-commit install failed - continuing anyway"

echo "🎉 DevContainer setup complete!"

# Configure enhanced bash with optional features
echo "🔧 Setting up enhanced bash..."

# Check feature flags from environment
enable_kubectl_completion="${DEV_ENABLE_KUBECTL_AUTOCOMPLETION:-true}"
enable_helm_completion="${DEV_ENABLE_HELM_AUTOCOMPLETION:-true}"
enable_k8s_prompt="${DEV_KUBERNETES_CONTEXT_IN_PROMPT:-true}"

# Create .bashrc content with conditional features
cat >> /home/appuser/.bashrc << EOF

# --- Git branch in prompt (DYNAMIC VERSION) ---
parse_git_branch() {
    git symbolic-ref --short HEAD 2>/dev/null | sed 's/\(.*\)/(\1)/'
}

# Force PS1 to be evaluated every time (CRITICAL!)
export PS1='appuser@\h:\w$(parse_git_branch)\$ '

# Also add to bashrc for persistence
echo 'export PS1="appuser@\h:\w\$(parse_git_branch)\$ "' >> /home/appuser/.bashrc

# Kubernetes context in prompt (configurable)
parse_kube_context() {
    if [ "$enable_k8s_prompt" = "true" ] && command -v kubectl &> /dev/null; then
        local context=\$(kubectl config current-context 2>/dev/null || echo "")
        if [ -n "\$context" ]; then
            echo "[\$context]"
        fi
    fi
}

# Enhanced prompt with git branch and optional k8s context
export PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[01;33m\]\$(parse_git_branch)\[\033[01;36m\]\$(parse_kube_context)\[\033[00m\]\$ "

# Standard bash completion
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi

# Git autocomplete
if [ -f /usr/share/bash-completion/completions/git ]; then
    source /usr/share/bash-completion/completions/git
fi

# Conditional kubectl autocomplete
if [ "$enable_kubectl_completion" = "true" ] && command -v kubectl &> /dev/null; then
    source <(kubectl completion bash 2>/dev/null) || true
fi

# Conditional helm autocomplete
if [ "$enable_helm_completion" = "true" ] && command -v helm &> /dev/null; then
    source <(helm completion bash 2>/dev/null) || true
fi

# History configuration
export HISTCONTROL=ignoredups:erasedups
export HISTSIZE=10000
export HISTFILESIZE=10000
shopt -s histappend

# Standard aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'

# Docker aliases
alias dps='docker ps'
alias dpa='docker ps -a'
alias di='docker images'
alias dc='docker-compose'

# Django aliases
alias pm='python manage.py'
alias pms='python manage.py shell'
alias pmr='python manage.py runserver'

# Kubernetes aliases (conditional)
if command -v kubectl &> /dev/null; then
    alias k='kubectl'
    alias kgp='kubectl get pods'
    alias kgs='kubectl get services'
    alias kgd='kubectl get deployments'
fi

# Helm aliases (conditional)
if command -v helm &> /dev/null; then
    alias h='helm'
    alias hls='helm list'
    alias hlt='helm template'
fi

EOF

echo "✅ Enhanced bash configured"
echo ""
echo "🚀 Environment ready!"
echo "🔧 Configuration loaded from:"
echo "   • Git: $git_name <$git_email>"
if [ -n "$AZURE_RESOURCE_GROUP" ]; then
    echo "   • Azure RG: $AZURE_RESOURCE_GROUP"
fi
if [ -n "$AZURE_CLUSTER_NAME" ]; then
    echo "   • Azure cluster: $AZURE_CLUSTER_NAME"
fi
echo ""
echo "💡 Customize behavior by setting variables in .env file"
