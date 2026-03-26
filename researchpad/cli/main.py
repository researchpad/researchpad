#!/usr/bin/env python3
"""ResearchPad CLI entry point."""
import sys


def main():
    import argparse
    parser = argparse.ArgumentParser(
        prog="researchpad",
        description="AI-powered autonomous ML experimentation companion",
    )
    subparsers = parser.add_subparsers(dest="command")

    # researchpad init
    init_parser = subparsers.add_parser("init", help="Initialize ResearchPad in current project")
    init_parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    init_parser.add_argument(
        "--target", choices=["cursor", "claude", "all"],
        default=None,
        help="Which tool to install commands for (default: auto-detect)",
    )

    # researchpad runserver
    server_parser = subparsers.add_parser("runserver", help="Start the ResearchPad UI server")
    server_parser.add_argument("bind", nargs="?", default="localhost:8888",
                               help="Host:port to bind (default: localhost:8888)")

    # researchpad version
    subparsers.add_parser("version", help="Show version")

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(1)
    elif args.command == "init":
        from researchpad.cli.init import init_command
        init_command(force=args.force, target=args.target)
    elif args.command == "runserver":
        from researchpad.cli.runserver import runserver_command
        runserver_command(args.bind)
    elif args.command == "version":
        from researchpad.__version__ import __version__
        print(f"researchpad {__version__}")
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
