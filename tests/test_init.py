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
