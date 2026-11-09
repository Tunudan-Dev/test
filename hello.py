"""Script de démonstration AgentForge."""
import sys


def saluer(nom: str) -> str:
    """Renvoie une salutation pour `nom`."""
    return f"Bonjour {nom} depuis AgentForge"


if __name__ == "__main__":
    print(saluer("Tunudan"))
    print(f"Python {sys.version}")
