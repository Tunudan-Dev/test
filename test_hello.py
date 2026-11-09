from hello import saluer


def test_saluer_nominal() -> None:
    assert saluer("Tunudan") == "Bonjour Tunudan depuis AgentForge"


def test_saluer_vide() -> None:
    assert saluer("") == "Bonjour  depuis AgentForge"
