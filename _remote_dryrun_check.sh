#!/bin/bash
set -u
DEPLOY_DIR="/root/mcp-pipedrive"
SERVICE="mcp-pipedrive"
PASS=0; FAIL=0; WARN=0
ok()   { echo "  [OK]   $1"; ((PASS++)); }
fail() { echo "  [FAIL] $1"; ((FAIL++)); }
warn() { echo "  [WARN] $1"; ((WARN++)); }

echo ""
echo "============================================================"
echo "  VPS Remote Validation â€” mcp-pipedrive"
echo "============================================================"
echo ""

echo ">>> Docker"
if docker info > /dev/null 2>&1; then
    ok "Docker daemon running ($(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "unknown"))"
else
    fail "Docker daemon not responding"
fi

echo ""
echo ">>> Disk Space"
DISK_AVAIL=$(df -BG --output=avail /root 2>/dev/null | tail -1 | tr -d ' G')
[ -n "$DISK_AVAIL" ] && [ "$DISK_AVAIL" -ge 2 ] && ok "Disk: ${DISK_AVAIL}G on /root" || warn "Low disk: ${DISK_AVAIL}G on /root"

echo ""
echo ">>> Deploy Directory ($DEPLOY_DIR)"
[ -d "$DEPLOY_DIR" ] && ok "Deploy directory exists" || warn "Deploy directory missing (will be created)"
[ -f "$DEPLOY_DIR/.env" ] && ok ".env present" || warn ".env missing in $DEPLOY_DIR (add PIPEDRIVE_API_TOKEN if using fallback)"

echo ""
echo ">>> Network"
if docker network ls --format '{{.Name}}' | grep -q "librechat_librechat-net"; then
    ok "librechat_librechat-net network found"
else
    fail "librechat_librechat-net network not found â€” LibreChat must be running first"
fi

echo ""
echo ">>> Current Container State"
STATE=$(docker inspect --format '{{.State.Status}}' "$SERVICE" 2>/dev/null || echo "not found")
if [ "$STATE" = "running" ]; then
    HEALTH=$(curl -sf http://localhost:8020/health 2>/dev/null && echo "healthy" || echo "unreachable")
    ok "Container running, health: $HEALTH"
else
    warn "Container state: $STATE"
fi

echo ""
echo "============================================================"
echo "  Summary: Passed=$PASS  Warnings=$WARN  Failed=$FAIL"
echo "============================================================"
echo ""
[ "$FAIL" -gt 0 ] && echo "  RESULT: ISSUES FOUND" && exit 1 || echo "  RESULT: READY FOR DEPLOYMENT" && exit 0