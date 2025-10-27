#!/bin/bash
set -e

echo "🔧 Configuring DevContainer..."

# Configure Git globally with defaults from cookiecutter
# Note: These are fallbacks. VS Code may sync your local git config.
git config --global user.name "Daniel de Queiroz Reis"
git config --global user.email "danielqreis@gmail.com"
git config --global init.defaultBranch main
git config --global --add safe.directory '/workspaces/*'

echo "✅ Git configured"

# Fix .git permissions for non-root user
if [ -d ".git" ]; then
    sudo chown -R $(whoami) .git/
    chmod -R u+w .git/
    echo "✅ Git permissions fixed"
fi

# Install and configure pre-commit
echo "🔧 Setting up pre-commit..."
pip install pre-commit
pre-commit install --hook-type pre-commit --hook-type pre-push || echo "⚠️  Pre-commit install failed - continuing anyway"

echo "🎉 DevContainer setup complete!"

# Configure bash with git branch and autocomplete
echo "🔧 Setting up enhanced bash..."

# Create/update .bashrc with git branch display and autocomplete
cat >> /home/appuser/.bashrc << 'EOF'

# Git branch in prompt
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}

# Enhanced prompt with git branch
export PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[01;33m\]\$(parse_git_branch)\[\033[00m\]\$ "

# Enable bash completion
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

# Better history
export HISTCONTROL=ignoredups:erasedups
export HISTSIZE=10000
export HISTFILESIZE=10000
shopt -s histappend

# Useful aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Docker aliases
alias dps='docker ps'
alias dpa='docker ps -a'
alias di='docker images'
alias dc='docker-compose'
alias dcu='docker-compose up'
alias dcd='docker-compose down'
alias dcl='docker-compose logs'

# Django aliases
alias pm='python manage.py'
alias pms='python manage.py shell'
alias pmr='python manage.py runserver'
alias pmt='python manage.py test'
alias pmm='python manage.py migrate'
alias pmmm='python manage.py makemigrations'

EOF

echo "✅ Enhanced bash configured"
