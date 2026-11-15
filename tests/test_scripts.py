"""Regresiones de scripts sin descargar datos ni modificar ramas reales."""

import ast
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_simplify_conserva_orden_y_cierre():
    source = ast.parse((ROOT / "web/scripts/build-osm-cr.py").read_text())
    function = next(
        node for node in source.body if isinstance(node, ast.FunctionDef) and node.name == "simplify"
    )
    namespace = {}
    exec(compile(ast.Module(body=[function], type_ignores=[]), "<simplify>", "exec"), namespace)
    simplify = namespace["simplify"]
    points = [(0, 0), (1, 1), (2, 0), (3, 2), (4, 0)]
    result = simplify(points, 0.1)
    assert result == points
    ring = [*points, points[0]]
    assert simplify(ring, 0.1) == ring
    assert simplify([(0, 0), (1, 0), (2, 0)], 0.1) == [(0, 0), (2, 0)]


def test_sync_rechaza_divergencia_sin_forzar_ramas(tmp_path):
    git = tmp_path / "git"
    log = tmp_path / "git.log"
    git.write_text(
        '#!/usr/bin/env python3\n'
        'import os, sys\n'
        'from pathlib import Path\n'
        'args = sys.argv[1:]\n'
        'with open(os.environ["GIT_TEST_LOG"], "a") as out:\n'
        '    out.write(" ".join(args) + "\\n")\n'
        'if args[:2] == ["rev-parse", "--abbrev-ref"]:\n'
        '    print("fix/cierre-qa-entrega")\n'
        'elif args[:2] == ["merge-base", "--is-ancestor"]:\n'
        '    sys.exit(int(os.environ["GIT_TEST_DIVERGED"]))\n'
        'elif args[:1] == ["rev-parse"]:\n'
        '    print("old-sha")\n'
    )
    git.chmod(0o755)
    env = {
        **os.environ,
        "PATH": f"{tmp_path}:{os.environ['PATH']}",
        "GIT_TEST_LOG": str(log),
        "GIT_TEST_DIVERGED": "1",
    }
    failed = subprocess.run(["make", "sync"], cwd=ROOT, env=env, capture_output=True, text=True)
    assert failed.returncode != 0
    assert "commits locales" in failed.stdout
    assert "update-ref" not in log.read_text()
    assert "branch -f" not in log.read_text()

    log.write_text("")
    env["GIT_TEST_DIVERGED"] = "0"
    success = subprocess.run(["make", "sync"], cwd=ROOT, env=env, capture_output=True, text=True)
    assert success.returncode == 0, success.stderr
    assert "update-ref refs/heads/main refs/remotes/origin/main old-sha" in log.read_text()
    assert "update-ref refs/heads/develop refs/remotes/origin/develop old-sha" in log.read_text()
