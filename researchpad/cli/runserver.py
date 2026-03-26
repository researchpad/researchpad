"""Start the ResearchPad UI server."""
import os
import sys
import signal
import shutil
import subprocess
from pathlib import Path


def _find_project_root():
    """Walk up from cwd to find the git repository root."""
    current = Path.cwd()
    while True:
        if (current / ".git").is_dir():
            return str(current)
        parent = current.parent
        if parent == current:
            return str(Path.cwd())
        current = parent


def runserver_command(bind):
    """Start the ResearchPad UI server."""
    node_bin = shutil.which("node")
    if node_bin is None:
        print("Error: Node.js is required but not found.", file=sys.stderr)
        print("  Install Node.js >= 18 from https://nodejs.org", file=sys.stderr)
        sys.exit(1)

    parts = bind.split(":")
    if len(parts) == 2:
        host, port = parts[0], parts[1]
    else:
        host, port = "localhost", parts[0]

    package_dir = Path(__file__).parent.parent
    server_js = package_dir / "server" / "index.js"

    if not server_js.exists():
        print(f"Error: Server bundle not found at {server_js}", file=sys.stderr)
        print("  This is a packaging issue. Please reinstall researchpad.", file=sys.stderr)
        sys.exit(1)

    project_root = _find_project_root()
    env = {**os.environ, "PROJECT_ROOT": project_root}

    # Pass through storage root if set
    storage_root = os.environ.get("RESEARCHPAD_STORAGE_ROOT")
    if storage_root:
        env["RESEARCHPAD_STORAGE_ROOT"] = storage_root

    print(f"ResearchPad starting at http://{host}:{port}")
    print(f"Project root: {project_root}")
    print("Press Ctrl+C to stop\n")

    proc = subprocess.Popen(
        [node_bin, str(server_js), "--host", host, "--port", port],
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    def _shutdown(signum, frame):
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
        sys.exit(0)

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    proc.wait()
    sys.exit(proc.returncode)
