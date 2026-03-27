"""Initialize ResearchPad in current project."""
import shutil
from pathlib import Path

# Supported tools and their command directories
TOOLS = {
    "cursor": ".cursor/commands",
    "claude": ".claude/commands",
}


def _detect_targets(project_root):
    """Auto-detect which AI coding tools are in use by checking for their config dirs."""
    detected = []
    for tool, cmd_path in TOOLS.items():
        tool_dir = project_root / cmd_path.split("/")[0]
        if tool_dir.exists():
            detected.append(tool)
    return detected


def _install_commands(project_root, templates_dir, tool, force):
    """Install command templates for a specific tool."""
    src_commands = templates_dir / "commands"
    dst_path = TOOLS[tool]
    dst_commands = project_root / dst_path

    if not src_commands.exists():
        return

    if dst_commands.exists() and not force:
        print(f"  {dst_path}/ already exists. Use --force to overwrite.")
        return

    dst_commands.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src_commands, dst_commands, dirs_exist_ok=True)

    # Remove .gitkeep files from installed commands
    for gitkeep in dst_commands.glob(".gitkeep"):
        gitkeep.unlink()

    print(f"  Installed commands to {dst_path}/")


def init_command(force=False, target=None):
    """Install commands and create .researchpad/ directory structure."""
    project_root = Path.cwd()
    package_dir = Path(__file__).parent.parent
    templates_dir = package_dir / "templates"

    # Determine which tools to install for
    if target == "all":
        targets = list(TOOLS.keys())
    elif target is not None:
        targets = [target]
    else:
        # Auto-detect
        targets = _detect_targets(project_root)
        if not targets:
            # Nothing detected -- install for both
            targets = list(TOOLS.keys())
            print("  No existing .cursor/ or .claude/ directory detected, installing for both.")
        else:
            detected_names = ", ".join(t.capitalize() for t in targets)
            print(f"  Detected: {detected_names}")

    # Install commands for each target
    for tool in targets:
        _install_commands(project_root, templates_dir, tool, force)

    # Copy RESEARCHPAD.md to project root
    researchpad_md_src = templates_dir / "RESEARCHPAD.md"
    researchpad_md_dst = project_root / "RESEARCHPAD.md"
    if researchpad_md_src.exists():
        if researchpad_md_dst.exists() and not force:
            print("  RESEARCHPAD.md already exists. Use --force to overwrite.")
        else:
            shutil.copy2(researchpad_md_src, researchpad_md_dst)
            print("  Created RESEARCHPAD.md -- edit this to configure your project")

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
    print("  1. Edit RESEARCHPAD.md to configure your project")
    print("  2. Run: researchpad runserver")
    print("  3. Open: http://localhost:8888")
    print("  4. Use commands: /research, /experiment, /debug")
