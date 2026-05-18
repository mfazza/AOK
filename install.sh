#!/bin/bash
# AOK (Agent Operator Kit) Installer
# Installs AOK commands, agents, skills, and references into your opencode setup.
#
# Usage:
#   ./install.sh              # Interactive — asks local vs global
#   ./install.sh --local      # Install to current project (.opencode/)
#   ./install.sh --global     # Install globally (~/.config/opencode/)
#   ./install.sh --both       # Install to both locations

set -euo pipefail

AOK_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET=""
MODE=""

# Parse arguments
if [[ "${1:-}" == "--global" ]]; then
  MODE="global"
elif [[ "${1:-}" == "--local" ]]; then
  MODE="local"
elif [[ "${1:-}" == "--both" ]]; then
  MODE="both"
else
  # Interactive mode — ask the user
  echo ""
  echo "📦 AOK (Agent Operator Kit) Installer"
  echo ""
  echo "Where should AOK be installed?"
  echo ""
  echo "  1) Project-local (.opencode/ in this repo) — recommended"
  echo "  2) Global (~/.config/opencode/ — available everywhere)"
  echo "  3) Both (global + project-local, project takes precedence)"
  echo "  4) Restore defaults (Local)"
  echo "  5) Restore defaults (Global)"
  echo ""
  read -p "Select [1/2/3/4/5]: " choice
  case "$choice" in
    1) MODE="local" ;;
    2) MODE="global" ;;
    3) MODE="both" ;;
    4) MODE="local" ;;
    5) MODE="global" ;;
    *) echo "Invalid choice. Exiting."; exit 1 ;;
  esac
fi

install_to() {
  local TARGET="$1"
  local LABEL="$2"

  echo ""
  echo "📦 Installing AOK ($LABEL) to $TARGET"

  # Create directories
  mkdir -p "$TARGET/commands"
  mkdir -p "$TARGET/agents"
  mkdir -p "$TARGET/skills/aok"

  # Install commands (workflows become slash commands)
  echo "  → Installing commands..."
  for f in "$AOK_DIR/workflows/"*.md; do
    cp "$f" "$TARGET/commands/$(basename "$f")"
  done

  # Install agents
  echo "  → Installing agents..."
  for f in "$AOK_DIR/agents/"*.md; do
    cp "$f" "$TARGET/agents/$(basename "$f")"
  done

  # Install skill
  echo "  → Installing AOK skill..."
  cp "$AOK_DIR/skills/aok/SKILL.md" "$TARGET/skills/aok/SKILL.md"

  # Install references (into the skill's references dir)
  echo "  → Installing references..."
  mkdir -p "$TARGET/skills/aok/references"
  for f in "$AOK_DIR/references/"*; do
    cp "$f" "$TARGET/skills/aok/references/$(basename "$f")"
  done

  # Install templates (for agent generation)
  echo "  → Installing templates..."
  mkdir -p "$TARGET/skills/aok/templates"
  for f in "$AOK_DIR/templates/"*; do
    cp "$f" "$TARGET/skills/aok/templates/$(basename "$f")"
  done

  # Ensure package.json exists with opencode plugin
  if [[ ! -f "$TARGET/package.json" ]]; then
    echo "  → Creating package.json with @opencode-ai/plugin..."
    cat > "$TARGET/package.json" << 'PKGJSON'
{
  "dependencies": {
    "@opencode-ai/plugin": "latest"
  }
}
PKGJSON
  fi

  # Install npm deps if needed
  if [[ -f "$TARGET/package.json" ]] && [[ ! -d "$TARGET/node_modules/@opencode-ai" ]]; then
    echo "  → Installing npm dependencies..."
    (cd "$TARGET" && bun install --silent 2>/dev/null || npm install --quiet 2>/dev/null || true)
  fi
}

# Determine target paths and install
get_local_target() {
  if git rev-parse --show-toplevel &>/dev/null; then
    echo "$(git rev-parse --show-toplevel)/.opencode"
  else
    echo "$(pwd)/.opencode"
  fi
}

case "$MODE" in
  local)
    install_to "$(get_local_target)" "project-local"
    ;;
  global)
    install_to "$HOME/.config/opencode" "global"
    ;;
  both)
    install_to "$HOME/.config/opencode" "global"
    install_to "$(get_local_target)" "project-local"
    ;;
esac

echo ""
echo "✅ AOK installed successfully!"
echo ""
echo "Available commands:"
echo "  /aok-new           — Create a new agent (routes to tool/skill if appropriate)"
echo "  /aok-eval          — Run eval suite (works on any agent)"
echo "  /aok-eval-compare  — Compare agent across models"
echo "  /aok-audit         — Audit for waste, injection, determinism gaps"
echo "  /aok-iterate       — Improve from eval failures"
echo "  /aok-tools         — Add deterministic tools"
echo "  /aok-skill         — Create procedural knowledge"
echo "  /aok-help          — Show command reference"
echo ""
echo "Get started: /aok-new"
