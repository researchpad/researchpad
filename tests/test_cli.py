"""Test CLI functionality."""
import subprocess
import sys


def test_main_help():
    result = subprocess.run(
        [sys.executable, "-m", "researchpad.cli.main", "--help"],
        capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert "researchpad" in result.stdout


def test_version():
    result = subprocess.run(
        [sys.executable, "-m", "researchpad.cli.main", "version"],
        capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert "0.1.0" in result.stdout
