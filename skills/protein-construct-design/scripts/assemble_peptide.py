#!/usr/bin/env python3
"""Welds monomer fragments into one molecule, as a GRAPH.

Reads a payload on stdin and writes `{"smiles": ...}` or `{"error": ...}`:

    {"units": [{"name": "A", "fragment": "[1*]N[C@@H](C)C([2*])=O",
                "free": {"1": "H", "2": "OH"}}, ...],
     "joins": [[[0, 2], [1, 1]], ...]}

The caller decides WHAT to build -- which monomer sits where, which attachment
joins which -- because that is reading a design record, and it stays in one
place. This decides nothing; it only joins what it is told to join.

Why it exists: the TypeScript assembler edits SMILES as text, which is exposed
to tokenisation mistakes such as reading an element as two letters or taking a
ring digit for a bond. Here each monomer becomes a molecule, the dummies a join
connects are given matching atom map numbers, and RDKit's own `molzip` welds
them. No string is edited, so that class of error cannot occur, and the output
is ordinary canonical SMILES rather than fragments tied by ring closures across
dots, which is what a drawing tool accepts.

Needs RDKit (`pip install rdkit`: a wheel, no compiler, no root). A missing
RDKit is reported as an `error` like any other failure. The caller falls back to
its own assembler when no SMILES comes back, and says which built the structure.
"""
from __future__ import annotations

import json
import sys


def weld(payload: dict) -> str:
    from rdkit import Chem, RDLogger

    RDLogger.DisableLog("rdApp.*")

    units = payload["units"]
    joins = payload["joins"]

    # Each join gets an id; the two dummies it connects carry it as an atom map
    # number, which is what molzip pairs on.
    paired: dict[tuple[int, int], int] = {}
    for index, (a, b) in enumerate(joins, start=1):
        paired[(a[0], a[1])] = index
        paired[(b[0], b[1])] = index

    mols = []
    for unit, spec in enumerate(units):
        mol = Chem.MolFromSmiles(spec["fragment"])
        if mol is None:
            raise ValueError(f"{spec['name']}: its fragment does not parse")
        edit = Chem.RWMol(mol)
        drop: list[int] = []
        for atom in edit.GetAtoms():
            if atom.GetAtomicNum() != 0:
                continue
            socket = atom.GetIsotope()
            if socket == 0:
                raise ValueError(f"{spec['name']}: an attachment carries no number")
            key = (unit, socket)
            if key in paired:
                atom.SetIsotope(0)
                atom.SetAtomMapNum(paired[key])
                continue
            group = spec["free"].get(str(socket))
            if group is None:
                raise ValueError(f"{spec['name']}: attachment {socket} has no free group")
            if group == "H":
                # An implicit hydrogen: the dummy simply goes.
                drop.append(atom.GetIdx())
            elif group == "OH":
                atom.SetAtomicNum(8)
                atom.SetIsotope(0)
                atom.SetNoImplicit(False)
            else:
                raise ValueError(f"{spec['name']}: unknown free group {group!r}")
        for index in sorted(drop, reverse=True):
            edit.RemoveAtom(index)
        mols.append(edit.GetMol())

    if not mols:
        raise ValueError("nothing to assemble")
    combined = mols[0]
    for mol in mols[1:]:
        combined = Chem.CombineMols(combined, mol)
    welded = Chem.molzip(combined)
    # An unpaired map number means a join named an attachment that was not
    # there, and would leave a dummy in the product rather than a bond.
    for atom in welded.GetAtoms():
        if atom.GetAtomicNum() == 0:
            raise ValueError("a join did not close: an attachment it named was not present")
    Chem.SanitizeMol(welded)
    return Chem.MolToSmiles(welded, canonical=True, isomericSmiles=True)


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception as error:  # noqa: BLE001 - the caller gets the text
        print(json.dumps({"error": f"could not read the payload: {error}"}))
        return
    try:
        print(json.dumps({"smiles": weld(payload)}))
    except Exception as error:  # noqa: BLE001
        print(json.dumps({"error": str(error)}))


if __name__ == "__main__":
    main()
