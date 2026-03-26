"""Initialize ResearchPad in current project."""
import shutil
from pathlib import Path


def init_command(force=False):
    """Install cursor commands and create .researchpad/ directory structure."""
    project_root = Path.cwd()
    package_dir = Path(__file__).parent.parent
    templates_dir = package_dir / "templates"

    # Install cursor commands
    cursor_dir = project_root / ".cursor"
    cursor_dir.mkdir(exist_ok=True)

    src_commands = templates_dir / "cursor" / "commands"
    dst_commands = cursor_dir / "commands"

    if src_commands.exists():
        if dst_commands.exists() and not force:
            print(f"  .cursor/commands/ already exists. Use --force to overwrite.")
        else:
            shutil.copytree(src_commands, dst_commands, dirs_exist_ok=True)
            print(f"  Installed cursor commands to .cursor/commands/")

    # Create .researchpad directory structure
    researchpad_dir = project_root / ".researchpad"
    researchpad_dir.mkdir(exist_ok=True)
    (researchpad_dir / "experiments" / "research").mkdir(parents=True, exist_ok=True)
    (researchpad_dir / "experiments" / "debug").mkdir(parents=True, exist_ok=True)
    print("  Created .researchpad/experiments/ directory structure")

    # Create insights.md if it doesn't exist
    insights_file = researchpad_dir / "experiments" / "insights.md"
    if not insights_file.exists():
        insights_file.write_text("# Experiment Insights\n\n")

    print("\nResearchPad initialized successfully!")
    print("\nNext steps:")
    print("  1. Run: researchpad runserver")
    print("  2. Open: http://localhost:8888")
    print("  3. Use cursor commands: /research, /experiment, /debug")
