#!/usr/bin/env sh

VERDACCIO_PID=0

BASE_DIR=${BASE_DIR:-$(dirname "$(dirname "$(readlink -f "$0")")")}

# Check if NPM_PUBLISH_REGISTRY is accessible
_check_registry_accessible() {
  if curl --output /dev/null --silent --head --fail "${NPM_PUBLISH_REGISTRY:-http://localhost:4873/}"; then
    return 0
  else
    return 1
  fi
}

_get_child_pids() {
    parent_pid=$1
    child_pids=$(pgrep -P $parent_pid)

    for pid in $child_pids
    do
        echo $pid
        _get_child_pids $pid
    done
}

# Stop Verdaccio daemon
stop_private_registry() {
  if [ $VERDACCIO_PID -ne 0 ]; then
    echo "Stopping Verdaccio... (PID: $VERDACCIO_PID)"

    _get_child_pids $VERDACCIO_PID | xargs kill >> /dev/null 2>&1
    kill "$VERDACCIO_PID" >> /dev/null 2>&1
    echo "Verdaccio stopped successfully. (PID: $VERDACCIO_PID)"
    VERDACCIO_PID=0
  fi
}

# Start Verdaccio daemon
start_private_registry() {
  if _check_registry_accessible; then
    echo "Registry is accessible, no need to start Verdaccio."
  else
    echo "Registry is not accessible, starting Verdaccio..."

    VERDACCIO_LOG_TEMP_FILE=$(mktemp)
    yarn verdaccio >> "$VERDACCIO_LOG_TEMP_FILE" &
    VERDACCIO_PID=$!

    for i in $(seq 1 10); do
      printf "Waiting for Verdaccio to start... (%02d/10) (PID: $VERDACCIO_PID)\n" $i

      if grep -q "verdaccio/5" "$VERDACCIO_LOG_TEMP_FILE"; then
        rm -f "$VERDACCIO_LOG_TEMP_FILE" >> /dev/null 2>&1
        echo "Verdaccio started successfully. (PID: $VERDACCIO_PID)"
        return
      fi

      if [ $i -lt 10 ]; then
        sleep 1
      fi
    done

    echo "Error: The server did not start within 10 seconds."
    stop_private_registry
    rm -f "$VERDACCIO_LOG_TEMP_FILE" >> /dev/null 2>&1
    exit 1
  fi
}

# Find monorepo root
monorepo_root() {
  node -e "import('$BASE_DIR/lib/find-monorepo-root.mjs').then(({findMonorepoRoot}) => process.stdout.write(findMonorepoRoot() + '\\n'))"
}
