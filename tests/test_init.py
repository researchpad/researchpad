"""Test init command."""
import os
import tempfile
from pathlib import Path
from researchpad.cli.init import init_command


def test_init_creates_directories():
    original_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            init_command()
            assert Path(".researchpad").exists()
            assert Path(".researchpad/experiments/research").exists()
            assert Path(".researchpad/experiments/debug").exists()
            assert Path(".researchpad/experiments/insights.md").exists()
    finally:
        os.chdir(original_dir)


def test_init_creates_insights_file():
    original_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            init_command()
            content = Path(".researchpad/experiments/insights.md").read_text()
            assert "Experiment Insights" in content
    finally:
        os.chdir(original_dir)


def test_init_installs_both_when_no_tool_detected():
    """When no .cursor/ or .claude/ exists, install commands for both."""
    original_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            init_command()
            assert Path(".cursor/commands").exists()
            assert Path(".claude/commands").exists()
    finally:
        os.chdir(original_dir)


def test_init_detects_cursor():
    """When .cursor/ exists, only install for Cursor."""
    original_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            Path(".cursor").mkdir()
            init_command()
            assert Path(".cursor/commands").exists()
            assert not Path(".claude/commands").exists()
    finally:
        os.chdir(original_dir)


def test_init_detects_claude():
    """When .claude/ exists, only install for Claude Code."""
    original_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            Path(".claude").mkdir()
            init_command()
            assert not Path(".cursor/commands").exists()
            assert Path(".claude/commands").exists()
    finally:
        os.chdir(original_dir)


def test_init_explicit_target():
    """--target flag overrides auto-detection."""
    original_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            init_command(target="claude")
            assert not Path(".cursor/commands").exists()
            assert Path(".claude/commands").exists()
    finally:
        os.chdir(original_dir)


def test_init_target_all():
    """--target all installs for both tools."""
    original_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            Path(".cursor").mkdir()  # even with only cursor detected
            init_command(target="all")
            assert Path(".cursor/commands").exists()
            assert Path(".claude/commands").exists()
    finally:
        os.chdir(original_dir)
