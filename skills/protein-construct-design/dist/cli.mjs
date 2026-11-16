// src/cli.ts
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync as existsSync2 } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath as fileURLToPath3 } from "node:url";

// src/schema.ts
var EVIDENCE_VALUES = [
  "measured",
  "established_elsewhere",
  "predicted",
  "unknown"
];
var REGION_KINDS = [
  "binding",
  "linker",
  "assembly",
  "regulatory",
  "catalytic",
  "composition",
  "module",
  "membrane",
  "edit",
  "other"
];
var SINGLE_CHAIN_ID = "_single";
function trackSlotId(variantId, chainId) {
  return chainId === SINGLE_CHAIN_ID ? variantId : `${variantId}:${chainId}`;
}
function chainLengthLabel(length, copies) {
  const instances = copies ?? 1;
  return instances > 1 ? `${length} aa \xD7 ${instances}` : `${length} aa`;
}

// src/monomers.ts
var TABLE = `
A:a:A:1Nh2Co
C:a:C:1Nh2Co3Sh
D:a:D:1Nh2Co3Co
E:a:E:1Nh2Co3Co
F:a:F:1Nh2Co
G:a:G:1Nh2Co
H:a:H:1Nh2Co
I:a:I:1Nh2Co
K:a:K:1Nh2Co3Nh
L:a:L:1Nh2Co
M:a:M:1Nh2Co
N:a:N:1Nh2Co
P:a:P:1Nh2Co
Q:a:Q:1Nh2Co
R:a:R:1Nh2Co
S:a:S:1Nh2Co
T:a:T:1Nh2Co
V:a:V:1Nh2Co
W:a:W:1Nh2Co
Y:a:Y:1Nh2Co
dA:a:A:1Nh2Co
dC:a:C:1Nh2Co3Sh
dD:a:D:1Nh2Co3Co
dE:a:E:1Nh2Co3Co
dF:a:F:1Nh2Co
dH:a:H:1Nh2Co
dI:a:I:1Nh2Co
dK:a:K:1Nh2Co3Nh
dL:a:L:1Nh2Co
dM:a:M:1Nh2Co
dN:a:N:1Nh2Co
dP:a:P:1Nh2Co
dQ:a:Q:1Nh2Co
dR:a:R:1Nh2Co
dS:a:S:1Nh2Co
dT:a:T:1Nh2Co
dV:a:V:1Nh2Co
dW:a:W:1Nh2Co
dY:a:Y:1Nh2Co
ac:c:X:2Co
am:c:X:1Nh
_Me:c:X:1Ch
meA:a:A:1Nh2Co
meD:a:D:1Nh2Co3Co
meS:a:S:1Nh2Co
meT:a:T:1Nh2Co
meV:a:V:1Nh2Co
meY:a:Y:1Nh2Co
meE:a:E:1Nh2Co3Co
meG:a:G:1Nh2Co
meI:a:I:1Nh2Co
meK:a:K:1Nh2Co3Nh
meM:a:M:1Nh2Co
meN:a:N:1Nh2Co
meQ:a:Q:1Nh2Co
meC:a:C:1Nh2Co3Sh
meR:a:R:1Nh2Co
meW:a:W:1Nh2Co
meF:a:F:1Nh2Co
meH:a:H:1Nh2Co
meL:a:L:1Nh2Co
Nle:a:L:1Nh2Co
Nva:a:V:1Nh2Co
Orn:a:K:1Nh2Co3Nh
Iva:a:V:1Nh2Co
aIle:a:I:1Nh2Co
gGlu:a:E:1Nh2Co3Co
Hcy:a:C:1Nh2Co3Sh
Hse:a:S:1Nh2Co
Hyp:a:P:1Nh2Co
D_gGlu:a:E:1Nh2Co3Co
D_Nle:a:L:1Nh2Co
D_hPhe:a:F:1Nh2Co
D_Hyp:a:P:1Nh2Co
D_Nva:a:V:1Nh2Co
D_Orn:a:K:1Nh2Co3Nh
Pyr:a:E:1Nh2Co
D_Pyr:a:E:2Co
Phe_3Cl:a:F:1Nh2Co
Phe_4Cl:a:F:1Nh2Co
Phe_4NH2:a:F:1Nh2Co
Phg:a:G:1Nh2Co
Ser_tBu:a:S:1Nh2Co
Tyr_Bn:a:Y:1Nh2Co
Tza:a:A:1Nh2Co
1Nal:a:A:1Nh2Co
Cha:a:A:1Nh2Co
Lys_Boc:a:K:1Nh2Co
aThr:a:T:1Nh2Co
D_2Nal:a:A:1Nh2Co
D_2Thi:a:A:1Nh2Co
D_aHyp:a:P:1Nh2Co
D_aIle:a:I:1Nh2Co
D_Phg:a:G:1Nh2Co
D_Ser_tBu:a:S:1Nh2Co
Cya:a:A:1Nh2Co
Lys_Me3:a:K:1Nh2Co
Pen:a:V:1Nh2Co3Sh
Phe_4Me:a:F:1Nh2Co
Ser_Bn:a:S:1Nh2Co
Tyr_tBu:a:Y:1Nh2Co
2Nal:a:A:1Nh2Co
Thi:a:A:1Nh2Co
aHyp:a:P:1Nh2Co
Ala_tBu:a:A:1Nh2Co
hPhe:a:F:1Nh2Co
D_1Nal:a:A:1Nh2Co
D_aThr:a:T:1Nh2Co
D_Cha:a:A:1Nh2Co
D_Pen:a:V:1Nh2Co3Sh
D_Phe_4Cl:a:F:1Nh2Co
D_Ser_Bn:a:S:1Nh2Co
Wil:a:X:1Nh2Co
MsO:c:X:2So
Oic_3aS_7aS:a:X:1Nh2Co
Pip:a:X:1Nh2Co
3Pal:a:X:1Nh2Co
4Pal:a:X:1Nh2Co
Abu:a:X:1Nh2Co
Apm:a:X:1Nh2Co3Co
Chg:a:X:1Nh2Co
Dab:a:X:1Nh2Co3Nh
Dap:a:X:1Nh2Co3Nh
D_3Pal:a:X:1Nh2Co
D_aMeAbu:a:X:1Nh2Co
D_Chg:a:X:1Nh2Co
D_Cit:a:X:1Nh2Co
D_Dab:a:X:1Nh2Co3Nh
D_Pip:a:X:1Nh2Co
D_Tic:a:X:1Nh2Co
Aca:a:X:1Nh2Co
Tic:a:X:1Nh2Co
Aad:a:X:1Nh2Co3Co
Cit:a:X:1Nh2Co
Aze:a:X:1Nh2Co
Ac5c:a:X:1Nh2Co
Aib:a:X:1Nh2Co
D_2Pal:a:X:1Nh2Co
D_Abu:a:X:1Nh2Co
D_Dap:a:X:1Nh2Co3Nh
Asu:a:X:1Nh2Co3Co
Cbz:c:X:2Co
_Et:c:X:1Ch
NHEt:c:X:1Nh
OEt:c:X:1Oh
_OMe:c:X:1Oh
OtBu:c:X:1Oh
Tos:c:X:2So
D_Thz:a:X:1Nh2Co
fmoc:c:X:2Co
Mpa:c:X:2Co3Sh
Bua:c:X:2Co
Glc:c:X:2Co
deamino_Cys:c:C:2Co
deamino_Dab:c:X:1Nh
deamino_Gly_CN:c:G:2Co
deamino_Gly_cPent:c:G:2Co
deamino_Gly_OH:c:G:1Oh
deamino_Gly_thien2yl:c:G:2Co
D_Trp_For:a:W:1Nh2Co
deamino_Ncy:c:X:2Co
deamino_Phe:c:F:2Co
deamino_Phg_35diMe:c:F:2Co
deamino_Leu:c:L:2Co
D_OAla:c:A:2Co
L_OAla:c:A:2Co
L_OVal:c:V:2Co
NHBn_:c:X:2No
Bz:c:X:2Co
Et_:c:X:2Co
Me_:c:X:2Co
D_Tyr_Et:a:Y:1Nh2Co
Lys_Ac:a:K:1Nh2Co
OMe_:c:X:2Oo
Asp_OMe:a:D:1Nh2Co
NMe23Abz:a:X:2Co
Phe_ab_dehydro:a:F:1Nh2Co
Sta_3xi4xi:a:X:1Nh2Co
Tyr_ab_dehydroMe:a:Y:1Nh2Co
App:a:X:1Nh2Co
Cap:a:X:1Nh2Co
Cys_SEt:a:C:1Nh2Co
Dsu:a:X:1Nh2Co
pnC:a:X:1Nh2Co
pnG:a:X:1Nh2Co
Pqa:a:X:1Nh2Co
Pro_4Me3OH:a:P:1Nh2Co
D_Ala_ol:a:A:2Co
D_Phg_ol:a:G:1Nh
D_Thr_ol:a:T:1Nh
Gly_ol:a:G:1Nh
Ala_ol:a:A:1Nh
Lys_ol:a:K:1Nh
Phg_ol:a:G:1Nh
Pro_ol:a:P:1Nh
Val_ol:a:V:1Nh
Ala_al:a:A:1Nh
Arg_al:a:R:1Nh
Asp_al:a:N:1Nh
Lys_al:a:K:1Nh
Pro_al:a:P:1Nh
_NHBn:c:X:1Nh
NHMe:c:X:1Nh
Met_O2:a:M:1Nh2Co
Phe_2Me:a:F:1Nh2Co
Phe_34diCl:a:F:1Nh2Co
Phe_4Br:a:F:1Nh2Co
Phe_4I:a:F:1Nh2Co
Phe_4Sdihydroorotamido:a:F:1Nh2Co
Pyl:a:X:1Nh2Co
Ser_PO3H2:a:S:1Nh2Co
Thr_PO3H2:a:T:1Nh2Co
Thz:a:X:1Nh2Co
Trp_Me:a:W:1Nh2Co
Tyr_26diMe:a:Y:1Nh2Co
Tyr_3I:a:Y:1Nh2Co
Tyr_3NO2:a:Y:1Nh2Co
Tyr_Ph4OH:a:Y:1Nh2Co
Tyr_SO3H:a:Y:1Nh2Co
Val_3OH:a:V:1Nh2Co
xiIle:a:I:1Nh2Co
NMe2Abz:a:X:1Nh2Co
NMebAla:a:X:1Nh2Co
aMePhe:a:F:1Nh2Co
aMePro:a:P:1Nh2Co
aMeTyr_3OH:a:Y:1Nh2Co
Bmt:a:X:1Nh2Co
Bmt_E:a:X:1Nh2Co
Cys_Bn:a:C:1Nh2Co
Gla:a:E:1Nh2Co3Co
hHis:a:H:1Nh2Co
His_1Me:a:H:1Nh2Co
Gly_allyl:a:G:1Nh2Co
Gly_cPr:a:G:1Nh2Co
Hsl:a:X:1Nh
Asp_Ph2NH2:a:D:1Nh2Co
Azi:a:X:1Nh2Co
2Abz:a:X:1Nh2Co
3Abz:a:X:1Nh2Co
4Abz:a:X:1Nh2Co
Ac3c:a:X:1Nh2Co
Ac6c:a:X:1Nh2Co
bAla:a:A:1Nh2Co
D_Bmt:a:X:1Nh2Co
D_Bmt_E:a:X:1Nh2Co
D_hArg:a:R:1Nh2Co
D_Phe_4F:a:F:1Nh2Co
D_Trp_2Me:a:W:1Nh2Co
D_Tyr_3OH:a:Y:1Nh
D_Tyr_Me:a:Y:1Nh2Co
D_xiIle:a:I:1Nh2Co
Lys_iPr:a:K:1Nh2Co
_Bn:c:X:1Ch
_OBn:c:X:1Oh
Ph:c:X:1Ch
Boc:c:X:2Co
Mba:c:X:2Co3Sh
Hva:c:X:2Co
deamino_Chg:c:X:2Co
deamino_Dip:c:X:2Co
deamino_Gly_tBu:c:G:2Co
deamino_hPhe:c:F:2Co
deamino_nTyr_Me:c:Y:2Co
deamino_Phg_4Cl:c:G:2Co
D_OVal:c:V:2Co
OLeu:c:L:2Co
Bn_:c:X:2Co
OBn_:c:X:2Oo
deamino_Lys:c:K:2Co
NMe24Abz:a:X:2Co
Phe_ab_dehydro_3NO2:a:F:1Nh2Co
Sta_3S4S:a:X:1Nh2Co
Bux:a:X:1Nh2Co
Dpm:a:X:1Nh2Co
pnA:a:X:1Nh2Co
pnT:a:X:1Nh2Co
seC:a:C:1Nh2Co
Aib_ol:a:X:1Nh
D_Pro_ol:a:P:1Nh
Leu_ol:a:L:1Nh
Phe_ol:a:F:1Nh
Thr_ol:a:T:1Nh
Gly_al:a:G:1Nh
Leu_al:a:L:1Nh
Phe_al:a:F:1Nh
L_hArg(Et,Et):a:R:1Nh2Co
Met_O:a:M:1Nh2Co
nTyr:a:Y:1Nh2Co
Oic_3aR_7aS:a:X:1Nh2Co
Oic_3axi_7axi:a:X:1Nh2Co
Phe_2F:a:F:1Nh2Co
Phe_3F:a:F:1Nh2Co
Phe_4F:a:F:1Nh2Co
Phe_4NO2:a:F:1Nh2Co
Phe_bbdiMe:a:F:1Nh2Co
Trp_5OH:a:W:1Nh2Co
Trp_Ome:a:W:1Nh2Co
Tyr_35diI:a:Y:1Nh2Co
Tyr_3OH:a:Y:1Nh2Co
Tyr_Me:a:Y:1Nh2Co
Tyr_PO3H2:a:Y:1Nh2Co
xiHyp:a:P:1Nh2Co
xiThr:a:T:1Nh2Co
NMe4Abz:a:X:1Nh2Co
aMeTyr:a:Y:1Nh2Co
Aoda:a:X:1Nh2Co
Bpa:a:X:1Nh2Co
Cys_Me:a:C:1Nh2Co
Dip:a:X:1Nh2Co
hArg:a:R:1Nh2Co
His_1Bn:a:H:1Nh2Co
His_3Me:a:H:1Nh2Co
Hyl_5xi:a:K:1Nh2Co
Bip:a:X:1Nh2Co
Abu_23dehydro:a:X:1Nh2Co
D_Dip:a:X:1Nh2Co
Dha:a:A:1Nh2Co
D_hArg_Et2:a:R:1Nh2Co
D_Met_S_O:a:M:1Nh2Co
D_His_1Bn:a:H:1Nh2Co
D_nTyr:a:Y:1Nh2Co
D_Phe_4ureido:a:F:1Nh2Co
AEEA:l:X:1Nh2Co
C18diacid:l:X:2Co
C16acid:l:X:2Co
Mpr:c:X:2Co3Sh
`;
var MONOMERS = (() => {
  const map = /* @__PURE__ */ new Map();
  for (const line of TABLE.trim().split("\n")) {
    if (line === "") continue;
    const [name, kind, natAnalog, spec] = line.split(":");
    if (name === void 0 || kind === void 0 || natAnalog === void 0 || spec === void 0) {
      throw new Error(`monomer table: could not read ${JSON.stringify(line)}`);
    }
    const attachments = /* @__PURE__ */ new Map();
    for (let i = 0; i < spec.length; i += 3) {
      attachments.set(Number(spec[i]), {
        element: spec[i + 1] ?? "",
        free: spec[i + 2] === "o" ? "OH" : "H"
      });
    }
    const decoded = kind === "a" ? "aa" : kind === "l" ? "linker" : kind === "c" ? "cap" : null;
    if (decoded === null) throw new Error(`monomer table: unknown kind ${JSON.stringify(kind)} for ${name}`);
    map.set(name, { name, kind: decoded, natAnalog, attachments });
  }
  return map;
})();
var UNUSABLE = /* @__PURE__ */ new Map([
  [
    "D_Phg_ol",
    "its stereocentre is unassigned upstream, so it does not state which enantiomer it is; name the L form Phg_ol, or record the structure another way"
  ],
  [
    "D_Ala_ol",
    "its attachment point is on a carbon where every other alcohol residue attaches through its nitrogen, so it would assemble backwards"
  ]
]);
function refusedMonomer(name) {
  return UNUSABLE.get(name);
}
function monomer(name) {
  return MONOMERS.get(name);
}
function allMonomers() {
  return [...MONOMERS.values()];
}
function attachmentElement(name, point) {
  return attachmentAt(name, point)?.element;
}
function attachmentAt(name, point) {
  if (point !== 1 && point !== 2 && point !== 3) return void 0;
  return MONOMERS.get(name)?.attachments.get(point);
}

// src/validate.ts
var AMINO_ACIDS = new Set("ACDEFGHIKLMNPQRSTVWYBXZJUO");
var ROOT_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
var ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.@:-]*$/;
var ValidationError = class extends Error {
  problems;
  constructor(problems) {
    super(
      problems.length === 1 ? `Invalid design record: ${problems[0]}` : `Invalid design record (${problems.length} problems):
` + problems.map((p) => `  - ${p}`).join("\n")
    );
    this.name = "ValidationError";
    this.problems = problems;
  }
};
var Problems = class {
  list = [];
  seen = /* @__PURE__ */ new Set();
  /**
   * A message identical to one already recorded is the same mistake reached a
   * second time, as when a check runs on both variant passes, so it is kept once.
   * Two messages for one mistake would send the reader looking for two.
   */
  add(message) {
    if (this.seen.has(message)) return;
    this.seen.add(message);
    this.list.push(message);
  }
  /** Records a problem and returns false, for use in guard expressions. */
  reject(message) {
    this.add(message);
    return false;
  }
};
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requireText(problems, holder, key, where) {
  const value = holder[key];
  if (typeof value !== "string" || value.trim() === "") {
    return problems.reject(`${where}: ${key} must be a non-empty string`);
  }
  return true;
}
function resolveChainId(chains, declared, subject) {
  if (chains.size === 1) {
    const value = [...chains.values()][0];
    if (declared !== void 0 && !chains.has(declared)) {
      return {
        value,
        problem: `chain_id ${JSON.stringify(declared)} is not a chain of ${subject}`
      };
    }
    return { value, problem: void 0 };
  }
  const names = [...chains.keys()].join(", ");
  if (typeof declared !== "string") {
    return {
      value: void 0,
      problem: `${subject} has ${chains.size} chains (${names}), so chain_id is required`
    };
  }
  if (!chains.has(declared)) {
    return {
      value: void 0,
      problem: `chain_id ${JSON.stringify(declared)} is not a chain of ${subject}; it has ${names}`
    };
  }
  return { value: chains.get(declared), problem: void 0 };
}
function namedMonomer(problems, entry, at, hint = "") {
  if (!requireText(problems, entry, "monomer", at)) return void 0;
  const name = entry["monomer"];
  const refusal = refusedMonomer(name);
  if (refusal !== void 0) {
    problems.add(`${at}: monomer ${JSON.stringify(name)} cannot be used because ${refusal}`);
    return void 0;
  }
  const found = monomer(name);
  if (found === void 0) {
    problems.add(`${at}: ${JSON.stringify(name)} is not a known monomer${hint}`);
    return void 0;
  }
  return found;
}
function checkEvidence(problems, where, holder) {
  if (holder["evidence"] !== void 0 && !EVIDENCE_VALUES.includes(holder["evidence"])) {
    problems.add(`${where}: evidence must be one of ${EVIDENCE_VALUES.join(", ")}`);
  }
}
function checkNote(problems, where, holder) {
  if (holder["note"] !== void 0 && typeof holder["note"] !== "string") {
    problems.add(`${where}: note must be a string`);
  }
}
function isId(value) {
  return typeof value === "string" && value.trim() !== "" && ID_PATTERN.test(value);
}
function requireId(problems, holder, key, where) {
  if (!requireText(problems, holder, key, where)) return false;
  const value = holder[key];
  if (!ID_PATTERN.test(value)) {
    return problems.reject(
      `${where}: ${key} ${JSON.stringify(value)} must start alphanumeric and use only letters, digits, and _ . @ : -`
    );
  }
  return true;
}
function validateUrl(problems, url, where) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    problems.add(`${where}: url ${JSON.stringify(url)} is not a valid absolute URL`);
    return;
  }
  if (parsed.protocol !== "https:") {
    problems.add(`${where}: url must use https, got ${JSON.stringify(parsed.protocol)}`);
  }
  if (!parsed.hostname) {
    problems.add(`${where}: url must have a hostname`);
  }
  if (parsed.username || parsed.password) {
    problems.add(`${where}: url must not embed credentials`);
  }
}
function validateSources(problems, raw) {
  const ids = /* @__PURE__ */ new Set();
  if (!Array.isArray(raw)) {
    problems.add("sources must be a list");
    return ids;
  }
  raw.forEach((entry, index) => {
    const where = `sources[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    const hasId = requireId(problems, entry, "id", where);
    for (const key of ["title", "coverage"]) {
      requireText(problems, entry, key, where);
    }
    if (requireText(problems, entry, "url", where)) {
      validateUrl(problems, entry["url"], where);
    }
    const identifier2 = entry["identifier"];
    if (identifier2 !== void 0) {
      if (!isPlainObject(identifier2)) {
        problems.add(`${where}: identifier must be an object with doi, pmid or pmcid`);
      } else {
        const known = ["doi", "pmid", "pmcid"];
        for (const key of Object.keys(identifier2)) {
          if (!known.includes(key)) {
            problems.add(`${where}.identifier: unknown key ${JSON.stringify(key)}`);
          }
        }
        if (known.every((key) => identifier2[key] === void 0)) {
          problems.add(
            `${where}.identifier: declare at least one of doi, pmid or pmcid, or omit the field`
          );
        }
        for (const key of known) {
          if (identifier2[key] !== void 0) {
            requireText(problems, identifier2, key, `${where}.identifier`);
          }
        }
        if (typeof identifier2["pmcid"] === "string" && !/^PMC\d+$/.test(identifier2["pmcid"])) {
          problems.add(`${where}.identifier: pmcid must look like PMC1234567`);
        }
        if (typeof identifier2["pmid"] === "string" && !/^\d+$/.test(identifier2["pmid"])) {
          problems.add(`${where}.identifier: pmid must be digits`);
        }
        if (typeof identifier2["doi"] === "string" && !/^10\.\S+\/\S+$/.test(identifier2["doi"])) {
          problems.add(`${where}.identifier: doi must look like 10.xxxx/yyyy`);
        }
      }
    }
    const published = entry["published"];
    if (published !== void 0) {
      if (typeof published !== "string" || !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(published)) {
        problems.add(
          `${where}: published must be YYYY, YYYY-MM or YYYY-MM-DD; got ${JSON.stringify(published)}`
        );
      }
    }
    if (hasId) {
      const id = entry["id"];
      if (ids.has(id)) {
        problems.add(`${where}: duplicate source id ${JSON.stringify(id)}`);
      }
      ids.add(id);
    }
  });
  return ids;
}
function validateRegions(problems, raw) {
  const ids = /* @__PURE__ */ new Set();
  if (!Array.isArray(raw)) {
    problems.add("regions must be a list");
    return ids;
  }
  if (raw.length === 0) {
    problems.add("regions must hold at least one definition, because every feature references one");
  }
  raw.forEach((entry, index) => {
    const where = `regions[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    const hasId = requireId(problems, entry, "region_id", where);
    requireText(problems, entry, "name", where);
    const kind = entry["kind"];
    if (typeof kind !== "string" || !REGION_KINDS.includes(kind)) {
      problems.add(
        `${where}: kind must be one of ${REGION_KINDS.join(", ")}; got ${JSON.stringify(kind)}`
      );
    }
    const aliases2 = entry["aliases"];
    if (aliases2 !== void 0) {
      if (!Array.isArray(aliases2)) {
        problems.add(`${where}: aliases must be a list`);
      } else {
        aliases2.forEach((alias, aliasIndex) => {
          const aliasWhere = `${where}.aliases[${aliasIndex}]`;
          if (!isPlainObject(alias)) {
            problems.add(`${aliasWhere} must be an object`);
            return;
          }
          requireText(problems, alias, "name", aliasWhere);
        });
      }
    }
    if (hasId) {
      const id = entry["region_id"];
      if (ids.has(id)) {
        problems.add(`${where}: duplicate region_id ${JSON.stringify(id)}`);
      }
      ids.add(id);
    }
  });
  return ids;
}
var CHAIN_DERIVATIONS = ["unchanged", "edited", "unverified"];
var MAX_COPIES = 1e3;
var RESERVED_CHAIN_ID = "_single";
function validateChains(problems, variant, where) {
  const out = /* @__PURE__ */ new Map();
  rejectMisplacedChemistry(problems, variant, where, "variant");
  const unexpressed = variant["unexpressed_chemistry"];
  const hasChains = variant["chains"] !== void 0;
  const hasSequence = variant["sequence"] !== void 0;
  if (hasChains && hasSequence) {
    problems.add(
      `${where}: has both sequence and chains. A construct declares one or the other; a bare sequence is the single-chain shorthand.`
    );
    return out;
  }
  if (!hasChains && !hasSequence) {
    problems.add(`${where}: has neither sequence nor chains`);
    return out;
  }
  if (!hasChains) {
    validateSequence(problems, variant["sequence"], where);
    if (typeof variant["sequence"] === "string") {
      out.set(RESERVED_CHAIN_ID, variant["sequence"]);
    }
    validateChainChemistry(
      problems,
      {},
      where,
      typeof variant["sequence"] === "string" ? variant["sequence"] : null,
      explainedPositions(unexpressed, null, null)
    );
    validateUnexpressedChemistry(problems, unexpressed, where, out);
    return out;
  }
  for (const field of ["edits", "assembly", "reference_id"]) {
    if (variant[field] !== void 0) {
      problems.add(
        `${where}: ${field} cannot sit on a variant that declares chains; it belongs to a chain`
      );
    }
  }
  const list = variant["chains"];
  if (!Array.isArray(list) || list.length === 0) {
    problems.add(`${where}: chains must be a non-empty list`);
    return out;
  }
  const soleChainId = soleChainIdOf(list);
  list.forEach((entry, index) => {
    const chainWhere = `${where}.chains[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${chainWhere} must be an object`);
      return;
    }
    let chainId = null;
    if (requireId(problems, entry, "chain_id", chainWhere)) {
      chainId = entry["chain_id"];
      if (chainId === RESERVED_CHAIN_ID) {
        problems.add(
          `${chainWhere}: chain_id ${JSON.stringify(RESERVED_CHAIN_ID)} is reserved for the single-chain shorthand, so an adapted record stays distinguishable from one that declared a chain by that name`
        );
      }
      if (out.has(chainId)) {
        problems.add(`${chainWhere}: duplicate chain_id ${JSON.stringify(chainId)}`);
      }
    }
    rejectMisplacedChemistry(problems, entry, chainWhere, "chain");
    requireText(problems, entry, "name", chainWhere);
    validateSequence(problems, entry["sequence"], chainWhere);
    if (chainId !== null && typeof entry["sequence"] === "string") {
      out.set(chainId, entry["sequence"]);
    }
    const copies = entry["copies"];
    if (copies !== void 0 && (!Number.isInteger(copies) || copies < 1)) {
      problems.add(`${chainWhere}: copies must be an integer of at least 1 when present`);
    } else if (typeof copies === "number" && copies > MAX_COPIES) {
      problems.add(
        `${chainWhere}: copies is ${copies}, past the ${MAX_COPIES} this schema accepts. It is a count of instances in one designed molecule, and a figure and a chemistry check are drawn and tallied per instance.`
      );
    }
    validateChainChemistry(
      problems,
      "chemistry" in entry ? entry["chemistry"] : {},
      chainWhere,
      typeof entry["sequence"] === "string" ? entry["sequence"] : null,
      explainedPositions(unexpressed, chainId, soleChainId)
    );
    const hasAssembly = entry["assembly"] !== void 0;
    const hasEdits = entry["edits"] !== void 0;
    const derivation = entry["derivation"];
    if (hasAssembly && (hasEdits || derivation !== void 0)) {
      problems.add(
        `${chainWhere}: a chain is either assembled from donors or derived from the parent's chain, and cannot be both`
      );
    }
    if (derivation !== void 0 && !CHAIN_DERIVATIONS.includes(derivation)) {
      problems.add(`${chainWhere}: derivation must be one of ${CHAIN_DERIVATIONS.join(", ")}`);
    }
  });
  validateUnexpressedChemistry(problems, unexpressed, where, out);
  return out;
}
function soleChainIdOf(list) {
  return list.length === 1 && isPlainObject(list[0]) && typeof list[0]["chain_id"] === "string" ? list[0]["chain_id"] : null;
}
function validateChainDerivations(problems, variant, where, parentChains, parentFingerprints) {
  const list = variant["chains"];
  if (variant["sequence"] !== void 0 || !Array.isArray(list) || list.length === 0) return;
  const unexpressed = variant["unexpressed_chemistry"];
  const soleChainId = soleChainIdOf(list);
  list.forEach((entry, index) => {
    if (!isPlainObject(entry)) return;
    const chainWhere = `${where}.chains[${index}]`;
    const chainId = isId(entry["chain_id"]) ? entry["chain_id"] : null;
    const hasAssembly = entry["assembly"] !== void 0;
    const hasEdits = entry["edits"] !== void 0;
    const derivation = entry["derivation"];
    if (chainId === null) return;
    const parentSequence = parentChains.get(chainId);
    const sequence = typeof entry["sequence"] === "string" ? entry["sequence"] : null;
    if (parentSequence === void 0) {
      if (hasEdits) {
        problems.add(
          `${chainWhere}: declares edits, but the parent has no chain ${JSON.stringify(chainId)} for those coordinates to be measured in. Edits are framed in the parent's chain of the same id.`
        );
      }
      if (derivation !== void 0 && !hasAssembly) {
        problems.add(
          `${chainWhere}: derivation ${JSON.stringify(derivation)} describes a relationship to the parent's chain ${JSON.stringify(chainId)}, which does not exist`
        );
      }
      return;
    }
    if (hasAssembly) return;
    if (derivation === void 0) {
      problems.add(
        `${chainWhere}: the parent has chain ${JSON.stringify(chainId)}, so derivation is required: "unchanged" (sequence must match), "edited" (edits must reproduce it) or "unverified" (differs, correspondence inferred)`
      );
      return;
    }
    if (derivation === "unchanged" && sequence !== null && sequence !== parentSequence) {
      problems.add(
        `${chainWhere}: derivation is "unchanged" but the sequence differs from the parent's chain (${sequence.length} vs ${parentSequence.length} residues)`
      );
    }
    const fingerprint = chainChemistryFingerprint(
      { chain_id: chainId, chemistry: entry["chemistry"] },
      variant["chemistry"],
      soleChainId,
      unexpressed
    );
    const parentFingerprint = parentFingerprints.get(chainId) ?? "";
    const chemistryMatches = fingerprint === parentFingerprint;
    if (derivation === "unchanged" && !chemistryMatches) {
      problems.add(
        `${chainWhere}: derivation is "unchanged" but the chemistry differs from the parent's chain. "unchanged" asserts the same molecule, so the chemistry has to match as well as the letters. Here: ${fingerprint === "" ? "none" : fingerprint}; parent: ${parentFingerprint === "" ? "none" : parentFingerprint}.`
      );
    }
    if (hasEdits) validateEdits(problems, entry["edits"], chainWhere);
    if (derivation === "edited") {
      const edits = entry["edits"];
      if (!Array.isArray(edits) || edits.length === 0) {
        problems.add(
          `${chainWhere}: derivation is "edited" but no edits are declared. Declare at least one edit, or use "unverified" when the change is not accounted for.`
        );
      }
    }
    if (derivation === "unverified" && hasEdits) {
      problems.add(
        `${chainWhere}: derivation is "unverified" but edits are declared; that is "edited"`
      );
    }
    if (derivation === "unverified" && sequence !== null && sequence === parentSequence && chemistryMatches) {
      problems.add(
        `${chainWhere}: derivation is "unverified" but the sequence and the chemistry are both identical to the parent's chain. "unverified" states that it differs and the change is not accounted for; an identical molecule is "unchanged", which is checkable.`
      );
    }
  });
}
function rejectUnknownKeys(problems, object, allowed, at, hints = {}) {
  for (const key of Object.keys(object)) {
    if (allowed.includes(key)) continue;
    problems.add(
      `${at}: unknown field ${JSON.stringify(key)}. ${hints[key] ?? `The fields here are ${allowed.join(", ")}.`} A field nothing reads is chemistry that never reaches the molecule, the figure or the export guard.`
    );
  }
}
function explainedPositions(raw, chainId, soleChainId) {
  const out = /* @__PURE__ */ new Set();
  if (!Array.isArray(raw)) return out;
  for (const entry of raw) {
    if (!isPlainObject(entry)) continue;
    const entryChain = typeof entry["chain_id"] === "string" ? entry["chain_id"] : null;
    const resolved = entryChain ?? chainId ?? soleChainId;
    if (chainId !== null && resolved !== chainId) continue;
    const position = entry["position"];
    if (Number.isInteger(position)) out.add(position);
  }
  return out;
}
function validateUnexpressedChemistry(problems, raw, where, chainSequences) {
  if (raw === void 0) return;
  if (!Array.isArray(raw)) {
    problems.add(`${where}.unexpressed_chemistry must be a list when present`);
    return;
  }
  if (raw.length === 0) {
    problems.add(
      `${where}.unexpressed_chemistry is empty. An empty list says a design needs nothing it cannot express, which is what omitting the field already says, and it would make export refuse with nothing to name.`
    );
    return;
  }
  const multi = chainSequences.size > 1;
  raw.forEach((entry, index) => {
    const at = `${where}.unexpressed_chemistry[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${at} must be an object`);
      return;
    }
    rejectUnknownKeys(problems, entry, ["chain_id", "position", "what", "why"], at, {
      monomer: "A monomer that EXISTS belongs in chemistry.residues. This field is for chemistry the vocabulary cannot name at all."
    });
    for (const field of ["what", "why"]) {
      const value = entry[field];
      if (typeof value !== "string" || value.trim().length < 8) {
        problems.add(
          `${at}: ${field} must be a sentence saying ` + (field === "what" ? "what the molecule needs, in chemical terms" : "specifically why it cannot be recorded, so the claim can be checked")
        );
      }
    }
    const chainId = entry["chain_id"];
    if (chainId !== void 0) {
      if (typeof chainId !== "string" || !chainSequences.has(chainId)) {
        problems.add(`${at}: chain_id ${JSON.stringify(chainId)} is not a chain of this construct`);
      }
    } else if (multi) {
      problems.add(
        `${at}: chain_id is required when the construct has more than one chain, because a modification belongs to one chain's molecule`
      );
    }
    const position = entry["position"];
    if (position !== void 0) {
      const sequence = typeof chainId === "string" ? chainSequences.get(chainId) : [...chainSequences.values()][0];
      if (!Number.isInteger(position) || position < 1) {
        problems.add(`${at}: position must be a positive integer when present`);
      } else if (sequence !== void 0 && position > sequence.length) {
        problems.add(
          `${at}: position ${position} is past the end of a ${sequence.length}-residue chain`
        );
      }
    }
  });
}
var CHEMISTRY_BELONGS = {
  bonds: "the VARIANT's own chemistry, as variant.chemistry.bonds",
  conjugates: "the VARIANT's own chemistry, as variant.chemistry.conjugates",
  residues: "a CHAIN's own chemistry, as chain.chemistry.residues",
  caps: "a CHAIN's own chemistry, as chain.chemistry.caps"
};
var LEVEL_ONLY = {
  chemistry: {
    legalAt: "variant",
    belongs: "a VARIANT or a CHAIN. Residues and caps belong on a chain and bonds and conjugates on a variant, because chemistry describes ONE designed molecule and a record holds several"
  },
  unexpressed_chemistry: {
    legalAt: "variant",
    belongs: "the VARIANT itself, beside chemistry, as variant.unexpressed_chemistry. It describes what the molecule was meant to have, so it belongs to the molecule"
  }
};
function rejectMisplacedChemistry(problems, object, at, level) {
  const say = (key, belongs) => {
    problems.add(
      `${at}: ${key} does not belong here -- it belongs on ${belongs}. A chemistry field outside the place that reads it is read by nothing, so it would validate, stay out of the molecule, the figure and the export guard, and leave the FASTA as plain letters.`
    );
  };
  for (const [key, belongs] of Object.entries(CHEMISTRY_BELONGS)) {
    if (key in object) say(key, belongs);
  }
  for (const [key, rule] of Object.entries(LEVEL_ONLY)) {
    const wrongHere = key === "chemistry" ? level === "record" : level !== rule.legalAt;
    if (wrongHere && key in object) say(key, rule.belongs);
  }
}
function validateEndShape(problems, end, endAt, chainSequences) {
  if (!isPlainObject(end)) {
    problems.add(`${endAt} must be an object naming a residue and an attachment`);
    return null;
  }
  rejectUnknownKeys(problems, end, ["chain_id", "copy", "position", "attachment", "expected"], endAt);
  const chainId = end["chain_id"];
  let resolved = null;
  if (chainId === void 0) {
    if (chainSequences.size === 1) {
      resolved = [...chainSequences.keys()][0];
    } else {
      problems.add(
        `${endAt}: chain_id is required when the construct has ${chainSequences.size} chains`
      );
    }
  } else if (typeof chainId !== "string" || !chainSequences.has(chainId)) {
    problems.add(
      `${endAt}: chain_id ${JSON.stringify(chainId)} is not a chain of this construct. Chemistry here is inside one molecule, so every end is a chain of the same construct.`
    );
  } else {
    resolved = chainId;
  }
  const position = end["position"];
  if (typeof position !== "number" || !Number.isInteger(position) || position < 1) {
    problems.add(`${endAt}: position must be a positive integer`);
    return null;
  }
  const sequence = resolved === null ? void 0 : chainSequences.get(resolved);
  if (sequence !== void 0 && position > sequence.length) {
    problems.add(
      `${endAt}: position ${position} is past the end of a ${sequence.length}-residue chain`
    );
    return null;
  }
  const attachment = end["attachment"];
  if (attachment !== 1 && attachment !== 2 && attachment !== 3) {
    problems.add(
      `${endAt}: attachment must be 1 (the N-terminal side), 2 (the C-terminal side) or 3 (the side chain). It is never inferred: a disulfide joins two side chains and a cyclization joins two termini, and the residue letter says which neither time.`
    );
  }
  const expected = end["expected"];
  if (expected !== void 0) {
    if (typeof expected !== "string" || expected.length !== 1 || !AMINO_ACIDS.has(expected)) {
      problems.add(`${endAt}: expected must be a single amino-acid letter`);
    } else if (sequence !== void 0 && sequence[position - 1] !== expected) {
      problems.add(
        `${endAt}: expected ${JSON.stringify(expected)} at position ${position}, but the sequence has ${JSON.stringify(sequence[position - 1])}`
      );
    }
  }
  const copy = typeof end["copy"] === "number" ? end["copy"] : 1;
  return resolved === null ? null : { chainId: resolved, copy, position };
}
var BOND_KINDS = ["disulfide", "amide", "thioester", "backbone", "other"];
var AMBIGUITY_CODES = new Set("BZJ");
function validateChainResidues(problems, raw, where, sequence) {
  const declared = /* @__PURE__ */ new Map();
  const residues = raw["residues"];
  if (residues !== void 0) {
    if (!Array.isArray(residues)) {
      problems.add(`${where}.chemistry: residues must be a list`);
    } else {
      residues.forEach((entry, index) => {
        const at = `${where}.chemistry.residues[${index}]`;
        if (!isPlainObject(entry)) {
          problems.add(`${at} must be an object`);
          return;
        }
        rejectUnknownKeys(problems, entry, ["position", "monomer", "note"], at);
        const position = entry["position"];
        if (typeof position !== "number" || !Number.isInteger(position) || position < 1) {
          problems.add(`${at}: position must be a positive integer`);
          return;
        }
        if (sequence !== null && position > sequence.length) {
          problems.add(
            `${at}: position ${position} is past the end of a ${sequence.length}-residue chain`
          );
          return;
        }
        if (declared.has(position)) {
          problems.add(
            `${at}: position ${position} already names monomer ${JSON.stringify(declared.get(position))}. Two monomers at one position describe two molecules.`
          );
          return;
        }
        const found = namedMonomer(
          problems,
          entry,
          at,
          '. Names are case-sensitive: "dA" is D-alanine and "DA" is nothing.'
        );
        if (found === void 0) return;
        const name = entry["monomer"];
        if (found.kind !== "aa") {
          problems.add(
            found.kind === "cap" ? `${at}: ${JSON.stringify(name)} is a capping group, not a residue. A cap has no N-terminal attachment, so mid-chain it would break the backbone; declare it under caps.` : `${at}: ${JSON.stringify(name)} is a linker, not a residue. It occupies no sequence position; it is a unit of a conjugate hanging off a residue.`
          );
          return;
        }
        const letterHere = sequence === null ? null : sequence[position - 1] ?? null;
        if (letterHere !== null && name === letterHere) {
          problems.add(
            `${at}: ${JSON.stringify(name)} is what the letter ${JSON.stringify(letterHere)} already means, so this entry restates the default. Absence IS the assertion that a position is the plain L residue, and writing it out as well makes two spellings of one molecule -- one of which reads as a chemistry change to anything comparing them. Remove the entry.`
          );
          return;
        }
        declared.set(position, name);
        if (letterHere !== null && letterHere !== found.natAnalog) {
          problems.add(
            `${at}: monomer ${JSON.stringify(name)} stands in for ${JSON.stringify(found.natAnalog)}, but the sequence has ${JSON.stringify(letterHere)} at position ${position}. The letter must be the monomer's natural analogue, so every positional annotation still lands on the residue it means.`
          );
        }
        checkNote(problems, at, entry);
      });
    }
  }
  return declared;
}
function validateChainCaps(problems, raw, where) {
  const caps = raw["caps"];
  if (caps !== void 0) {
    if (!Array.isArray(caps)) {
      problems.add(`${where}.chemistry: caps must be a list`);
    } else {
      const seen = /* @__PURE__ */ new Set();
      caps.forEach((entry, index) => {
        const at = `${where}.chemistry.caps[${index}]`;
        if (!isPlainObject(entry)) {
          problems.add(`${at} must be an object`);
          return;
        }
        rejectUnknownKeys(problems, entry, ["terminus", "monomer", "note"], at);
        const terminus = entry["terminus"];
        if (terminus !== "N" && terminus !== "C") {
          problems.add(`${at}: terminus must be "N" or "C"`);
          return;
        }
        if (seen.has(terminus)) {
          problems.add(`${at}: the ${terminus} terminus is already capped`);
          return;
        }
        seen.add(terminus);
        const found = namedMonomer(problems, entry, at);
        if (found === void 0) return;
        const name = entry["monomer"];
        if (found.kind !== "cap") {
          problems.add(
            found.kind === "linker" ? `${at}: ${JSON.stringify(name)} is a linker, which is a unit of a conjugate and cannot cap the end of a chain.` : `${at}: ${JSON.stringify(name)} is a residue. A capping group names a terminal group, while a residue occupies a sequence position and is declared under residues.`
          );
          return;
        }
        const needed = terminus === "N" ? 2 : 1;
        const forbidden = terminus === "N" ? 1 : 2;
        if (!found.attachments.has(needed) || found.attachments.has(forbidden)) {
          problems.add(
            `${at}: ${JSON.stringify(name)} cannot cap the ${terminus} terminus. It would have to attach through point ${needed}, and it presents ${[...found.attachments.keys()].sort().join(", ")}.`
          );
        }
        checkNote(problems, at, entry);
      });
    }
  }
}
function validateUncoveredLetters(problems, where, sequence, declared, explained) {
  const bareX = [];
  const codes = [];
  for (let position = 1; position <= sequence.length; position += 1) {
    const letter = sequence[position - 1];
    if (letter === "X" && !declared.has(position) && !explained.has(position)) {
      bareX.push(position);
    }
    if (AMBIGUITY_CODES.has(letter) && declared.has(position)) codes.push(position);
  }
  if (bareX.length > 0) {
    problems.add(
      `${where}: ${bareX.length === 1 ? "position" : "positions"} ${bareX.join(", ")} ${bareX.length === 1 ? "is" : "are"} "X", which names no residue on its own. Each needs a chemistry entry naming its monomer, or the sequence states nothing about what is there.`
    );
  }
  if (codes.length > 0) {
    problems.add(
      `${where}: positions ${codes.join(", ")} carry an ambiguity code (B, Z or J), which stands for one of several residues. There is no single monomer to name there.`
    );
  }
}
function validateChainChemistry(problems, raw, where, sequence, explained = /* @__PURE__ */ new Set()) {
  if (!isPlainObject(raw)) {
    problems.add(`${where}: chemistry must be an object`);
    return;
  }
  rejectUnknownKeys(problems, raw, ["residues", "caps", "note"], `${where}.chemistry`, {
    bonds: "Bonds belong on the VARIANT's chemistry, not on a chain, because one can join two chains.",
    conjugates: "Conjugates belong on the VARIANT's chemistry, not on a chain, because they are part of the molecule."
  });
  checkNote(problems, `${where}.chemistry`, raw);
  const declared = validateChainResidues(problems, raw, where, sequence);
  validateChainCaps(problems, raw, where);
  if (sequence === null) return;
  validateUncoveredLetters(problems, where, sequence, declared, explained);
}
function validateBonds(problems, raw, where, chainSequences, sourceIds) {
  if (!isPlainObject(raw)) {
    problems.add(`${where}: chemistry must be an object`);
    return;
  }
  rejectUnknownKeys(problems, raw, ["bonds", "conjugates", "note"], `${where}.chemistry`, {
    residues: "Residues belong on a CHAIN's own chemistry, in that chain's positions, not on the variant.",
    caps: "Caps belong on a CHAIN's own chemistry, not on the variant."
  });
  checkNote(problems, `${where}.chemistry`, raw);
  const bonds = raw["bonds"];
  if (bonds === void 0) return;
  if (!Array.isArray(bonds)) {
    problems.add(`${where}.chemistry: bonds must be a list`);
    return;
  }
  const ids = /* @__PURE__ */ new Set();
  bonds.forEach((entry, index) => {
    const at = `${where}.chemistry.bonds[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${at} must be an object`);
      return;
    }
    rejectUnknownKeys(
      problems,
      entry,
      ["bond_id", "kind", "a", "b", "evidence", "source_id", "note"],
      at
    );
    if (requireId(problems, entry, "bond_id", at)) {
      const id = entry["bond_id"];
      if (ids.has(id)) problems.add(`${at}: duplicate bond_id ${JSON.stringify(id)}`);
      ids.add(id);
    }
    const kind = entry["kind"];
    if (kind === "thioether") {
      problems.add(
        `${at}: there is no "thioether" kind. Every carbon attachment a BOND can reach is an acyl carbon, so a sulfur bonded to one is a thioester -- use "thioester" if that is what the molecule has. A true thioether needs an attachment on an sp3 carbon, which this vocabulary does not offer.`
      );
    } else if (typeof kind !== "string" || !BOND_KINDS.includes(kind)) {
      problems.add(`${at}: kind must be one of ${BOND_KINDS.join(", ")}`);
    } else if (kind === "other" && (typeof entry["note"] !== "string" || entry["note"] === "")) {
      problems.add(
        `${at}: kind "other" means the chemistry is not one this schema names, so note must say what it is`
      );
    }
    checkNote(problems, at, entry);
    checkEvidence(problems, at, entry);
    const sourceId = entry["source_id"];
    if (sourceId !== void 0 && (typeof sourceId !== "string" || !sourceIds.has(sourceId))) {
      problems.add(`${at}: source_id ${JSON.stringify(sourceId)} is not a declared source_id`);
    }
    const ends = [];
    for (const side of ["a", "b"]) {
      const resolved = validateEndShape(problems, entry[side], `${at}.${side}`, chainSequences);
      if (resolved !== null) ends.push(resolved);
    }
    if (ends.length === 2 && ends[0].chainId === ends[1].chainId && ends[0].copy === ends[1].copy && ends[0].position === ends[1].position) {
      problems.add(`${at}: both ends resolve to the same residue; a residue does not bond to itself`);
    }
  });
}
var JOINABLE = /* @__PURE__ */ new Set(["C|N", "S|S", "C|S"]);
var joinable = (a, b) => JOINABLE.has([a, b].sort().join("|"));
function validateConjugates(problems, raw, where, chainSequences, sourceIds) {
  if (!isPlainObject(raw)) return;
  const conjugates = raw["conjugates"];
  if (conjugates === void 0) return;
  if (!Array.isArray(conjugates)) {
    problems.add(`${where}.chemistry: conjugates must be a list`);
    return;
  }
  const ids = /* @__PURE__ */ new Set();
  conjugates.forEach((entry, index) => {
    const at = `${where}.chemistry.conjugates[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${at} must be an object`);
      return;
    }
    rejectUnknownKeys(
      problems,
      entry,
      ["conjugate_id", "anchor", "units", "evidence", "source_id", "note"],
      at
    );
    if (requireId(problems, entry, "conjugate_id", at)) {
      const id = entry["conjugate_id"];
      if (ids.has(id)) problems.add(`${at}: duplicate conjugate_id ${JSON.stringify(id)}`);
      ids.add(id);
    }
    checkNote(problems, at, entry);
    checkEvidence(problems, at, entry);
    const sourceId = entry["source_id"];
    if (sourceId !== void 0 && (typeof sourceId !== "string" || !sourceIds.has(sourceId))) {
      problems.add(`${at}: source_id ${JSON.stringify(sourceId)} is not a declared source_id`);
    }
    validateEndShape(problems, entry["anchor"], `${at}.anchor`, chainSequences);
    const units = entry["units"];
    if (!Array.isArray(units) || units.length === 0) {
      problems.add(`${at}: units must be a non-empty list, from the anchor outward`);
      return;
    }
    units.forEach((unit, unitIndex) => {
      const unitAt = `${at}.units[${unitIndex}]`;
      if (!isPlainObject(unit)) {
        problems.add(`${unitAt} must be an object`);
        return;
      }
      const last = unitIndex === units.length - 1;
      rejectUnknownKeys(problems, unit, ["monomer", "in", "out", "note"], unitAt);
      const found = namedMonomer(problems, unit, unitAt, ". Names are case-sensitive.");
      if (found === void 0) return;
      const name = unit["monomer"];
      const inPoint = unit["in"];
      const outPoint = unit["out"];
      if (inPoint !== 1 && inPoint !== 2 && inPoint !== 3) {
        problems.add(
          `${unitAt}: in must be 1, 2 or 3 -- the attachment of THIS unit that bonds to what comes before it. It is never inferred: a unit can offer two carboxyls or two amines, and naming the wrong one is a different molecule that is just as valid.`
        );
        return;
      }
      if (!found.attachments.has(inPoint)) {
        problems.add(
          `${unitAt}: ${name} has no attachment ${inPoint}; it offers ${[...found.attachments.keys()].sort().join(", ")}`
        );
      }
      if (last) {
        if (outPoint !== void 0) {
          problems.add(`${unitAt}: this is the last unit, so nothing follows it and out must be omitted`);
        }
      } else if (outPoint !== 1 && outPoint !== 2 && outPoint !== 3) {
        problems.add(`${unitAt}: out must be 1, 2 or 3, because another unit follows`);
      } else {
        if (!found.attachments.has(outPoint)) {
          problems.add(
            `${unitAt}: ${name} has no attachment ${outPoint}; it offers ${[...found.attachments.keys()].sort().join(", ")}`
          );
        }
        if (outPoint === inPoint) {
          problems.add(`${unitAt}: in and out are both ${inPoint}; one atom carries one bond`);
        }
      }
      checkNote(problems, unitAt, unit);
    });
  });
}
var BOND_CHEMISTRY = {
  disulfide: { elements: ["S", "S"], what: "two thiols" },
  thioester: { elements: ["S", "C"], what: "a thiol and a carboxyl carbon" },
  amide: { elements: ["N", "C"], what: "an amine and a carboxyl" },
  backbone: { elements: ["N", "C"], what: "an amine and a carboxyl" }
};
function monomerAt(sequence, declared, position) {
  const named = declared.get(position);
  if (named !== void 0) return named;
  const letter = sequence[position - 1];
  if (letter === void 0 || monomer(letter) === void 0) return null;
  return letter;
}
function chainChemistryFingerprint(chain, variantChemistry, soleChainId, unexpressedFor) {
  const parts = [];
  const chainId = chain.chain_id ?? soleChainId ?? "";
  const chemistry = chain.chemistry;
  if (isPlainObject(chemistry)) {
    const caps = Array.isArray(chemistry["caps"]) ? chemistry["caps"] : [];
    const capParts2 = [];
    for (const cap of caps) {
      if (!isPlainObject(cap)) continue;
      capParts2.push(`${String(cap["terminus"])}=${String(cap["monomer"])}`);
    }
    if (capParts2.length > 0) parts.push(`caps:${capParts2.sort().join(",")}`);
    const residues = Array.isArray(chemistry["residues"]) ? chemistry["residues"] : [];
    const residueParts = [];
    for (const residue of residues) {
      if (!isPlainObject(residue)) continue;
      residueParts.push(`${String(residue["position"])}=${String(residue["monomer"])}`);
    }
    if (residueParts.length > 0) {
      parts.push(
        `residues:${residueParts.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10)).join(",")}`
      );
    }
  }
  if (isPlainObject(variantChemistry) && Array.isArray(variantChemistry["bonds"])) {
    const bondParts = [];
    for (const bond of variantChemistry["bonds"]) {
      if (!isPlainObject(bond)) continue;
      const ends = [];
      let touchesThisChain = false;
      for (const side of ["a", "b"]) {
        const end = bond[side];
        if (!isPlainObject(end)) continue;
        const endChain = typeof end["chain_id"] === "string" ? end["chain_id"] : soleChainId ?? "";
        if (endChain === chainId) touchesThisChain = true;
        const copy = typeof end["copy"] === "number" ? end["copy"] : 1;
        ends.push(`${endChain}@${copy}/${String(end["position"])}/${String(end["attachment"])}`);
      }
      if (!touchesThisChain || ends.length !== 2) continue;
      bondParts.push(`${String(bond["kind"])}:${ends.sort().join("-")}`);
    }
    if (bondParts.length > 0) parts.push(`bonds:${bondParts.sort().join(";")}`);
  }
  if (Array.isArray(unexpressedFor)) {
    const gapParts2 = [];
    for (const entry of unexpressedFor) {
      if (!isPlainObject(entry)) continue;
      const entryChain = typeof entry["chain_id"] === "string" ? entry["chain_id"] : soleChainId ?? "";
      if (entryChain !== chainId) continue;
      gapParts2.push(`${String(entry["position"] ?? "-")}/${String(entry["what"])}`);
    }
    if (gapParts2.length > 0) parts.push(`unexpressed:${gapParts2.sort().join(";")}`);
  }
  if (isPlainObject(variantChemistry) && Array.isArray(variantChemistry["conjugates"])) {
    const conjugateParts2 = [];
    for (const conjugate of variantChemistry["conjugates"]) {
      if (!isPlainObject(conjugate) || !isPlainObject(conjugate["anchor"])) continue;
      const anchor = conjugate["anchor"];
      const anchorChain = typeof anchor["chain_id"] === "string" ? anchor["chain_id"] : soleChainId ?? "";
      if (anchorChain !== chainId) continue;
      const copy = typeof anchor["copy"] === "number" ? anchor["copy"] : 1;
      const units = Array.isArray(conjugate["units"]) ? conjugate["units"].map(
        (unit) => isPlainObject(unit) ? `${String(unit["in"])}${String(unit["monomer"])}${String(unit["out"] ?? "")}` : "?"
      ).join(">") : "";
      conjugateParts2.push(
        `${anchorChain}@${copy}/${String(anchor["position"])}/${String(anchor["attachment"])}>${units}`
      );
    }
    if (conjugateParts2.length > 0) parts.push(`conjugates:${conjugateParts2.sort().join(";")}`);
  }
  return parts.join("|");
}
function fingerprintsOf(variant) {
  const out = /* @__PURE__ */ new Map();
  const list = variant["chains"];
  if (!Array.isArray(list)) return out;
  const soleChainId = list.length === 1 && isPlainObject(list[0]) && typeof list[0]["chain_id"] === "string" ? list[0]["chain_id"] : null;
  for (const entry of list) {
    if (!isPlainObject(entry) || typeof entry["chain_id"] !== "string") continue;
    out.set(
      entry["chain_id"],
      chainChemistryFingerprint(
        { chain_id: entry["chain_id"], chemistry: entry["chemistry"] },
        variant["chemistry"],
        soleChainId,
        variant["unexpressed_chemistry"]
      )
    );
  }
  return out;
}
function ledgerChains(variant, chainSequences) {
  const raw = variant["chains"];
  const entries = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const [chainId, sequence] of chainSequences) {
    const entry = entries.find(
      (candidate) => isPlainObject(candidate) && candidate["chain_id"] === chainId
    );
    const copies = entry !== void 0 && Number.isInteger(entry["copies"]) ? entry["copies"] : 1;
    const chemistry = entry === void 0 ? void 0 : entry["chemistry"];
    const declared = /* @__PURE__ */ new Map();
    const caps = [];
    if (isPlainObject(chemistry)) {
      const residues = chemistry["residues"];
      if (Array.isArray(residues)) {
        for (const item of residues) {
          if (!isPlainObject(item)) continue;
          if (typeof item["position"] !== "number" || typeof item["monomer"] !== "string") continue;
          if (declared.has(item["position"])) continue;
          declared.set(item["position"], item["monomer"]);
        }
      }
      const capList = chemistry["caps"];
      if (Array.isArray(capList)) {
        for (const item of capList) {
          if (!isPlainObject(item)) continue;
          const terminus = item["terminus"];
          if (terminus !== "N" && terminus !== "C" || typeof item["monomer"] !== "string") continue;
          if (caps.some((cap) => cap.terminus === terminus)) continue;
          caps.push({ terminus, monomer: item["monomer"] });
        }
      }
    }
    out.push({ chainId, sequence, copies: copies < 1 ? 1 : copies, declared, caps });
  }
  return out;
}
function conjugatesOf(variant) {
  const chemistry = variant["chemistry"];
  if (!isPlainObject(chemistry)) return [];
  const list = chemistry["conjugates"];
  if (!Array.isArray(list)) return [];
  return list.filter((entry) => isPlainObject(entry));
}
function bondsOf(variant) {
  const chemistry = variant["chemistry"];
  if (!isPlainObject(chemistry)) return [];
  const bonds = chemistry["bonds"];
  if (!Array.isArray(bonds)) return [];
  return bonds.filter((bond) => isPlainObject(bond));
}
function claimChainAtoms(problems, chains, bonds, conjugates, where, claim) {
  const named = /* @__PURE__ */ new Map();
  const note = (end) => {
    if (!isPlainObject(end)) return;
    const chainId = typeof end["chain_id"] === "string" ? end["chain_id"] : chains.length === 1 ? chains[0].chainId : null;
    if (chainId === null) return;
    const copy = typeof end["copy"] === "number" && Number.isInteger(end["copy"]) ? end["copy"] : 1;
    const set = named.get(chainId) ?? /* @__PURE__ */ new Set();
    set.add(copy);
    named.set(chainId, set);
  };
  for (const bond of bonds) {
    note(bond["a"]);
    note(bond["b"]);
  }
  for (const conjugate of conjugates) note(conjugate["anchor"]);
  for (const chain of chains) {
    const length = chain.sequence.length;
    const copiesToTally = /* @__PURE__ */ new Set([1, ...named.get(chain.chainId) ?? []]);
    for (const copy of copiesToTally) {
      if (copy < 1 || copy > chain.copies) continue;
      for (let position = 1; position < length; position += 1) {
        claim(chain.chainId, copy, position, 2, `the backbone bond ${position}-${position + 1}`);
        claim(chain.chainId, copy, position + 1, 1, `the backbone bond ${position}-${position + 1}`);
      }
      for (const cap of chain.caps) {
        const position = cap.terminus === "N" ? 1 : length;
        const attachment = cap.terminus === "N" ? 1 : 2;
        claim(chain.chainId, copy, position, attachment, `the ${cap.terminus}-terminal cap`);
      }
    }
    for (const cap of chain.caps) {
      const position = cap.terminus === "N" ? 1 : length;
      const attachment = cap.terminus === "N" ? 1 : 2;
      const name = monomerAt(chain.sequence, chain.declared, position);
      if (name !== null && attachmentAt(name, attachment) === void 0) {
        problems.add(
          `${where}: chain ${JSON.stringify(chain.chainId)} cannot take a ${cap.terminus}-terminal cap (${cap.monomer}): ${name} at position ${position} has no attachment ${attachment} for it to bond to. A residue with a reduced or ring-closed end has nowhere to put one.`
        );
      }
    }
    for (let position = 1; position <= length; position += 1) {
      const name = monomerAt(chain.sequence, chain.declared, position);
      if (name === null) continue;
      const found = monomer(name);
      if (found === void 0) continue;
      if (position > 1 && !found.attachments.has(1)) {
        problems.add(
          `${where}: chain ${JSON.stringify(chain.chainId)} has ${name} at position ${position}, which has no N-terminal attachment, so nothing can precede it. It can only be the first residue.`
        );
      }
      if (position < length && !found.attachments.has(2)) {
        problems.add(
          `${where}: chain ${JSON.stringify(chain.chainId)} has ${name} at position ${position}, which has no C-terminal attachment, so nothing can follow it. It can only be the last residue.`
        );
      }
    }
  }
}
function resolveAttachmentEnd(problems, chains, byId, claim, end, label, by) {
  if (!isPlainObject(end)) return null;
  const chainId = typeof end["chain_id"] === "string" ? end["chain_id"] : chains.length === 1 ? chains[0].chainId : null;
  if (chainId === null) return null;
  const chain = byId.get(chainId);
  const position = end["position"];
  const attachment = end["attachment"];
  if (chain === void 0 || typeof position !== "number" || !Number.isInteger(position) || position < 1 || position > chain.sequence.length || attachment !== 1 && attachment !== 2 && attachment !== 3) {
    return null;
  }
  const copyRaw = end["copy"];
  let copy = 1;
  if (chain.copies > 1) {
    if (typeof copyRaw !== "number" || !Number.isInteger(copyRaw)) {
      problems.add(
        `${label}: chain ${JSON.stringify(chainId)} has ${chain.copies} copies, so this end must say which one. Add copy, a number from 1 to ${chain.copies}.`
      );
      return null;
    }
    if (copyRaw < 1 || copyRaw > chain.copies) {
      problems.add(
        `${label}: copy ${copyRaw} is outside the ${chain.copies} copies of chain ${JSON.stringify(chainId)}`
      );
      return null;
    }
    copy = copyRaw;
  } else if (copyRaw !== void 0 && copyRaw !== 1) {
    problems.add(
      `${label}: chain ${JSON.stringify(chainId)} has one copy, so copy ${String(copyRaw)} names nothing`
    );
    return null;
  }
  const name = monomerAt(chain.sequence, chain.declared, position);
  if (name === null) {
    problems.add(
      `${label}: position ${position} of chain ${JSON.stringify(chainId)} is ${JSON.stringify(chain.sequence[position - 1])}, which names no monomer, so there is no atom here to bond to`
    );
    return null;
  }
  const element = attachmentElement(name, attachment);
  if (element === void 0) {
    problems.add(
      `${label}: ${name} at position ${position} has no attachment ${attachment}. It offers ${[...monomer(name)?.attachments.keys() ?? []].sort().join(", ")}. A bond left on a residue without that attachment is refused, because substituting a bridged residue for one without a side chain would break the bond without deleting anything.`
    );
    return null;
  }
  claim(chainId, copy, position, attachment, by);
  return { element, attachment };
}
function checkBondChemistry(problems, at, kind, resolvedEnds) {
  if (!joinable(resolvedEnds[0].element, resolvedEnds[1].element)) {
    problems.add(
      `${at}: ${resolvedEnds[0].element} to ${resolvedEnds[1].element} is not a bond this schema can mean. An amide takes an amine and a carboxyl, a disulfide two thiols.`
    );
    return;
  }
  const required = BOND_CHEMISTRY[kind];
  if (required === void 0) return;
  const got = resolvedEnds.map((end) => end.element).sort();
  const want = [...required.elements].sort();
  if (got.join() !== want.join()) {
    problems.add(
      `${at}: a ${kind} bond joins ${required.what} (${want.join(" and ")}), but these ends are ${got.join(" and ")}. The kind is checked against the atoms the ends sit on, because two residues that merely have side chains would otherwise form a bond of a different kind.`
    );
  }
  if (kind === "backbone") {
    const points = resolvedEnds.map((end) => end.attachment).sort();
    if (points.join() !== "1,2") {
      problems.add(
        `${at}: a backbone bond joins a C-terminal attachment to an N-terminal one (2 to 1), and these are ${points.join(" and ")}. A bond between two side chains is an amide or a thioester.`
      );
    }
  }
}
function checkConjugateLinks(problems, at, anchor, units) {
  let previous = anchor === null ? null : { element: anchor.element, label: "the anchor" };
  units.forEach((unit, unitIndex) => {
    if (!isPlainObject(unit) || typeof unit["monomer"] !== "string") {
      previous = null;
      return;
    }
    const name = unit["monomer"];
    const inElement = attachmentElement(name, Number(unit["in"]));
    if (inElement !== void 0 && previous !== null && !joinable(previous.element, inElement)) {
      problems.add(
        `${at}.units[${unitIndex}]: ${name} joins ${previous.label} through ${inElement}, but ${previous.label} offers ${previous.element}. ${previous.element} to ${inElement} is not a bond this schema can mean -- an amide takes an amine and a carboxyl. Check in and out.`
      );
    }
    const outElement = unit["out"] === void 0 ? void 0 : attachmentElement(name, Number(unit["out"]));
    previous = outElement === void 0 ? null : { element: outElement, label: name };
  });
}
function validateAttachments(problems, chains, bonds, conjugates, where) {
  const ledger = /* @__PURE__ */ new Map();
  const key = (chainId, copy, position, attachment) => `${chainId}|${copy}|${position}|${attachment}`;
  const claim = (chainId, copy, position, attachment, by) => {
    const at = key(chainId, copy, position, attachment);
    const existing = ledger.get(at);
    if (existing !== void 0) {
      problems.add(
        `${where}: ${by} and ${existing} both bond to attachment ${attachment} of residue ${position} in chain ${JSON.stringify(chainId)}. An atom carries one bond.`
      );
      return;
    }
    ledger.set(at, by);
  };
  claimChainAtoms(problems, chains, bonds, conjugates, where, claim);
  const byId = new Map(chains.map((chain) => [chain.chainId, chain]));
  const resolveEnd = (end, label, by) => resolveAttachmentEnd(problems, chains, byId, claim, end, label, by);
  bonds.forEach((bond, index) => {
    const at = `${where}.chemistry.bonds[${index}]`;
    const id = typeof bond["bond_id"] === "string" ? bond["bond_id"] : `bonds[${index}]`;
    const resolvedEnds = [];
    for (const side of ["a", "b"]) {
      const resolved = resolveEnd(bond[side], `${at}.${side}`, `bond ${JSON.stringify(id)}`);
      if (resolved !== null) resolvedEnds.push(resolved);
    }
    const kind = bond["kind"];
    if (typeof kind !== "string" || resolvedEnds.length !== 2) return;
    checkBondChemistry(problems, at, kind, resolvedEnds);
  });
  conjugates.forEach((conjugate, index) => {
    const at = `${where}.chemistry.conjugates[${index}]`;
    const id = typeof conjugate["conjugate_id"] === "string" ? conjugate["conjugate_id"] : `conjugates[${index}]`;
    const anchor = resolveEnd(conjugate["anchor"], `${at}.anchor`, `conjugate ${JSON.stringify(id)}`);
    const units = Array.isArray(conjugate["units"]) ? conjugate["units"] : [];
    checkConjugateLinks(problems, at, anchor, units);
  });
}
function validateSequence(problems, raw, where) {
  if (typeof raw !== "string" || raw.length === 0) {
    problems.add(`${where}: sequence must be a non-empty string`);
    return;
  }
  const invalid = [...new Set([...raw].filter((c) => !AMINO_ACIDS.has(c)))];
  if (invalid.length > 0) {
    problems.add(
      `${where}: sequence contains characters that are not uppercase amino-acid letters: ${invalid.map((c) => JSON.stringify(c)).join(", ")}`
    );
  }
}
function validateFeatures(problems, variant, where, chainLengths, regionIds, placed) {
  const raw = variant["features"];
  if (!Array.isArray(raw)) {
    problems.add(`${where}: features must be a list`);
    return;
  }
  const instanceIds = /* @__PURE__ */ new Set();
  raw.forEach((entry, index) => {
    const featureWhere = `${where}.features[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${featureWhere} must be an object`);
      return;
    }
    const hasInstance = requireId(problems, entry, "instance_id", featureWhere);
    if (requireId(problems, entry, "region_id", featureWhere)) {
      const regionId = entry["region_id"];
      if (!regionIds.has(regionId)) {
        problems.add(
          `${featureWhere}: region_id ${JSON.stringify(regionId)} is not defined in regions`
        );
      }
      placed.add(regionId);
    }
    const chain = resolveChainId(chainLengths, entry["chain_id"], "this construct");
    if (chain.problem !== void 0) problems.add(`${featureWhere}: ${chain.problem}`);
    const length = chain.value ?? 0;
    const start = entry["start"];
    const end = entry["end"];
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      problems.add(`${featureWhere}: start and end must be integers`);
    } else if (length > 0 && !(1 <= start && start <= end && end <= length)) {
      problems.add(
        `${featureWhere}: coordinates must satisfy 1 <= start <= end <= ${length}` + (chainLengths.size > 1 ? ` for chain ${JSON.stringify(entry["chain_id"])}` : "") + `; got ${start}-${end}`
      );
    }
    const evidence = entry["evidence"];
    if (evidence !== void 0 && !EVIDENCE_VALUES.includes(evidence)) {
      problems.add(
        `${featureWhere}: evidence must be one of ${EVIDENCE_VALUES.join(", ")}; got ${JSON.stringify(evidence)}`
      );
    }
    if (entry["label"] !== void 0) requireText(problems, entry, "label", featureWhere);
    if (hasInstance) {
      const id = entry["instance_id"];
      if (instanceIds.has(id)) {
        problems.add(`${featureWhere}: duplicate instance_id ${JSON.stringify(id)} within variant`);
      }
      instanceIds.add(id);
    }
  });
}
function validateEdits(problems, raw, where) {
  if (!Array.isArray(raw)) {
    problems.add(`${where}: edits must be a list`);
    return;
  }
  raw.forEach((entry, index) => {
    const editWhere = `${where}.edits[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${editWhere} must be an object`);
      return;
    }
    const op = entry["op"];
    const positiveInt = (key) => {
      const value = entry[key];
      if (!Number.isInteger(value) || value < 1) {
        problems.add(`${editWhere}: ${key} must be an integer >= 1; got ${JSON.stringify(value)}`);
      }
    };
    const span2 = () => {
      positiveInt("start");
      positiveInt("end");
      const start = entry["start"];
      const end = entry["end"];
      if (Number.isInteger(start) && Number.isInteger(end) && start > end) {
        problems.add(`${editWhere}: start must not exceed end; got ${start}-${end}`);
      }
    };
    const residues = (key) => {
      if (!requireText(problems, entry, key, editWhere)) return;
      const value = entry[key];
      const invalid = [...new Set([...value].filter((c) => !AMINO_ACIDS.has(c)))];
      if (invalid.length > 0) {
        problems.add(
          `${editWhere}: ${key} contains non-amino-acid characters: ${invalid.map((c) => JSON.stringify(c)).join(", ")}`
        );
      }
    };
    switch (op) {
      case "insert":
        positiveInt("at");
        residues("sequence");
        break;
      case "delete":
        span2();
        break;
      case "replace":
        span2();
        residues("sequence");
        break;
      case "substitute": {
        positiveInt("position");
        let wellFormed = true;
        for (const key of ["from", "to"]) {
          if (requireText(problems, entry, key, editWhere)) {
            const value = entry[key];
            if (value.length !== 1 || !AMINO_ACIDS.has(value)) {
              problems.add(
                `${editWhere}: ${key} must be a single amino-acid letter; got ${JSON.stringify(value)}`
              );
              wellFormed = false;
            }
          } else {
            wellFormed = false;
          }
        }
        if (wellFormed && entry["from"] === entry["to"]) {
          problems.add(
            `${editWhere}: from and to are both ${JSON.stringify(entry["from"])}, so this substitution changes no residue. If the chemistry changed -- a D-residue, an N-methylation -- declare it in the chain's chemistry; an edit cannot say it.`
          );
        }
        break;
      }
      default:
        problems.add(
          `${editWhere}: op must be insert, delete, replace or substitute; got ${JSON.stringify(op)}`
        );
    }
  });
}
function validateAttemptedAnalyses(problems, raw, variantIds, donorIds) {
  if (raw === void 0) return;
  if (!Array.isArray(raw)) {
    problems.add("attempted_analyses must be a list when present");
    return;
  }
  raw.forEach((entry, index) => {
    const where = `attempted_analyses[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    if (entry["kind"] !== "conservation") {
      problems.add(`${where}: kind must be "conservation"; got ${JSON.stringify(entry["kind"])}`);
    }
    const attemptKind = entry["target_kind"] === void 0 ? "variant" : entry["target_kind"];
    if (attemptKind !== "variant" && attemptKind !== "donor") {
      problems.add(
        `${where}: target_kind must be "variant" or "donor"; got ${JSON.stringify(attemptKind)}`
      );
    }
    requireText(problems, entry, "reason", where);
    if (entry["attempted"] !== void 0) requireText(problems, entry, "attempted", where);
    if (requireText(problems, entry, "target", where)) {
      const target = entry["target"];
      const stated = entry["target_kind"];
      const known = stated === "donor" ? donorIds.has(target) : stated === "variant" ? variantIds.has(target) : variantIds.has(target) || donorIds.has(target);
      if (!known) {
        const wanted = stated === "donor" ? "a donor_id" : stated === "variant" ? "a variant_id" : "neither a variant_id nor a donor_id";
        problems.add(
          stated === void 0 ? `${where}: target ${JSON.stringify(target)} is ${wanted}. An attempt has to name what it was attempted on.` : `${where}: target ${JSON.stringify(target)} is not ${wanted} of this record, which target_kind ${JSON.stringify(stated)} requires.`
        );
      }
    }
  });
}
function validateHypotheses(problems, raw) {
  const ids = /* @__PURE__ */ new Set();
  if (raw === void 0) return ids;
  if (!Array.isArray(raw)) {
    problems.add("hypotheses must be a list when present");
    return ids;
  }
  const questions = /* @__PURE__ */ new Set();
  raw.forEach((entry, index) => {
    const where = `hypotheses[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    if (requireId(problems, entry, "hypothesis_id", where)) {
      const id = entry["hypothesis_id"];
      if (ids.has(id)) problems.add(`${where}: duplicate hypothesis_id ${JSON.stringify(id)}`);
      ids.add(id);
    }
    for (const key of ["question", "mechanism", "measurement"]) {
      requireText(problems, entry, key, where);
    }
    if (entry["note"] !== void 0) requireText(problems, entry, "note", where);
    const question = entry["question"];
    if (typeof question === "string") {
      const key = question.trim().toLowerCase();
      if (questions.has(key)) {
        problems.add(
          `${where}: question duplicates another hypothesis. Mechanistically distinct hypotheses must ask different questions, or they are one hypothesis.`
        );
      }
      questions.add(key);
    }
  });
  return ids;
}
function validateRationale(problems, raw, where, sourceIds) {
  if (!isPlainObject(raw)) {
    problems.add(`${where}: rationale must be an object`);
    return;
  }
  for (const key of ["hypothesis", "comparison", "uncertainty"]) {
    requireText(problems, raw, key, `${where}.rationale`);
  }
  if (raw["edit"] !== void 0) requireText(problems, raw, "edit", `${where}.rationale`);
  if (raw["inference"] !== void 0) {
    requireText(problems, raw, "inference", `${where}.rationale`);
  }
  const observations = raw["observations"];
  if (!Array.isArray(observations)) {
    problems.add(
      `${where}.rationale: observations must be a list, which may be empty for an exploratory proposal`
    );
    return;
  }
  observations.forEach((observation, index) => {
    validateObservationEntry(
      problems,
      observation,
      `${where}.rationale.observations[${index}]`,
      sourceIds
    );
  });
}
function validateObservationEntry(problems, observation, obsWhere, sourceIds) {
  if (!isPlainObject(observation)) {
    problems.add(`${obsWhere} must be an object`);
    return;
  }
  for (const key of ["finding", "locator", "context"]) {
    requireText(problems, observation, key, obsWhere);
  }
  if (observation["quote"] !== void 0) {
    requireText(problems, observation, "quote", obsWhere);
  }
  if (requireText(problems, observation, "source_id", obsWhere)) {
    const sourceId = observation["source_id"];
    if (!sourceIds.has(sourceId)) {
      problems.add(`${obsWhere}: source_id ${JSON.stringify(sourceId)} is not defined in sources`);
    }
  }
}
var SITE_ROLES = [
  "interaction",
  "structural",
  "catalytic",
  "modification",
  "stability",
  "other"
];
var TRACK_KINDS = ["conservation", "disorder", "hydrophobicity", "charge", "other"];
function validateResidueClaim(problems, residue, residueWhere, chains) {
  if (!isPlainObject(residue)) {
    problems.add(`${residueWhere} must be an object`);
    return;
  }
  const position = residue["position"];
  if (!Number.isInteger(position) || position < 1) {
    problems.add(`${residueWhere}: position must be an integer >= 1`);
    return;
  }
  if (chains === void 0) return;
  const claimed = resolveChainId(chains, residue["chain_id"], "this construct");
  if (claimed.problem !== void 0) {
    problems.add(`${residueWhere}: ${claimed.problem}`);
    return;
  }
  const sequence = claimed.value;
  if (position > sequence.length) {
    problems.add(
      `${residueWhere}: position ${position} is past the end of ` + (chains.size > 1 ? `chain ${JSON.stringify(residue["chain_id"])} ` : "") + `(${sequence.length} residues)`
    );
    return;
  }
  const expected = residue["expected"];
  const actual = sequence[position - 1];
  const frame = residue["source_frame"];
  const targetResidue = residue["target_residue"];
  const sourcePosition = residue["source_position"];
  if (frame !== void 0) {
    if (typeof frame !== "string" || frame.trim() === "") {
      problems.add(`${residueWhere}: source_frame must name the numbering it refers to`);
    }
    if (targetResidue === void 0) {
      problems.add(
        `${residueWhere}: a transferred claim must state target_residue, the letter at position ${position} in this construct. Without it the transfer asserts a position nothing checks.`
      );
    } else if (typeof targetResidue !== "string" || targetResidue.length !== 1 || !AMINO_ACIDS.has(targetResidue)) {
      problems.add(`${residueWhere}: target_residue must be a single residue letter`);
    } else if (targetResidue !== actual) {
      problems.add(
        `${residueWhere}: target_residue says ${targetResidue}${position}, but position ${position} is ${actual}. Whatever the source reported elsewhere, this annotation would mark the wrong residue here.`
      );
    }
    if (sourcePosition !== void 0 && (!Number.isInteger(sourcePosition) || sourcePosition < 1)) {
      problems.add(`${residueWhere}: source_position must be a positive integer`);
    }
    if (expected !== void 0 && (typeof expected !== "string" || expected.length !== 1 || !AMINO_ACIDS.has(expected))) {
      problems.add(`${residueWhere}: expected must be a single residue letter`);
    }
    return;
  }
  for (const [key, value] of [
    ["target_residue", targetResidue],
    ["source_position", sourcePosition]
  ]) {
    if (value !== void 0) {
      problems.add(
        `${residueWhere}: ${key} is only meaningful with source_frame, which names the numbering the source used. Without it, expected is compared against this construct directly.`
      );
    }
  }
  if (expected === void 0) return;
  if (typeof expected !== "string" || expected.length !== 1) {
    problems.add(`${residueWhere}: expected must be a single residue letter`);
    return;
  }
  if (actual !== expected) {
    problems.add(
      `${residueWhere}: the source states ${expected}${position}, but position ${position} is ${actual}. The numbering frames do not agree, so this annotation would mark the wrong residue.`
    );
  }
}
function validateSiteObservations(problems, entry, where, sourceIds) {
  const evidence = entry["evidence"];
  const observations = entry["observations"];
  const claimsMeasurement = evidence === "measured" || evidence === "established_elsewhere";
  const hasObservations = Array.isArray(observations) && observations.length > 0;
  if (claimsMeasurement && !hasObservations) {
    problems.add(
      `${where}: evidence ${JSON.stringify(evidence)} asserts a measurement, so at least one observation naming its source is required. Use "predicted" or "unknown" for an annotation that no source supports.`
    );
  }
  if (observations !== void 0) {
    if (!Array.isArray(observations)) {
      problems.add(`${where}: observations must be a list`);
    } else {
      observations.forEach((observation, obsIndex) => {
        validateObservationEntry(
          problems,
          observation,
          `${where}.observations[${obsIndex}]`,
          sourceIds
        );
      });
    }
  }
}
function validateSites(problems, raw, chainsByVariant, sourceIds) {
  if (raw === void 0) return;
  if (!Array.isArray(raw)) {
    problems.add("sites must be a list");
    return;
  }
  const ids = /* @__PURE__ */ new Set();
  raw.forEach((entry, index) => {
    const where = `sites[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    if (requireId(problems, entry, "site_id", where)) {
      const id = entry["site_id"];
      if (ids.has(id)) problems.add(`${where}: duplicate site_id ${JSON.stringify(id)}`);
      ids.add(id);
    }
    requireText(problems, entry, "label", where);
    const role = entry["role"];
    if (typeof role !== "string" || !SITE_ROLES.includes(role)) {
      problems.add(`${where}: role must be one of ${SITE_ROLES.join(", ")}`);
    }
    const evidence = entry["evidence"];
    if (evidence !== void 0 && !EVIDENCE_VALUES.includes(evidence)) {
      problems.add(`${where}: unrecognized evidence status ${JSON.stringify(evidence)}`);
    }
    let chains;
    if (requireText(problems, entry, "applies_to", where)) {
      const target = entry["applies_to"];
      chains = chainsByVariant.get(target);
      if (chains === void 0) {
        problems.add(`${where}: applies_to ${JSON.stringify(target)} is not a known variant_id`);
      }
    }
    const residues = entry["residues"];
    if (!Array.isArray(residues) || residues.length === 0) {
      problems.add(`${where}: residues must be a non-empty list`);
    } else {
      residues.forEach(
        (residue, residueIndex) => validateResidueClaim(problems, residue, `${where}.residues[${residueIndex}]`, chains)
      );
    }
    validateSiteObservations(problems, entry, where, sourceIds);
  });
}
function validatePrecedentSearch(problems, raw, sourceIds) {
  if (raw === void 0) return;
  if (!isPlainObject(raw)) {
    problems.add("precedent_search must be an object");
    return;
  }
  requireText(problems, raw, "scope", "precedent_search");
  if (typeof raw["completed"] !== "boolean") {
    problems.add(
      "precedent_search: completed must be true or false. An omitted value cannot say whether the designs were chosen with the answer in hand, which is the only thing this record exists to state."
    );
  }
  if (raw["completed"] === false) {
    if (requireText(problems, raw, "reason", "precedent_search")) {
      const reason = raw["reason"].trim();
      if (/^(not|none|n\/?a|unknown|incomplete)\.?$/i.test(reason)) {
        problems.add(
          `precedent_search: reason ${JSON.stringify(reason)} is not specific enough to check. Name what stopped it.`
        );
      }
    }
  }
  const found = raw["found"];
  if (found !== void 0) {
    if (!Array.isArray(found)) {
      problems.add("precedent_search: found must be a list of source_ids");
    } else {
      found.forEach((id, index) => {
        if (typeof id !== "string" || !sourceIds.has(id)) {
          problems.add(
            `precedent_search.found[${index}]: ${JSON.stringify(id)} is not a declared source_id`
          );
        }
      });
    }
  }
}
function validateSeriesScheme(problems, entry, where) {
  const scheme = entry["scheme"];
  if (scheme !== "substitution" && scheme !== "deletion") {
    problems.add(`${where}: scheme must be "substitution" or "deletion"`);
  }
  const to = entry["to"];
  if (scheme === "substitution") {
    if (typeof to !== "string" || to.length !== 1 || !AMINO_ACIDS.has(to)) {
      problems.add(`${where}: a substitution series must declare "to" as one residue letter`);
    }
  } else if (to !== void 0) {
    problems.add(`${where}: "to" is meaningless for a deletion series`);
  }
}
function seriesParentSequence(problems, entry, where, chainsByVariant) {
  let parentSequence;
  if (requireText(problems, entry, "parent_id", where)) {
    const parentId = entry["parent_id"];
    const chains = chainsByVariant.get(parentId);
    if (chains === void 0) {
      problems.add(`${where}: parent_id ${JSON.stringify(parentId)} is not a known variant_id`);
    } else {
      const declaredChain = entry["chain_id"];
      if (chains.size > 1) {
        if (typeof declaredChain !== "string") {
          problems.add(
            `${where}: ${JSON.stringify(parentId)} has ${chains.size} chains, so the series must name the chain its positions are in`
          );
        } else if (!chains.has(declaredChain)) {
          problems.add(
            `${where}: chain_id ${JSON.stringify(declaredChain)} is not a chain of ${JSON.stringify(parentId)}`
          );
        } else {
          parentSequence = chains.get(declaredChain);
        }
      } else if (declaredChain !== void 0 && !chains.has(declaredChain)) {
        problems.add(
          `${where}: chain_id ${JSON.stringify(declaredChain)} is not a chain of ${JSON.stringify(parentId)}`
        );
      } else {
        parentSequence = [...chains.values()][0];
      }
    }
  }
  return parentSequence;
}
function validateSeriesTargets(problems, entry, where, parentSequence) {
  const targets = entry["target_positions"];
  if (!Array.isArray(targets) || targets.length === 0) {
    problems.add(`${where}: target_positions must be a non-empty list of positions`);
    return void 0;
  }
  const targetSet = /* @__PURE__ */ new Set();
  for (const position of targets) {
    if (!Number.isInteger(position) || position < 1) {
      problems.add(`${where}: target_positions must be positive integers`);
      continue;
    }
    if (targetSet.has(position)) {
      problems.add(`${where}: target_positions repeats ${position}`);
    }
    targetSet.add(position);
    if (parentSequence !== void 0 && position > parentSequence.length) {
      problems.add(
        `${where}: position ${position} is outside the parent (${parentSequence.length} residues)`
      );
    }
  }
  return targetSet;
}
function validateSeriesOmissions(problems, entry, where, targetSet) {
  const omitted = entry["omitted"];
  const omittedSet = /* @__PURE__ */ new Set();
  if (omitted !== void 0) {
    if (!Array.isArray(omitted)) {
      problems.add(`${where}: omitted must be a list`);
    } else {
      omitted.forEach((item, omitIndex) => {
        const omitWhere = `${where}.omitted[${omitIndex}]`;
        if (!isPlainObject(item)) {
          problems.add(`${omitWhere} must be an object`);
          return;
        }
        const position = item["position"];
        if (!Number.isInteger(position)) {
          problems.add(`${omitWhere}: position must be an integer`);
        } else if (!targetSet.has(position)) {
          problems.add(
            `${omitWhere}: position ${position} is not in target_positions, so omitting it describes no gap in this series`
          );
        } else if (omittedSet.has(position)) {
          problems.add(`${omitWhere}: position ${position} is omitted twice`);
        } else {
          omittedSet.add(position);
        }
        requireText(problems, item, "reason", omitWhere);
        const outcome = item["outcome"];
        if (outcome !== "not_made" && outcome !== "made_unusable") {
          problems.add(
            `${omitWhere}: outcome must be "not_made" or "made_unusable". A position never attempted and one that was made and could not be used are different results.`
          );
        }
      });
    }
  }
  return omittedSet;
}
function validateSeriesMembers(problems, entry, where, variants, parentSequence, targetSet, omittedSet) {
  const scheme = entry["scheme"];
  const to = entry["to"];
  const included = [...targetSet].filter((position) => !omittedSet.has(position)).sort((a, b) => a - b);
  if (included.length === 0) {
    problems.add(`${where}: every intended position is omitted, so this series has no members`);
    return;
  }
  const seriesId = entry["series_id"];
  const members = variants.filter((variant) => variant["series_id"] === seriesId);
  const covered = /* @__PURE__ */ new Map();
  for (const member of members) {
    const memberId = JSON.stringify(member["variant_id"]);
    if (member["parent_id"] !== entry["parent_id"]) {
      problems.add(
        `${where}: member ${memberId} declares a different parent, so it does not perturb the sequence this series is a series of`
      );
    }
    if (member["hypothesis_id"] !== entry["hypothesis_id"]) {
      problems.add(`${where}: member ${memberId} names a different hypothesis`);
    }
    const edits = member["edits"];
    if (!Array.isArray(edits) || edits.length !== 1) {
      problems.add(
        `${where}: member ${memberId} must declare exactly one edit. Each member carries one perturbation independently; applying the whole list at once is a different molecule.`
      );
      continue;
    }
    const edit = edits[0];
    if (!isPlainObject(edit)) continue;
    let position;
    if (scheme === "substitution") {
      if (edit["op"] !== "substitute") {
        problems.add(`${where}: member ${memberId} is not a substitution`);
        continue;
      }
      position = edit["position"];
      if (edit["to"] !== to) {
        problems.add(
          `${where}: member ${memberId} substitutes to ${JSON.stringify(edit["to"])}, but the series is a scan to ${JSON.stringify(to)}`
        );
      }
    } else {
      if (edit["op"] !== "delete" || edit["start"] !== edit["end"]) {
        problems.add(`${where}: member ${memberId} is not a single-position deletion`);
        continue;
      }
      position = edit["start"];
    }
    if (!Number.isInteger(position)) continue;
    covered.set(position, (covered.get(position) ?? 0) + 1);
  }
  for (const position of included) {
    const count = covered.get(position) ?? 0;
    if (count === 0) {
      problems.add(
        `${where}: position ${position} is in the intended coverage with no member and no omission. Either make it, or record why it is not there.`
      );
    } else if (count > 1) {
      problems.add(`${where}: position ${position} has ${count} members`);
    }
  }
  for (const position of covered.keys()) {
    if (!included.includes(position)) {
      problems.add(
        `${where}: a member perturbs position ${position}, which is outside the declared coverage` + (omittedSet.has(position) ? " and is recorded as omitted" : "")
      );
    }
  }
  if (scheme === "substitution" && parentSequence !== void 0 && typeof to === "string") {
    for (const position of included) {
      if (parentSequence[position - 1] === to) {
        problems.add(
          `${where}: position ${position} is already ${to} in the parent, so that member is the parent`
        );
      }
    }
  }
}
function validateSeries(problems, raw, variantsRaw, chainsByVariant, hypothesisIds) {
  if (raw === void 0) return;
  if (!Array.isArray(raw)) {
    problems.add("series must be a list when present");
    return;
  }
  const variants = Array.isArray(variantsRaw) ? variantsRaw.filter(isPlainObject) : [];
  const ids = /* @__PURE__ */ new Set();
  const byHypothesis = /* @__PURE__ */ new Map();
  raw.forEach((entry, index) => {
    const where = `series[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    if (requireId(problems, entry, "series_id", where)) {
      const id = entry["series_id"];
      if (ids.has(id)) problems.add(`${where}: duplicate series_id ${JSON.stringify(id)}`);
      ids.add(id);
    }
    requireText(problems, entry, "coverage", where);
    if (requireText(problems, entry, "hypothesis_id", where)) {
      const hypothesisId = entry["hypothesis_id"];
      if (hypothesisIds.size > 0 && !hypothesisIds.has(hypothesisId)) {
        problems.add(
          `${where}: hypothesis_id ${JSON.stringify(hypothesisId)} is not a declared hypothesis_id`
        );
      }
      const seen = byHypothesis.get(hypothesisId) ?? 0;
      if (seen > 0) {
        problems.add(
          `${where}: hypothesis ${JSON.stringify(hypothesisId)} already has a series. One proposed change or one prespecified series per hypothesis, with the controls needed to interpret it.`
        );
      }
      byHypothesis.set(hypothesisId, seen + 1);
    }
    validateSeriesScheme(problems, entry, where);
    const parentSequence = seriesParentSequence(problems, entry, where, chainsByVariant);
    const targetSet = validateSeriesTargets(problems, entry, where, parentSequence);
    if (targetSet === void 0) return;
    const omittedSet = validateSeriesOmissions(problems, entry, where, targetSet);
    validateSeriesMembers(problems, entry, where, variants, parentSequence, targetSet, omittedSet);
  });
}
function trackTargetSequence(problems, entry, where, chainsByVariant, donorSequences) {
  let sequence;
  const targetKind = entry["target_kind"] === void 0 ? "variant" : entry["target_kind"];
  if (targetKind !== "variant" && targetKind !== "donor") {
    problems.add(
      `${where}: target_kind must be "variant" or "donor"; got ${JSON.stringify(targetKind)}`
    );
  }
  if (targetKind === "donor") {
    if (requireText(problems, entry, "applies_to", where)) {
      const donorId = entry["applies_to"];
      const donorSequence = donorSequences.get(donorId);
      if (donorSequence === void 0) {
        problems.add(
          `${where}: target_kind is "donor", so applies_to ${JSON.stringify(donorId)} must be a known donor_id`
        );
      } else {
        sequence = donorSequence;
      }
    }
    if (entry["chain_id"] !== void 0) {
      problems.add(
        `${where}: a donor-targeted track must not name a chain_id. Its values are in the donor's coordinates, not any chain of the assembled construct.`
      );
    }
  } else if (requireText(problems, entry, "applies_to", where)) {
    const target = entry["applies_to"];
    const chains = chainsByVariant.get(target);
    if (chains === void 0) {
      problems.add(`${where}: applies_to ${JSON.stringify(target)} is not a known variant_id`);
    } else {
      const chain = resolveChainId(chains, entry["chain_id"], JSON.stringify(target));
      if (chain.problem !== void 0) problems.add(`${where}: ${chain.problem}`);
      sequence = chain.value;
    }
  }
  return sequence;
}
function validateTrackScale(problems, entry, where) {
  const scale = entry["scale"];
  let bounds = null;
  if (!isPlainObject(scale)) {
    problems.add(`${where}: scale must be an object with min, max and higher_means`);
  } else {
    let ok = true;
    for (const key of ["min", "max"]) {
      const value = scale[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        problems.add(`${where}.scale: ${key} must be a finite number`);
        ok = false;
      }
    }
    if (ok) {
      const min = scale["min"];
      const max = scale["max"];
      if (min >= max) problems.add(`${where}.scale: min must be less than max`);
      else bounds = { min, max };
    }
    requireText(problems, scale, "higher_means", `${where}.scale`);
  }
  return bounds;
}
function validateTrackMethod(problems, entry, where) {
  const method = entry["method"];
  if (!isPlainObject(method) || Object.keys(method).length === 0) {
    problems.add(
      `${where}: method must describe where the values came from; a track without provenance cannot be interpreted`
    );
  } else {
    for (const [key, value] of Object.entries(method)) {
      if (typeof value !== "string" && typeof value !== "number") {
        problems.add(`${where}.method.${key} must be a string or a number`);
      }
      if (typeof value === "string" && value.trim() === "") {
        problems.add(`${where}.method.${key} must not be blank`);
      }
    }
  }
}
function validateTrackValues(problems, entry, where, sequence, bounds) {
  const values = entry["values"];
  if (!Array.isArray(values)) {
    problems.add(`${where}: values must be a list`);
    return;
  }
  if (sequence !== void 0 && values.length !== sequence.length) {
    problems.add(
      `${where}: values has ${values.length} entries but ${JSON.stringify(entry["applies_to"])} has ${sequence.length} residues`
    );
  }
  values.forEach((value, valueIndex) => {
    if (value === null) return;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      problems.add(
        `${where}.values[${valueIndex}] must be a number or null; null means unavailable and is rendered as unavailable rather than as zero`
      );
      return;
    }
    if (bounds !== null && (value < bounds.min || value > bounds.max)) {
      problems.add(
        `${where}.values[${valueIndex}] is ${value}, outside the declared scale ${bounds.min}-${bounds.max}`
      );
    }
  });
  const coverage = entry["coverage"];
  if (coverage !== void 0) {
    if (!Array.isArray(coverage)) problems.add(`${where}: coverage must be a list`);
    else if (coverage.length !== values.length) {
      problems.add(`${where}: coverage must have the same length as values`);
    } else {
      coverage.forEach((value, coverageIndex) => {
        if (value === null) return;
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
          problems.add(
            `${where}.coverage[${coverageIndex}] must be a non-negative number or null`
          );
        }
      });
    }
  }
}
function validateTracks(problems, raw, chainsByVariant, donorSequences) {
  if (raw === void 0) return;
  if (!Array.isArray(raw)) {
    problems.add("tracks must be a list");
    return;
  }
  const ids = /* @__PURE__ */ new Set();
  raw.forEach((entry, index) => {
    const where = `tracks[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    if (requireId(problems, entry, "track_id", where)) {
      const id = entry["track_id"];
      if (ids.has(id)) problems.add(`${where}: duplicate track_id ${JSON.stringify(id)}`);
      ids.add(id);
    }
    requireText(problems, entry, "label", where);
    const kind = entry["kind"];
    if (typeof kind !== "string" || !TRACK_KINDS.includes(kind)) {
      problems.add(`${where}: kind must be one of ${TRACK_KINDS.join(", ")}`);
    }
    const sequence = trackTargetSequence(problems, entry, where, chainsByVariant, donorSequences);
    const bounds = validateTrackScale(problems, entry, where);
    validateTrackMethod(problems, entry, where);
    validateTrackValues(problems, entry, where, sequence, bounds);
  });
}
function validateDonors(problems, raw, sourceIds) {
  const sequences = /* @__PURE__ */ new Map();
  if (raw === void 0) return sequences;
  if (!Array.isArray(raw)) {
    problems.add("donors must be a list");
    return sequences;
  }
  raw.forEach((entry, index) => {
    const where = `donors[${index}]`;
    if (!isPlainObject(entry)) {
      problems.add(`${where} must be an object`);
      return;
    }
    const hasId = requireId(problems, entry, "donor_id", where);
    requireText(problems, entry, "name", where);
    const sequence = entry["sequence"];
    let ok = true;
    if (typeof sequence !== "string" || sequence.length === 0) {
      problems.add(`${where}: sequence must be a non-empty string`);
      ok = false;
    } else {
      const invalid = [...new Set([...sequence].filter((c) => !AMINO_ACIDS.has(c)))];
      if (invalid.length > 0) {
        problems.add(
          `${where}: sequence contains non-amino-acid characters: ${invalid.map((c) => JSON.stringify(c)).join(", ")}`
        );
        ok = false;
      }
    }
    const accession = entry["accession"];
    if (accession !== void 0) {
      if (!isPlainObject(accession)) problems.add(`${where}.accession must be an object`);
      else {
        requireText(problems, accession, "database", `${where}.accession`);
        requireText(problems, accession, "accession", `${where}.accession`);
      }
    }
    const sourceRefs = entry["source_ids"];
    if (sourceRefs !== void 0) {
      if (!Array.isArray(sourceRefs)) problems.add(`${where}: source_ids must be a list`);
      else {
        for (const id of sourceRefs) {
          if (typeof id !== "string" || !sourceIds.has(id)) {
            problems.add(`${where}: source_ids references unknown source ${JSON.stringify(id)}`);
          }
        }
      }
    }
    if (hasId && ok) {
      const id = entry["donor_id"];
      if (sequences.has(id)) problems.add(`${where}: duplicate donor_id ${JSON.stringify(id)}`);
      sequences.set(id, sequence);
    }
  });
  return sequences;
}
function validateAssemblies(problems, variantsRaw, donors) {
  variantsRaw.forEach((entry, index) => {
    if (!isPlainObject(entry)) return;
    const chains = entry["chains"];
    if (Array.isArray(chains)) {
      chains.forEach((chain, chainIndex) => {
        if (!isPlainObject(chain)) return;
        if (chain["assembly"] === void 0) return;
        validateOneAssembly(
          problems,
          chain["assembly"],
          `variants[${index}].chains[${chainIndex}].assembly`,
          typeof chain["sequence"] === "string" ? chain["sequence"] : "",
          donors
        );
      });
    }
    const assembly = entry["assembly"];
    if (assembly === void 0) return;
    const where = `variants[${index}].assembly`;
    const sequence = typeof entry["sequence"] === "string" ? entry["sequence"] : "";
    if (entry["parent_id"] !== void 0 || entry["edits"] !== void 0) {
      problems.add(
        `${where}: a variant cannot have both an assembly and parent_id/edits. Model "assembled, then edited" as two variants: the assembly root, and a child deriving from it.`
      );
    }
    validateOneAssembly(problems, assembly, where, sequence, donors);
  });
}
function validateOneAssembly(problems, assembly, where, sequence, donors) {
  if (!isPlainObject(assembly)) {
    problems.add(`${where} must be an object`);
    return;
  }
  const segments = assembly["segments"];
  if (!Array.isArray(segments) || segments.length === 0) {
    problems.add(`${where}: segments must be a non-empty list`);
    return;
  }
  const ids = /* @__PURE__ */ new Set();
  let expectedStart = 1;
  segments.forEach((segment, segmentIndex) => {
    const segWhere = `${where}.segments[${segmentIndex}]`;
    if (!isPlainObject(segment)) {
      problems.add(`${segWhere} must be an object`);
      return;
    }
    if (requireId(problems, segment, "segment_id", segWhere)) {
      const id = segment["segment_id"];
      if (ids.has(id)) problems.add(`${segWhere}: duplicate segment_id ${JSON.stringify(id)}`);
      ids.add(id);
    }
    const start = segment["start"];
    const end = segment["end"];
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      problems.add(`${segWhere}: start and end must be integers`);
      return;
    }
    if (start !== expectedStart) {
      problems.add(
        `${segWhere}: starts at ${start} but the previous segment ended at ${expectedStart - 1}. Segments must tile the construct in order, leaving no residue unaccounted for.`
      );
    }
    if (end < start) {
      problems.add(`${segWhere}: end ${end} is before start ${start}`);
      return;
    }
    if (end > sequence.length) {
      problems.add(`${segWhere}: ends at ${end}, past the construct (${sequence.length} aa)`);
      return;
    }
    expectedStart = end + 1;
    const here = sequence.slice(start - 1, end);
    const kind = segment["kind"];
    if (kind === "literal") {
      const literal = segment["sequence"];
      if (typeof literal !== "string") {
        problems.add(`${segWhere}: a literal segment needs a sequence`);
      } else if (literal !== here) {
        problems.add(
          `${segWhere}: the literal sequence does not match residues ${start}-${end} of the construct (${JSON.stringify(literal)} vs ${JSON.stringify(here)})`
        );
      }
      return;
    }
    if (kind !== "donor") {
      problems.add(`${segWhere}: kind must be "donor" or "literal"; got ${JSON.stringify(kind)}`);
      return;
    }
    const donorId = segment["donor_id"];
    if (typeof donorId !== "string" || !donors.has(donorId)) {
      problems.add(`${segWhere}: donor_id ${JSON.stringify(donorId)} is not a declared donor`);
      return;
    }
    const donor = donors.get(donorId);
    const donorStart = segment["donor_start"];
    const donorEnd = segment["donor_end"];
    if (!Number.isInteger(donorStart) || !Number.isInteger(donorEnd)) {
      problems.add(`${segWhere}: donor_start and donor_end must be integers`);
      return;
    }
    if (donorStart < 1 || donorEnd > donor.length || donorEnd < donorStart) {
      problems.add(
        `${segWhere}: donor range ${donorStart}-${donorEnd} is outside ${donorId} (1-${donor.length})`
      );
      return;
    }
    const donorLength = donorEnd - donorStart + 1;
    const hereLength = end - start + 1;
    if (donorLength !== hereLength) {
      problems.add(
        `${segWhere}: ${hereLength} residues here but ${donorLength} in the donor. A donor segment is a copy, so the lengths must agree.`
      );
      return;
    }
    const there = donor.slice(donorStart - 1, donorEnd);
    if (there !== here) {
      problems.add(
        `${segWhere}: residues ${start}-${end} do not match ${donorId} ${donorStart}-${donorEnd}. The provenance claim is not supported by the sequences.`
      );
    }
  });
  if (expectedStart !== sequence.length + 1) {
    problems.add(
      `${where}: the segments cover ${expectedStart - 1} of ${sequence.length} residues. Every residue must belong to a segment, including synthetic junctions, which take a "literal" segment.`
    );
  }
}
function validateRecordHeader(problems, raw) {
  const version = raw["schema_version"];
  if (version !== 2 && version !== 3 && version !== 4 && version !== 5 && version !== 6) {
    problems.add(
      `schema_version must be 2, 3, 4, 5 or 6; got ${JSON.stringify(version)}. Version 1 records must go through the adapter in normalize.ts`
    );
  }
  rejectMisplacedChemistry(problems, raw, "record", "record");
  requireText(problems, raw, "title", "record");
  const rootId = raw["root_id"];
  if (rootId !== void 0 && (typeof rootId !== "string" || !ROOT_ID_PATTERN.test(rootId))) {
    problems.add(
      `root_id must be a lowercase ASCII HTML identifier matching ${ROOT_ID_PATTERN}; got ${JSON.stringify(rootId)}`
    );
  }
  if (raw["coordinate_note"] !== void 0) {
    requireText(problems, raw, "coordinate_note", "record");
  }
  if (raw["objective"] !== void 0) {
    requireText(problems, raw, "objective", "record");
  }
  return version;
}
function validateVariantEntry(pass, entry, index) {
  const {
    problems,
    sourceIds,
    regionIds,
    hypothesisIds,
    variantIds,
    placedRegions,
    names,
    hypothesisUse,
    chainsByVariant,
    fingerprintsByVariant,
    roles
  } = pass;
  const where = `variants[${index}]`;
  if (!isPlainObject(entry)) {
    problems.add(`${where} must be an object`);
    return;
  }
  const hasId = requireId(problems, entry, "variant_id", where);
  if (requireText(problems, entry, "name", where)) {
    const name = entry["name"];
    if (names.has(name)) {
      problems.add(`${where}: duplicate variant name ${JSON.stringify(name)}`);
    }
    names.add(name);
  }
  const role = entry["construct_role"];
  if (role !== "reference" && role !== "candidate" && role !== "control") {
    problems.add(
      `${where}: construct_role must be reference, candidate or control; got ${JSON.stringify(role)}`
    );
  } else {
    roles.push(role);
  }
  if (entry["note"] !== void 0) requireText(problems, entry, "note", where);
  if (entry["headline"] !== void 0) requireText(problems, entry, "headline", where);
  if (entry["reference_id"] !== void 0) requireId(problems, entry, "reference_id", where);
  const hypothesisId = entry["hypothesis_id"];
  if (hypothesisId !== void 0) {
    if (typeof hypothesisId !== "string" || !hypothesisIds.has(hypothesisId)) {
      problems.add(
        `${where}: hypothesis_id ${JSON.stringify(hypothesisId)} is not a declared hypothesis_id`
      );
    } else if (role === "reference") {
      problems.add(
        `${where}: a reference construct must not name a hypothesis_id. The reference is what the hypotheses are measured against.`
      );
    } else {
      hypothesisUse.set(hypothesisId, [...hypothesisUse.get(hypothesisId) ?? [], role]);
    }
  } else if (hypothesisIds.size > 0 && (role === "candidate" || role === "control")) {
    problems.add(
      `${where}: this record declares hypotheses, so a ${role} must name the hypothesis_id it tests or isolates. An ungrouped construct is one whose question was never stated.`
    );
  }
  const chainSequences = validateChains(problems, entry, where);
  chainsByVariant.set(entry["variant_id"], chainSequences);
  fingerprintsByVariant.set(entry["variant_id"], fingerprintsOf(entry));
  const chainLengths = new Map(
    [...chainSequences].map(([id, seq]) => [id, seq.length])
  );
  validateFeatures(problems, entry, where, chainLengths, regionIds, placedRegions);
  if (entry["chemistry"] !== void 0) {
    if (entry["sequence"] !== void 0) {
      problems.add(
        `${where}: chemistry needs a declared chain to be positional in. Write the sequence as chains: [{chain_id, name, sequence, chemistry}] instead of the single-chain shorthand, and keep bonds here.`
      );
    } else {
      validateBonds(problems, entry["chemistry"], where, chainSequences, sourceIds);
      validateConjugates(problems, entry["chemistry"], where, chainSequences, sourceIds);
    }
  }
  validateAttachments(
    problems,
    ledgerChains(entry, chainSequences),
    bondsOf(entry),
    conjugatesOf(entry),
    where
  );
  if (entry["edits"] !== void 0) validateEdits(problems, entry["edits"], where);
  if (entry["rationale"] !== void 0) {
    validateRationale(problems, entry["rationale"], where, sourceIds);
  }
  if (hasId) {
    const id = entry["variant_id"];
    if (variantIds.has(id)) {
      problems.add(`${where}: duplicate variant_id ${JSON.stringify(id)}`);
    }
    variantIds.add(id);
  }
}
function requireVersionForChemistry(problems, variantsRaw, version) {
  if (!(typeof version === "number" && version < 6)) return;
  variantsRaw.forEach((entry, index) => {
    if (!isPlainObject(entry)) return;
    const chains = Array.isArray(entry["chains"]) ? entry["chains"] : [];
    const has = entry["chemistry"] !== void 0 || // A declared gap is molecule-changing information in exactly the way a
    // recorded modification is: an older renderer that drops it exports the
    // unmodified letters, which is what the version is for.
    entry["unexpressed_chemistry"] !== void 0 || chains.some((chain) => isPlainObject(chain) && chain["chemistry"] !== void 0);
    if (has) {
      problems.add(
        `variants[${index}]: carries chemistry, which needs schema_version 6; this record says ${version}. Set it to 6 so a renderer that does not know the chemistry layer refuses the record instead of reading it with the chemistry dropped.`
      );
    }
  });
}
function validateParents(problems, variantsRaw, variantIds, chainsByVariant, fingerprintsByVariant) {
  variantsRaw.forEach((entry, index) => {
    if (!isPlainObject(entry)) return;
    const parentId = entry["parent_id"];
    if (parentId === void 0) return;
    const where = `variants[${index}]`;
    if (typeof parentId !== "string" || !variantIds.has(parentId)) {
      problems.add(`${where}: parent_id ${JSON.stringify(parentId)} is not a known variant_id`);
      return;
    }
    if (parentId === entry["variant_id"]) {
      problems.add(`${where}: parent_id must not reference the variant itself`);
    }
    if (entry["edits"] !== void 0 && !Array.isArray(entry["edits"])) return;
    if (entry["chains"] !== void 0) {
      const parentChains = chainsByVariant.get(parentId) ?? /* @__PURE__ */ new Map();
      const parentFingerprints = fingerprintsByVariant.get(parentId) ?? /* @__PURE__ */ new Map();
      validateChainDerivations(problems, entry, where, parentChains, parentFingerprints);
    }
  });
}
function validateLibraryCoverage(pass) {
  const { problems, roles, hypothesisIds, hypothesisUse, regionIds, placedRegions } = pass;
  if (roles.length > 0 && !roles.includes("reference")) {
    problems.add('at least one variant must have construct_role "reference"');
  }
  for (const id of hypothesisIds) {
    if (!hypothesisUse.has(id)) {
      problems.add(
        `hypotheses: ${JSON.stringify(id)} has no candidate or control naming it, so nothing in this library tests it`
      );
    }
  }
  for (const id of regionIds) {
    if (!placedRegions.has(id)) {
      problems.add(
        `regions: ${JSON.stringify(id)} is placed on no construct, so nothing in this library contains it. Give it a feature on the constructs that carry it, or remove it.`
      );
    }
  }
}
function validateRecord(raw) {
  const problems = new Problems();
  if (!isPlainObject(raw)) {
    throw new ValidationError(["the design record must be a JSON object"]);
  }
  const version = validateRecordHeader(problems, raw);
  const sourceIds = validateSources(problems, raw["sources"]);
  const regionIds = validateRegions(problems, raw["regions"]);
  const hypothesisIds = validateHypotheses(problems, raw["hypotheses"]);
  const variantsRaw = raw["variants"];
  if (!Array.isArray(variantsRaw) || variantsRaw.length === 0) {
    problems.add("variants must be a non-empty list");
    throw new ValidationError(problems.list);
  }
  const pass = {
    problems,
    sourceIds,
    regionIds,
    hypothesisIds,
    variantIds: /* @__PURE__ */ new Set(),
    placedRegions: /* @__PURE__ */ new Set(),
    names: /* @__PURE__ */ new Set(),
    hypothesisUse: /* @__PURE__ */ new Map(),
    chainsByVariant: /* @__PURE__ */ new Map(),
    fingerprintsByVariant: /* @__PURE__ */ new Map(),
    roles: []
  };
  variantsRaw.forEach((entry, index) => validateVariantEntry(pass, entry, index));
  requireVersionForChemistry(problems, variantsRaw, version);
  validateParents(
    problems,
    variantsRaw,
    pass.variantIds,
    pass.chainsByVariant,
    pass.fingerprintsByVariant
  );
  variantsRaw.forEach((entry, index) => {
    if (!isPlainObject(entry)) return;
    if (entry["edits"] !== void 0 && entry["parent_id"] === void 0) {
      problems.add(
        `variants[${index}]: edits are coordinates in the parent sequence, so parent_id is required alongside them`
      );
    }
  });
  const donorSequences = validateDonors(problems, raw["donors"], sourceIds);
  validateAttemptedAnalyses(
    problems,
    raw["attempted_analyses"],
    pass.variantIds,
    new Set(donorSequences.keys())
  );
  validateAssemblies(problems, variantsRaw, donorSequences);
  validateSites(problems, raw["sites"], pass.chainsByVariant, sourceIds);
  validateTracks(problems, raw["tracks"], pass.chainsByVariant, donorSequences);
  validatePrecedentSearch(problems, raw["precedent_search"], sourceIds);
  validateSeries(problems, raw["series"], variantsRaw, pass.chainsByVariant, hypothesisIds);
  validateLibraryCoverage(pass);
  if (problems.list.length > 0) throw new ValidationError(problems.list);
  return raw;
}

// src/theme.ts
var LIGHT = {
  surface: "#fcfcfb",
  surfaceSunken: "#f4f4f1",
  textPrimary: "#0b0b0b",
  textSecondary: "#52514e",
  textMuted: "#6e6d68",
  border: "#dedcd6",
  borderStrong: "#b4b2aa",
  track: "#e7e6e1",
  series: { blue: "#2a78d6", orange: "#eb6834", aqua: "#1baf7a" },
  neutral: "#8d8b84",
  membrane: "#a8a39a",
  editInk: "#3f3e3a"
};
var DARK = {
  surface: "#1a1a19",
  surfaceSunken: "#232322",
  textPrimary: "#f0efec",
  textSecondary: "#c3c2b7",
  textMuted: "#97958d",
  border: "#3a3a38",
  borderStrong: "#56554f",
  track: "#2e2e2c",
  series: { blue: "#3987e5", orange: "#d95926", aqua: "#199e70" },
  neutral: "#8f8d85",
  membrane: "#9a948b",
  editInk: "#d6d4cd"
};
var DOMAIN_HUES = [
  "#332288",
  "#44AA99",
  "#CC6677",
  "#88CCEE",
  "#AA4499",
  "#DDCC77",
  "#117733",
  "#882255",
  "#999933"
];
var HUE_ORDER = [
  "dom-1",
  "dom-2",
  "dom-3",
  "dom-4",
  "dom-5",
  "dom-6",
  "dom-7",
  "dom-8",
  "dom-9"
];
var FUNCTIONAL_KINDS = /* @__PURE__ */ new Set([
  "binding",
  "assembly",
  "regulatory",
  "catalytic"
]);
function isFunctionalKind(kind) {
  return FUNCTIONAL_KINDS.has(kind);
}
function assignPaintTokens(regions) {
  const tokens = /* @__PURE__ */ new Map();
  let hueIndex = 0;
  for (const region of regions) {
    if (tokens.has(region.region_id)) continue;
    if (region.kind === "membrane") {
      tokens.set(region.region_id, "membrane");
    } else if (isFunctionalKind(region.kind)) {
      tokens.set(region.region_id, HUE_ORDER[hueIndex % HUE_ORDER.length]);
      hueIndex += 1;
    } else {
      tokens.set(region.region_id, "neutral");
    }
  }
  return tokens;
}
function tokenVar(token) {
  if (token === "neutral") return "var(--cm-neutral)";
  if (token === "membrane") return "var(--cm-membrane)";
  return `var(--cm-${token})`;
}
var EVIDENCE_STYLES = {
  measured: {
    fillOpacity: 0.85,
    strokeDasharray: null,
    strokeOpacity: 1,
    description: "Measured in this construct"
  },
  established_elsewhere: {
    fillOpacity: 0.6,
    strokeDasharray: null,
    strokeOpacity: 0.85,
    description: "Established in another construct or organism"
  },
  predicted: {
    fillOpacity: 0.3,
    strokeDasharray: "5 3",
    strokeOpacity: 0.9,
    description: "Predicted or inferred only"
  },
  unknown: {
    fillOpacity: 0.12,
    strokeDasharray: "2 3",
    strokeOpacity: 0.75,
    description: "No evidence status supplied"
  }
};
function cssVariables(colors) {
  return [
    `--cm-surface:${colors.surface}`,
    `--cm-surface-sunken:${colors.surfaceSunken}`,
    `--cm-text-primary:${colors.textPrimary}`,
    `--cm-text-secondary:${colors.textSecondary}`,
    `--cm-text-muted:${colors.textMuted}`,
    `--cm-border:${colors.border}`,
    `--cm-border-strong:${colors.borderStrong}`,
    `--cm-track:${colors.track}`,
    `--cm-series-blue:${colors.series.blue}`,
    `--cm-series-orange:${colors.series.orange}`,
    `--cm-series-aqua:${colors.series.aqua}`,
    `--cm-neutral:${colors.neutral}`,
    `--cm-membrane:${colors.membrane}`,
    `--cm-edit-ink:${colors.editInk}`,
    // The nine domain hues, identical in both themes. Dark mode changes the
    // surface and ink tokens around them.
    ...DOMAIN_HUES.map((hue, index) => `--cm-dom-${index + 1}:${hue}`),
    // The opposite of this theme's primary ink. No rule in this package uses it.
    `--cm-ink-inverse:${colors === DARK ? LIGHT.textPrimary : DARK.textPrimary}`,
    ...(colors === DARK ? SEQUENTIAL_DARK : SEQUENTIAL_LIGHT).map(
      (step, index) => `--cm-seq-${index + 1}:${step}`
    )
  ].join(";");
}
function themeCss(scope, fixed) {
  if (fixed === "light") return `${scope}{${cssVariables(LIGHT)};color-scheme:light}`;
  if (fixed === "dark") return `${scope}{${cssVariables(DARK)};color-scheme:dark}`;
  return `${scope}{${cssVariables(LIGHT)};color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ${scope}{${cssVariables(DARK)};color-scheme:dark}}
:root[data-theme="dark"] ${scope}{${cssVariables(DARK)};color-scheme:dark}`;
}
var SEQUENTIAL_LIGHT = [
  "#cde2fb",
  "#9ec5f4",
  "#6da7ec",
  "#3987e5",
  "#256abf",
  "#184f95",
  "#0d366b"
];
var SEQUENTIAL_DARK = [
  "#104281",
  "#1c5cab",
  "#256abf",
  "#3987e5",
  "#6da7ec",
  "#9ec5f4",
  "#cde2fb"
];
function sequentialStep(value, steps = SEQUENTIAL_LIGHT.length) {
  if (!Number.isFinite(value)) return 0;
  const clamped = Math.max(0, Math.min(1, value));
  return Math.min(steps - 1, Math.floor(clamped * steps));
}

// src/map.ts
var EditMismatchError = class extends Error {
  constructor(variantName, expected, actual) {
    const at = firstDifference(expected, actual);
    super(
      `Variant ${JSON.stringify(variantName)}: applying the declared edits to the parent produced a sequence of length ${actual.length}, but the declared sequence has length ${expected.length}` + (at === null ? "" : `; they first differ at position ${at + 1} (declared ${JSON.stringify(expected[at] ?? "")}, edits produced ${JSON.stringify(actual[at] ?? "")})`) + ". The edit list and the sequence disagree, so neither can be drawn."
    );
    this.variantName = variantName;
    this.expected = expected;
    this.actual = actual;
    this.name = "EditMismatchError";
  }
};
function firstDifference(a, b) {
  const limit = Math.min(a.length, b.length);
  for (let i = 0; i < limit; i += 1) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? null : limit;
}
function assertNoOverlap(edits) {
  const spans = [];
  for (const edit of edits) {
    switch (edit.op) {
      case "delete":
      case "replace":
        spans.push({ start: edit.start, end: edit.end, label: edit.op });
        break;
      case "substitute":
        spans.push({ start: edit.position, end: edit.position, label: "substitute" });
        break;
      case "insert":
        break;
    }
  }
  spans.sort((a, b) => a.start - b.start || a.end - b.end);
  for (let i = 1; i < spans.length; i += 1) {
    const previous = spans[i - 1];
    const current = spans[i];
    if (current.start <= previous.end) {
      throw new Error(
        `Edits overlap in the parent sequence: ${previous.label} ${previous.start}-${previous.end} and ${current.label} ${current.start}-${current.end}. Parent coordinates are applied simultaneously, so overlapping edits are ambiguous.`
      );
    }
  }
}
function applyEdits(parent, edits) {
  assertNoOverlap(edits);
  const parentLength = parent.length;
  for (const edit of edits) {
    const within = (position, allowAppend = false) => {
      const upper = allowAppend ? parentLength + 1 : parentLength;
      if (position < 1 || position > upper) {
        throw new Error(
          `Edit coordinate ${position} is outside the parent sequence (1-${upper}). Edit coordinates are measured in the parent.`
        );
      }
    };
    switch (edit.op) {
      case "insert":
        within(edit.at, true);
        break;
      case "delete":
      case "replace":
        within(edit.start);
        within(edit.end);
        break;
      case "substitute": {
        within(edit.position);
        const actual = parent[edit.position - 1];
        if (actual !== edit.from) {
          throw new Error(
            `Substitution ${edit.from}${edit.position}${edit.to} does not match the parent, which has ${JSON.stringify(actual ?? "")} at position ${edit.position}.`
          );
        }
        break;
      }
    }
  }
  const insertsAt = /* @__PURE__ */ new Map();
  const deletedAt = /* @__PURE__ */ new Map();
  const skip = /* @__PURE__ */ new Set();
  const replacementAt = /* @__PURE__ */ new Map();
  const substitutionAt = /* @__PURE__ */ new Map();
  for (const edit of edits) {
    switch (edit.op) {
      case "insert": {
        const list = insertsAt.get(edit.at) ?? [];
        list.push(edit.sequence);
        insertsAt.set(edit.at, list);
        break;
      }
      case "delete": {
        deletedAt.set(edit.start, { start: edit.start, end: edit.end, derivedJunction: 0 });
        for (let p = edit.start; p <= edit.end; p += 1) skip.add(p);
        break;
      }
      case "replace": {
        replacementAt.set(edit.start, { end: edit.end, sequence: edit.sequence });
        for (let p = edit.start; p <= edit.end; p += 1) skip.add(p);
        break;
      }
      case "substitute":
        substitutionAt.set(edit.position, { from: edit.from, to: edit.to });
        break;
    }
  }
  const out = [];
  const origins = [];
  const deletions = [];
  const emitInserts = (position) => {
    for (const inserted of insertsAt.get(position) ?? []) {
      for (const residue of inserted) {
        out.push(residue);
        origins.push({ kind: "inserted" });
      }
    }
  };
  for (let p = 1; p <= parentLength; p += 1) {
    emitInserts(p);
    const deletion = deletedAt.get(p);
    if (deletion !== void 0) {
      deletions.push({ ...deletion, derivedJunction: out.length });
    }
    const replacement = replacementAt.get(p);
    if (replacement !== void 0) {
      for (const residue2 of replacement.sequence) {
        out.push(residue2);
        origins.push({ kind: "inserted" });
      }
      continue;
    }
    if (skip.has(p)) continue;
    const substitution = substitutionAt.get(p);
    const residue = parent[p - 1];
    if (substitution !== void 0) {
      out.push(substitution.to);
      origins.push({ kind: "substituted", parentPosition: p, fromResidue: substitution.from });
    } else {
      out.push(residue);
      origins.push({ kind: "retained", parentPosition: p });
    }
  }
  emitInserts(parentLength + 1);
  return { sequence: out.join(""), origins, deletions };
}
function toSegments(origins) {
  const segments = [];
  for (let i = 0; i < origins.length; i += 1) {
    const kind = origins[i].kind;
    const last = segments[segments.length - 1];
    if (last !== void 0 && last.kind === kind && last.end === i) {
      last.end = i + 1;
    } else {
      segments.push({ start: i + 1, end: i + 1, kind });
    }
  }
  return segments;
}
function headlineFor(segments, deletions, provenance, ambiguous) {
  const total = (kind) => segments.filter((s) => s.kind === kind).reduce((sum, s) => sum + (s.end - s.start + 1), 0);
  const added = total("inserted");
  const substituted = total("substituted");
  const removed = deletions.reduce((sum, d) => sum + (d.end - d.start + 1), 0);
  const retained = total("retained");
  const parts = [];
  if (added > 0) parts.push(`+${added} aa`);
  if (removed > 0) parts.push(`\u2212${removed} aa`);
  if (substituted > 0) parts.push(`${substituted} substituted`);
  parts.push(`${retained} retained`);
  const tail = ambiguous ? " \xB7 location ambiguous" : "";
  if (provenance === "declared" && added === 0 && removed === 0 && substituted === 0) {
    return `Unchanged from the parent \xB7 ${retained} retained${tail}`;
  }
  const lead = provenance === "declared" ? "Declared edits" : "Derived from sequences";
  return `${lead} \xB7 ${parts.join(" \xB7 ")}${tail}`;
}
function describe(segments, deletions) {
  const parts = [];
  const inserted = segments.filter((s) => s.kind === "inserted");
  const substituted = segments.filter((s) => s.kind === "substituted");
  const retainedResidues = segments.filter((s) => s.kind === "retained").reduce((total, s) => total + (s.end - s.start + 1), 0);
  if (inserted.length > 0) {
    const total = inserted.reduce((sum, s) => sum + (s.end - s.start + 1), 0);
    parts.push(
      `${total} residue${total === 1 ? "" : "s"} added in ${inserted.length} block${inserted.length === 1 ? "" : "s"}`
    );
  }
  if (deletions.length > 0) {
    const total = deletions.reduce((sum, d) => sum + (d.end - d.start + 1), 0);
    parts.push(
      `${total} residue${total === 1 ? "" : "s"} removed in ${deletions.length} block${deletions.length === 1 ? "" : "s"}`
    );
  }
  if (substituted.length > 0) {
    const total = substituted.reduce((sum, s) => sum + (s.end - s.start + 1), 0);
    parts.push(`${total} residue${total === 1 ? "" : "s"} substituted`);
  }
  parts.push(`${retainedResidues} retained from the parent`);
  return parts.join("; ") + ".";
}
function correspondenceFromEdits(variantName, parent, declared, edits) {
  const applied = applyEdits(parent, edits);
  if (applied.sequence !== declared) {
    throw new EditMismatchError(variantName, declared, applied.sequence);
  }
  const segments = toSegments(applied.origins);
  return {
    provenance: "declared",
    origins: applied.origins,
    segments,
    deletions: applied.deletions,
    ambiguous: false,
    summary: `Declared edits, verified against both sequences: ${describe(segments, applied.deletions)}`,
    headline: headlineFor(segments, applied.deletions, "declared", false)
  };
}
function correspondenceFromSequences(parent, derived, chemistry) {
  const same = (parentIndex, derivedIndex) => parent[parentIndex] === derived[derivedIndex] && chemistry?.parent?.get(parentIndex + 1) === chemistry?.derived?.get(derivedIndex + 1);
  const limit = Math.min(parent.length, derived.length);
  let prefix = 0;
  while (prefix < limit && same(prefix, prefix)) prefix += 1;
  let suffix = 0;
  while (suffix < limit - prefix && same(parent.length - 1 - suffix, derived.length - 1 - suffix)) {
    suffix += 1;
  }
  const parentMiddleStart = prefix + 1;
  const parentMiddleEnd = parent.length - suffix;
  const derivedMiddleStart = prefix + 1;
  const derivedMiddleEnd = derived.length - suffix;
  const origins = [];
  for (let i = 1; i <= prefix; i += 1) origins.push({ kind: "retained", parentPosition: i });
  for (let i = derivedMiddleStart; i <= derivedMiddleEnd; i += 1) origins.push({ kind: "inserted" });
  for (let i = parentMiddleEnd + 1; i <= parent.length; i += 1) {
    origins.push({ kind: "retained", parentPosition: i });
  }
  const deletions = parentMiddleEnd >= parentMiddleStart ? [{ start: parentMiddleStart, end: parentMiddleEnd, derivedJunction: prefix }] : [];
  const insertedBlock = derived.slice(derivedMiddleStart - 1, derivedMiddleEnd);
  const deletedBlock = parent.slice(parentMiddleStart - 1, parentMiddleEnd);
  const slidesLeft = (block) => block.length > 0 && prefix >= 1 && block[block.length - 1] === parent[prefix - 1];
  const slidesRight = (block) => block.length > 0 && parentMiddleEnd < parent.length && block[0] === parent[parentMiddleEnd];
  const canSlide = insertedBlock.length > 0 && (slidesLeft(insertedBlock) || slidesRight(insertedBlock)) || deletedBlock.length > 0 && (slidesLeft(deletedBlock) || slidesRight(deletedBlock));
  const ambiguous = canSlide;
  const segments = toSegments(origins);
  const note = ambiguous ? " The same sequence results if this change is placed at a neighbouring position, so its exact location is not determined by the sequences alone -- a block copied from elsewhere in the construct is the usual cause. Supply an explicit edit list to state where the change belongs." : "";
  return {
    provenance: "derived",
    origins,
    segments,
    deletions,
    ambiguous,
    summary: `Correspondence derived from the sequences (no edits declared): ${describe(segments, deletions)}` + note,
    headline: headlineFor(segments, deletions, "derived", ambiguous)
  };
}
function noCorrespondence() {
  return {
    provenance: "none",
    origins: [],
    segments: [],
    deletions: [],
    ambiguous: false,
    summary: "No parent construct recorded, so no edit correspondence is shown.",
    headline: ""
  };
}
function remapSpan(correspondence, parentStart, parentEnd) {
  let start = null;
  let end = null;
  let retained = 0;
  for (let i = 0; i < correspondence.origins.length; i += 1) {
    const origin = correspondence.origins[i];
    if (origin.kind === "inserted") continue;
    if (origin.parentPosition >= parentStart && origin.parentPosition <= parentEnd) {
      if (start === null) start = i + 1;
      end = i + 1;
      retained += 1;
    }
  }
  if (start === null || end === null) return null;
  return { start, end, truncated: retained < parentEnd - parentStart + 1 };
}
function findStaleCoordinates(features, parentFeatures, correspondence) {
  if (correspondence.provenance === "none") return [];
  const byInstance = new Map(parentFeatures.map((feature) => [feature.instance_id, feature]));
  const ordinals = /* @__PURE__ */ new Map();
  for (const feature of parentFeatures) {
    const list = ordinals.get(feature.region_id) ?? [];
    list.push(feature);
    ordinals.set(feature.region_id, list);
  }
  const seen = /* @__PURE__ */ new Map();
  const coversInserted = (feature) => {
    for (let position = feature.start; position <= feature.end; position += 1) {
      if (correspondence.origins[position - 1]?.kind === "inserted") return true;
    }
    return false;
  };
  const stale = [];
  for (const feature of features) {
    if (coversInserted(feature)) continue;
    const index = seen.get(feature.region_id) ?? 0;
    seen.set(feature.region_id, index + 1);
    const counterpart = byInstance.get(feature.instance_id) ?? ordinals.get(feature.region_id)?.[index];
    if (counterpart === void 0) continue;
    const expected = remapSpan(correspondence, counterpart.start, counterpart.end);
    if (expected === null) continue;
    if (feature.start === expected.start && feature.end === expected.end) continue;
    if (feature.start !== counterpart.start || feature.end !== counterpart.end) continue;
    stale.push({
      instance_id: feature.instance_id,
      declared: `${feature.start}-${feature.end}`,
      remapped: `${expected.start}-${expected.end}`
    });
  }
  return stale;
}

// src/normalize.ts
var LEGACY_KIND_ALIASES = {
  region: "other",
  binding: "binding",
  linker: "linker",
  assembly: "assembly",
  regulatory: "regulatory",
  catalytic: "catalytic",
  composition: "composition",
  module: "module",
  membrane: "membrane",
  edit: "edit",
  transmembrane: "membrane",
  signal: "other",
  spacer: "module"
};
function slugify(value, fallback) {
  const slug = value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return slug === "" ? fallback : slug;
}
function uniqueSlug(value, fallback, taken) {
  const base = slugify(value, fallback);
  if (!taken.has(base)) {
    taken.add(base);
    return base;
  }
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) {
      taken.add(candidate);
      return candidate;
    }
  }
}
function inferRole(index, note) {
  if (index === 0) return "reference";
  if (note !== void 0 && /^\s*control\b/i.test(note)) return "control";
  return "candidate";
}
function adaptLegacyRecord(legacy) {
  const notes = [];
  const variantsIn = legacy.variants ?? [];
  if (variantsIn.length === 0) {
    throw new Error("A version-1 record must contain at least one variant.");
  }
  const regionIds = /* @__PURE__ */ new Map();
  const regionSlugs = /* @__PURE__ */ new Set();
  const variantSlugs = /* @__PURE__ */ new Set();
  const variants = variantsIn.map((legacyVariant, index) => {
    const variantId = uniqueSlug(legacyVariant.name, `variant-${index + 1}`, variantSlugs);
    const occurrences = /* @__PURE__ */ new Map();
    const features = (legacyVariant.features ?? []).map((legacyFeature) => {
      const label = legacyFeature.label;
      const kindRaw = (legacyFeature.kind ?? "other").toLowerCase();
      const kind = LEGACY_KIND_ALIASES[kindRaw] ?? (REGION_KINDS.includes(kindRaw) ? kindRaw : "other");
      const key = slugify(label, "region");
      let definition = regionIds.get(key);
      if (definition === void 0) {
        definition = {
          region_id: uniqueSlug(label, "region", regionSlugs),
          name: label,
          kind
        };
        regionIds.set(key, definition);
      } else if (definition.kind !== kind) {
        notes.push(
          `Region ${JSON.stringify(label)} appears with kinds ${JSON.stringify(definition.kind)} and ${JSON.stringify(kind)}; the first was kept.`
        );
      }
      const seen = (occurrences.get(definition.region_id) ?? 0) + 1;
      occurrences.set(definition.region_id, seen);
      const evidence = legacyFeature.evidence ?? "unknown";
      return {
        instance_id: `${definition.region_id}@${seen}`,
        region_id: definition.region_id,
        start: legacyFeature.start,
        end: legacyFeature.end,
        evidence
      };
    });
    const role = inferRole(index, legacyVariant.note);
    const variant = {
      variant_id: variantId,
      name: legacyVariant.name,
      sequence: legacyVariant.sequence,
      construct_role: role,
      features
    };
    if (legacyVariant.note !== void 0) variant.note = legacyVariant.note;
    if (legacyVariant.rationale !== void 0) variant.rationale = legacyVariant.rationale;
    return variant;
  });
  const reference = variants[0];
  for (const variant of variants) {
    if (variant.variant_id !== reference.variant_id) {
      variant.parent_id = reference.variant_id;
    }
  }
  notes.push(
    `Adapted ${variants.length} variant(s) from a version-1 record. Variant and region identifiers were derived from names and labels; ${JSON.stringify(reference.name)} was taken as the reference because it is listed first.`
  );
  notes.push(
    "A version-1 record declares no edits, so edit correspondence is derived from the sequences and marked as derived."
  );
  const record = {
    schema_version: 2,
    title: legacy.title ?? "Sequence architecture",
    sources: legacy.sources ?? [],
    regions: [...regionIds.values()],
    variants
  };
  if (legacy.root_id !== void 0) record.root_id = legacy.root_id;
  return { record, notes };
}
function isLegacyRecord(raw) {
  if (typeof raw !== "object" || raw === null) return false;
  const record = raw;
  if (record["schema_version"] !== void 0 && record["schema_version"] !== 1) return false;
  if (!Array.isArray(record["variants"])) return false;
  const first = record["variants"][0];
  if (typeof first !== "object" || first === null) return false;
  return first["variant_id"] === void 0;
}
function monomersByPosition(chain) {
  const out = /* @__PURE__ */ new Map();
  for (const entry of chain.chemistry?.residues ?? []) out.set(entry.position, entry.monomer);
  return out;
}
function chainsOf(variant) {
  if (variant.chains !== void 0 && variant.chains.length > 0) return variant.chains;
  return [
    {
      chain_id: SINGLE_CHAIN_ID,
      name: variant.name,
      sequence: variant.sequence ?? "",
      // Spread rather than assign: this project runs with
      // exactOptionalPropertyTypes, so an explicit `undefined` is not the same
      // as an absent field and would not satisfy `edits?: EditOperation[]`.
      ...variant.edits === void 0 ? {} : { edits: variant.edits },
      ...variant.assembly === void 0 ? {} : { assembly: variant.assembly },
      ...variant.reference_id === void 0 ? {} : { reference_id: variant.reference_id }
    }
  ];
}
function defaultChainId(chains) {
  return chains.length === 1 ? chains[0].chain_id : SINGLE_CHAIN_ID;
}
var INITIAL_LIBRARY_LIMIT = 10;
function chainCorrespondenceFor(variant, chain, parentChain) {
  if (parentChain === null || chain.assembly !== void 0) return noCorrespondence();
  const label = chain.chain_id === SINGLE_CHAIN_ID ? variant.name : `${variant.name} chain ${chain.chain_id}`;
  if (chain.derivation === "unchanged") {
    return correspondenceFromEdits(label, parentChain.sequence, chain.sequence, []);
  }
  if (chain.edits !== void 0 && chain.edits.length > 0) {
    return correspondenceFromEdits(label, parentChain.sequence, chain.sequence, chain.edits);
  }
  return correspondenceFromSequences(parentChain.sequence, chain.sequence, {
    parent: monomersByPosition(parentChain),
    derived: monomersByPosition(chain)
  });
}
function normalizeVariants(record, warnings) {
  const byId = new Map(record.variants.map((variant) => [variant.variant_id, variant]));
  return record.variants.map((variant) => {
    const parent = variant.parent_id === void 0 ? null : byId.get(variant.parent_id) ?? null;
    const declared = chainsOf(variant);
    const parentChains = parent === null ? [] : chainsOf(parent);
    const parentById = new Map(parentChains.map((c) => [c.chain_id, c]));
    const chains = declared.map((chain) => {
      const parentChain = parentById.get(chain.chain_id) ?? null;
      return {
        chain,
        length: chain.sequence.length,
        parentChain,
        correspondence: chainCorrespondenceFor(variant, chain, parentChain)
      };
    });
    const single = chains.length === 1 ? chains[0] : null;
    const correspondence = single === null ? noCorrespondence() : single.correspondence;
    const staleCoordinates = parent === null ? [] : findStaleCoordinates(variant.features, parent.features, correspondence);
    for (const stale of staleCoordinates) {
      warnings.push(
        `${variant.name}: feature ${stale.instance_id} is annotated at ${stale.declared}, which covers the same residues as the parent at that span; the remapped position is ${stale.remapped}. Check whether the coordinates were copied from the parent instead of remapped.`
      );
    }
    return {
      variant,
      chains,
      // Throws for a multi-chain construct: "the sequence" of a heterodimer
      // has no answer, and returning one chain's residues would put them under
      // another's name.
      get sequence() {
        if (single === null) {
          throw new Error(
            `${variant.name}: this construct has ${chains.length} chains (${chains.map((c) => c.chain.chain_id).join(", ")}), so it has no single "sequence". Read .chains instead.`
          );
        }
        return single.chain.sequence;
      },
      length: single === null ? Math.max(...chains.map((c) => c.length)) : single.length,
      parent,
      correspondence,
      staleCoordinates
    };
  });
}
function regionPaint(record, regions) {
  const appearance = [];
  const seenRegion = /* @__PURE__ */ new Set();
  for (const variant of record.variants) {
    for (const feature of variant.features) {
      if (seenRegion.has(feature.region_id)) continue;
      seenRegion.add(feature.region_id);
      const definition = regions.get(feature.region_id);
      if (definition !== void 0) {
        appearance.push({ region_id: definition.region_id, kind: definition.kind });
      }
    }
  }
  for (const region of record.regions) {
    if (!seenRegion.has(region.region_id)) {
      appearance.push({ region_id: region.region_id, kind: region.kind });
    }
  }
  return assignPaintTokens(appearance);
}
function sharedRegionIdsOf(record) {
  const regionCounts = /* @__PURE__ */ new Map();
  for (const variant of record.variants) {
    for (const feature of variant.features) {
      const set = regionCounts.get(feature.region_id) ?? /* @__PURE__ */ new Set();
      set.add(variant.variant_id);
      regionCounts.set(feature.region_id, set);
    }
  }
  return new Set(
    [...regionCounts.entries()].filter(([, set]) => set.size > 1).map(([id]) => id)
  );
}
function groupByHypothesis(record, variants) {
  const roleRank = (role) => role === "candidate" ? 0 : role === "control" ? 1 : 2;
  const ordered = (list) => list.map((v, index) => ({ v, index })).sort(
    (a, b) => roleRank(a.v.variant.construct_role) - roleRank(b.v.variant.construct_role) || a.index - b.index
  ).map((entry) => entry.v);
  const groups = [];
  const ungrouped = variants.filter((v) => v.variant.hypothesis_id === void 0);
  if (ungrouped.length > 0) groups.push({ hypothesis: null, variants: ungrouped });
  for (const hypothesis of record.hypotheses ?? []) {
    const members = variants.filter(
      (v) => v.variant.hypothesis_id === hypothesis.hypothesis_id
    );
    groups.push({ hypothesis, variants: ordered(members) });
  }
  return groups;
}
function conservationOutstanding(record) {
  const satisfied = (req) => {
    const tracks = (record.tracks ?? []).filter((t) => t.kind === "conservation");
    const attempts = (record.attempted_analyses ?? []).filter((a) => a.kind === "conservation");
    if (req.kind === "donor") {
      return tracks.some((t) => t.target_kind === "donor" && t.applies_to === req.donorId) || attempts.some((a) => a.target_kind === "donor" && a.target === req.donorId);
    }
    const addressesChain = (declaredChain, targetId) => {
      if (targetId !== req.variantId) return false;
      if (declaredChain !== void 0) return declaredChain === req.chainId;
      const target = record.variants.find((v) => v.variant_id === targetId);
      return target !== void 0 && chainsOf(target).length === 1;
    };
    return tracks.some(
      (t) => (t.target_kind ?? "variant") === "variant" && addressesChain(t.chain_id, t.applies_to)
    ) || attempts.some(
      (a) => (a.target_kind ?? "variant") === "variant" && addressesChain(a.chain_id, a.target)
    );
  };
  const needed = [];
  for (const variant of record.variants) {
    const declaredChains = chainsOf(variant);
    const addDonorsOf = (assembly) => {
      for (const segment of assembly.segments) {
        if (segment.kind !== "donor" || segment.donor_id === void 0) continue;
        const donor = (record.donors ?? []).find((d) => d.donor_id === segment.donor_id);
        if (donor === void 0) continue;
        if (!needed.some((n) => n.kind === "donor" && n.donorId === donor.donor_id)) {
          needed.push({
            kind: "donor",
            donorId: donor.donor_id,
            label: `${donor.name} (component of ${variant.name})`
          });
        }
      }
    };
    if (variant.assembly !== void 0) addDonorsOf(variant.assembly);
    for (const chain of declaredChains) {
      if (chain.assembly !== void 0) addDonorsOf(chain.assembly);
    }
    if (variant.assembly !== void 0) continue;
    if (variant.construct_role !== "reference") continue;
    for (const chain of declaredChains) {
      if (chain.assembly !== void 0) continue;
      const accession = chain.reference_id ?? variant.reference_id;
      const where = declaredChains.length > 1 ? `${variant.name} chain ${chain.chain_id}` : variant.name;
      needed.push({
        kind: "chain",
        variantId: variant.variant_id,
        chainId: chain.chain_id,
        label: accession === void 0 ? where : `${where} (${accession})`
      });
    }
  }
  const outstanding = [];
  for (const req of needed) {
    if (satisfied(req)) continue;
    const { label } = req;
    outstanding.push(
      `No conservation result for ${label}. Compute it against an appropriate ortholog set and record the homolog selection, alignment, scoring method and coverage, leaving unsupported positions unscored -- or record the attempt and why it produced nothing usable. An absent track on its own does not say which happened.`
    );
  }
  return outstanding;
}
function precedentFindings(record) {
  const outstanding = [];
  const warnings = [];
  if (record.variants.some((variant) => variant.construct_role === "candidate")) {
    const search = record.precedent_search;
    if (search === void 0) {
      outstanding.push(
        "No precedent search accounted for. This library proposes candidates, so record the search for prior work on the proposed constructs -- its scope, and whether it returned before the designs were selected -- or why it could not be completed. A design already published is not distinguishable from a new one in a record that never looked."
      );
    } else if (search.completed === false) {
      warnings.push(
        `The precedent search did not complete (${search.reason ?? "no reason recorded"}), so these candidates were selected without it. They are provisional, and a published precedent for any of them would not have been seen.`
      );
    }
  }
  return { outstanding, warnings };
}
function libraryShapeWarnings(record, groups) {
  const warnings = [];
  const seriesIds = new Set((record.series ?? []).map((series) => series.series_id));
  const grouped = record.variants.filter(
    (variant) => variant.series_id !== void 0 && seriesIds.has(variant.series_id)
  );
  const displayedUnits = record.variants.length - grouped.length + seriesIds.size;
  const molecular = record.variants.length;
  const sizeNote = molecular === displayedUnits ? `${molecular} constructs` : `${displayedUnits} comparisons to read, from ${molecular} molecular constructs (${seriesIds.size} series)`;
  if (displayedUnits > INITIAL_LIBRARY_LIMIT) {
    warnings.push(
      `This library has ${sizeNote}. An opening comparison is easier to interpret at ${INITIAL_LIBRARY_LIMIT} or fewer, including the reference and controls; check that each one answers a question the others do not.`
    );
  } else if (molecular !== displayedUnits) {
    warnings.push(
      `This library is ${sizeNote}. The comparison count is the number of units a reader interprets, and the molecular count is the number of distinct molecules.`
    );
  }
  for (const series of record.series ?? []) {
    const cited = (record.sites ?? []).filter(
      (site) => site.applies_to === series.parent_id && (site.evidence === "measured" || site.evidence === "established_elsewhere")
    ).flatMap((site) => site.residues.map((residue) => residue.position)).filter((position) => series.target_positions.includes(position));
    if (cited.length > 0) {
      warnings.push(
        `Series ${series.series_id} scans position(s) ${[...new Set(cited)].sort((a, b) => a - b).join(", ")}, which already carry cited residue-level evidence on its parent. Testing a named residue and scanning across it answer different questions; check that this series is asking the one you want.`
      );
    }
  }
  for (const group of groups) {
    if (group.hypothesis === null) continue;
    const candidates = group.variants.filter((v) => v.variant.construct_role === "candidate");
    const distinct = new Set(
      candidates.map(
        (v) => v.variant.series_id !== void 0 && seriesIds.has(v.variant.series_id) ? `series:${v.variant.series_id}` : `variant:${v.variant.variant_id}`
      )
    );
    if (distinct.size > 1) {
      const seriesCount = [...distinct].filter((key) => key.startsWith("series:")).length;
      warnings.push(
        `${group.hypothesis.question} has ${distinct.size} candidates` + (seriesCount > 0 ? ` (${seriesCount} of them a series)` : "") + ". One proposed change or one prespecified series per hypothesis keeps the first comparison interpretable; further variants belong in a later round, once that comparison has resolved."
      );
    }
  }
  return warnings;
}
function buildModel(record) {
  const regions = new Map(record.regions.map((region) => [region.region_id, region]));
  const sources = new Map(record.sources.map((source) => [source.id, source]));
  const hypotheses = new Map(
    (record.hypotheses ?? []).map((hypothesis) => [hypothesis.hypothesis_id, hypothesis])
  );
  const warnings = [];
  const outstanding = [];
  const variants = normalizeVariants(record, warnings);
  const paint = regionPaint(record, regions);
  const sharedRegionIds = sharedRegionIdsOf(record);
  const groups = groupByHypothesis(record, variants);
  outstanding.push(...conservationOutstanding(record));
  const precedent = precedentFindings(record);
  outstanding.push(...precedent.outstanding);
  warnings.push(...precedent.warnings);
  warnings.push(...libraryShapeWarnings(record, groups));
  return {
    record,
    outstanding,
    regions,
    sources,
    hypotheses,
    variants,
    // The shared residue scale is set by the longest CHAIN: a two-chain
    // construct is two rows, each scaled to its own chain, and the widest row
    // is what has to fit.
    maxLength: Math.max(
      ...record.variants.flatMap((v) => chainsOf(v).map((c) => c.sequence.length))
    ),
    rootId: record.root_id ?? "construct-maps",
    sharedRegionIds,
    paint,
    groups,
    warnings
  };
}

// src/align.ts
function inDependencyOrder(model) {
  const byId = new Map(model.variants.map((v) => [v.variant.variant_id, v]));
  const done = /* @__PURE__ */ new Set();
  const ordered = [];
  const visit = (normalized, guard) => {
    const id = normalized.variant.variant_id;
    if (done.has(id) || guard.has(id)) return;
    guard.add(id);
    const parentId = normalized.variant.parent_id;
    if (parentId !== void 0) {
      const parent = byId.get(parentId);
      if (parent !== void 0) visit(parent, guard);
    }
    guard.delete(id);
    done.add(id);
    ordered.push(normalized);
  };
  for (const normalized of model.variants) visit(normalized, /* @__PURE__ */ new Set());
  return ordered;
}
function slotKeysFor(normalized, parentKeys, chainId) {
  const { variant, parent } = normalized;
  const nchain = normalized.chains.find((c) => c.chain.chain_id === chainId);
  const correspondence = nchain === void 0 ? normalized.correspondence : nchain.correspondence;
  const sequence = nchain === void 0 ? "" : nchain.chain.sequence;
  const id = variant.variant_id;
  if (parent === null || correspondence.provenance === "none") {
    return Array.from({ length: sequence.length }, (_, i) => `r:${id}:${chainId}:${i + 1}`);
  }
  const inherited = parentKeys.get(parent.variant_id);
  if (inherited === void 0) {
    return Array.from({ length: sequence.length }, (_, i) => `r:${id}:${chainId}:${i + 1}`);
  }
  const keys = [];
  let run = 0;
  let offset = 0;
  let previousWasInsert = false;
  for (let d = 0; d < sequence.length; d += 1) {
    const origin = correspondence.origins[d];
    if (origin === void 0 || origin.kind === "inserted") {
      if (!previousWasInsert) {
        run += 1;
        offset = 0;
      }
      keys.push(`i:${id}:${chainId}:${run}:${offset}`);
      offset += 1;
      previousWasInsert = true;
    } else {
      keys.push(inherited[origin.parentPosition - 1] ?? `r:${id}:${chainId}:${d + 1}`);
      previousWasInsert = false;
    }
  }
  return keys;
}
function buildAlignment(model, chainId = SINGLE_CHAIN_ID) {
  const ordered = inDependencyOrder(model);
  const parentKeys = /* @__PURE__ */ new Map();
  const columns = [];
  const index = /* @__PURE__ */ new Map();
  const reindexFrom = (start) => {
    for (let i = start; i < columns.length; i += 1) index.set(columns[i], i);
  };
  for (const normalized of ordered) {
    const keys = slotKeysFor(normalized, parentKeys, chainId);
    parentKeys.set(normalized.variant.variant_id, keys);
    let cursor = -1;
    let pending = [];
    const flush = () => {
      if (pending.length === 0) return;
      columns.splice(cursor + 1, 0, ...pending);
      reindexFrom(cursor + 1);
      cursor += pending.length;
      pending = [];
    };
    for (const key of keys) {
      if (index.has(key)) {
        flush();
        cursor = index.get(key);
      } else {
        pending.push(key);
      }
    }
    flush();
  }
  const columnOf = /* @__PURE__ */ new Map();
  for (const [variantId, keys] of parentKeys) {
    columnOf.set(variantId, keys.map((key) => index.get(key) ?? 0));
  }
  const reference = model.variants.find((v) => v.variant.construct_role === "reference") ?? model.variants[0];
  const rootVariantId = reference.variant.variant_id;
  const rootColumns = /* @__PURE__ */ new Map();
  const referenceColumns = columnOf.get(rootVariantId) ?? [];
  referenceColumns.forEach((column, i) => rootColumns.set(i + 1, column));
  return { columns, columnOf, rootColumns, rootVariantId, totalColumns: columns.length };
}
function columnRuns(alignment, variantId, start, end) {
  const map = alignment.columnOf.get(variantId);
  if (map === void 0) return [];
  const runs = [];
  for (let position = start; position <= end; position += 1) {
    const column = map[position - 1];
    if (column === void 0) continue;
    const last = runs[runs.length - 1];
    if (last !== void 0 && column === last.to + 1) last.to = column;
    else runs.push({ from: column, to: column });
  }
  return runs;
}
function occupiedRuns(alignment, variantId) {
  const map = alignment.columnOf.get(variantId);
  if (map === void 0) return [];
  return columnRuns(alignment, variantId, 1, map.length);
}
function buildConstructAxis(model, chainId = SINGLE_CHAIN_ID) {
  const columnOf = /* @__PURE__ */ new Map();
  let longest = 0;
  for (const normalized of model.variants) {
    const named = normalized.chains.find((c) => c.chain.chain_id === chainId);
    const length = named === void 0 ? 0 : named.length;
    longest = Math.max(longest, length);
    columnOf.set(
      normalized.variant.variant_id,
      Array.from({ length }, (_, index) => index)
    );
  }
  const rootColumns = /* @__PURE__ */ new Map();
  for (let position = 1; position <= longest; position += 1) rootColumns.set(position, position - 1);
  return {
    columns: Array.from({ length: longest }, (_, index) => `p:${index + 1}`),
    columnOf,
    rootColumns,
    rootVariantId: model.variants[0]?.variant.variant_id ?? "",
    totalColumns: longest
  };
}
function isAssemblyRecord(model) {
  return model.record.variants.some(
    (variant) => variant.assembly !== void 0 || (variant.chains ?? []).some((chain) => chain.assembly !== void 0)
  );
}

// src/tracks.ts
function paintableTracks(tracks) {
  return (tracks ?? []).filter((track) => (track.target_kind ?? "variant") === "variant");
}
function monomersOf(chain) {
  const out = /* @__PURE__ */ new Map();
  for (const entry of chain.chemistry?.residues ?? []) out.set(entry.position, entry.monomer);
  return out;
}
function resolveSites(model, alignmentOrMap, sites, options = {}) {
  const propagate = options.propagate ?? true;
  const out = [];
  const byChain = alignmentOrMap instanceof Map ? alignmentOrMap : /* @__PURE__ */ new Map([[SINGLE_CHAIN_ID, alignmentOrMap]]);
  for (const site of sites) {
    const source = model.variants.find((v) => v.variant.variant_id === site.applies_to);
    if (source === void 0) continue;
    const claimsByChain = /* @__PURE__ */ new Map();
    for (const residue of site.residues) {
      const chainId = residue.chain_id ?? defaultChainId(source.chains.map((c) => c.chain));
      const list = claimsByChain.get(chainId) ?? [];
      list.push(residue);
      claimsByChain.set(chainId, list);
    }
    const siteChainIds = [...claimsByChain.keys()];
    for (const [chainId, claims] of claimsByChain) {
      const alignment = byChain.get(chainId);
      if (alignment === void 0) continue;
      const sourceChain = source.chains.find((c) => c.chain.chain_id === chainId);
      if (sourceChain === void 0) continue;
      const sourceColumns = alignment.columnOf.get(site.applies_to) ?? [];
      const sourceSequence = sourceChain.chain.sequence;
      const sourceMonomers = monomersOf(sourceChain.chain);
      const wanted = /* @__PURE__ */ new Map();
      for (const residue of claims) {
        const column = sourceColumns[residue.position - 1];
        if (column === void 0) continue;
        wanted.set(column, {
          letter: sourceSequence[residue.position - 1] ?? "",
          monomer: sourceMonomers.get(residue.position)
        });
      }
      for (const normalized of model.variants) {
        const variantId = normalized.variant.variant_id;
        if (!propagate && variantId !== site.applies_to) continue;
        const columns = alignment.columnOf.get(variantId) ?? [];
        const rowChain = normalized.chains.find((c) => c.chain.chain_id === chainId);
        if (rowChain === void 0) continue;
        const sequence = rowChain.chain.sequence;
        const rowMonomers = monomersOf(rowChain.chain);
        const chainMissing = siteChainIds.some(
          (needed) => !normalized.chains.some((c) => c.chain.chain_id === needed)
        );
        const positions = [];
        let substituted = 0;
        for (let position = 1; position <= sequence.length; position += 1) {
          const column = columns[position - 1];
          if (column === void 0) continue;
          const expected = wanted.get(column);
          if (expected === void 0) continue;
          positions.push(position);
          if (sequence[position - 1] !== expected.letter || rowMonomers.get(position) !== expected.monomer) {
            substituted += 1;
          }
        }
        if (positions.length === 0) continue;
        const retained = positions.length - substituted;
        out.push({
          siteId: site.site_id,
          variantId,
          chainId,
          positions,
          origin: variantId === site.applies_to ? "declared" : "mapped",
          retained,
          total: wanted.size,
          substituted,
          // `complete` describes the whole SITE. Computed from one chain's share
          // it would call a surviving fragment complete: with chain B deleted from
          // a two-chain interface, chain A's entry would read complete:true,
          // total:1, no partial-site warning would fire, and half an interface
          // would be presented as the whole.
          complete: positions.length === wanted.size && substituted === 0 && !chainMissing,
          siteTotal: site.residues.length,
          chainMissing
        });
      }
    }
  }
  return out;
}

// src/text.ts
var NORMAL_WIDTHS = [
  [0.6362, "$0123456789{}"],
  [0.8379, "#+<=>^~\xD7\u2190\u2192\u2212"],
  [0.3179, " ,.\xB7\u2018\u2019"],
  [0.6348, "Sbdgpq"],
  [0.3369, "/:;\\|"],
  [0.5, "*_`\xB0\u2013"],
  [0.3901, "()[]"],
  [0.2778, "ijl"],
  [0.5918, "vxy"],
  [0.6118, "o\xAB\xBB"],
  [0.6338, "hnu"],
  [0.6841, "V\xC5\u0394"],
  [1, "@\u2014\u2026"],
  [0.2949, "IJ"],
  [0.5181, "\u201C\u201D"],
  [0.6851, "XZ"],
  [0.7871, "OQ"],
  [0.2749, "'"],
  [0.3445, "f"],
  [0.3608, "-"],
  [0.3921, "t"],
  [0.3953, "r"],
  [0.4009, "!"],
  [0.46, '"'],
  [0.521, "s"],
  [0.5249, "z"],
  [0.5308, "?"],
  [0.5498, "c"],
  [0.5571, "L"],
  [0.5752, "F"],
  [0.5791, "k"],
  [0.595, "T"],
  [0.603, "P"],
  [0.6108, "Y"],
  [0.6128, "a"],
  [0.6152, "e"],
  [0.6318, "E"],
  [0.6558, "K"],
  [0.686, "B"],
  [0.6948, "R"],
  [0.6982, "C"],
  [0.7091, "A"],
  [0.7319, "U"],
  [0.748, "N"],
  [0.752, "H"],
  [0.77, "D"],
  [0.7749, "G"],
  [0.7798, "&"],
  [0.8179, "w"],
  [0.8628, "M"],
  [0.9502, "%"],
  [0.9741, "m"],
  [0.9888, "W"]
];
var BOLD_WIDTHS = [
  [0.6958, "$0123456789"],
  [0.8379, "#+<=>^~\xD7\u2190\u2192\u2212"],
  [0.3799, ",.\xB7\u2018\u2019"],
  [0.7119, "hnu{}"],
  [0.7158, "bdgpq"],
  [0.457, "()[]"],
  [0.5, "_`\xB0\u2013"],
  [0.7739, "AV\xC5\u0394"],
  [0.3428, "ijl"],
  [0.3652, "/\\|"],
  [1, "@\u2014\u2026"],
  [0.3721, "IJ"],
  [0.3999, ":;"],
  [0.646, "\xAB\xBB"],
  [0.6519, "vy"],
  [0.6572, "\u201C\u201D"],
  [0.6831, "EF"],
  [0.8369, "HN"],
  [0.8501, "OQ"],
  [0.3062, "'"],
  [0.3481, " "],
  [0.405, "f"],
  [0.415, "-"],
  [0.4561, "!"],
  [0.478, "t"],
  [0.4932, "r"],
  [0.521, '"'],
  [0.523, "*"],
  [0.5801, "?"],
  [0.582, "z"],
  [0.5928, "c"],
  [0.5952, "s"],
  [0.6372, "L"],
  [0.645, "x"],
  [0.665, "k"],
  [0.6748, "a"],
  [0.6782, "e"],
  [0.6798, "S"],
  [0.687, "o"],
  [0.7028, "T"],
  [0.7241, "Y"],
  [0.7251, "Z"],
  [0.7329, "P"],
  [0.7339, "C"],
  [0.7622, "B"],
  [0.77, "R"],
  [0.771, "X"],
  [0.7749, "K"],
  [0.812, "U"],
  [0.8208, "G"],
  [0.8301, "D"],
  [0.8721, "&"],
  [0.9238, "w"],
  [0.9951, "M"],
  [1.002, "%"],
  [1.042, "m"],
  [1.103, "W"]
];
var FALLBACK_EM = 1;
function toMap(table) {
  const map = /* @__PURE__ */ new Map();
  for (const [width, characters] of table) {
    for (const character of characters) map.set(character, width);
  }
  return map;
}
var NORMAL = toMap(NORMAL_WIDTHS);
var BOLD = toMap(BOLD_WIDTHS);
function textWidth(text, fontSize, bold = false) {
  const table = bold ? BOLD : NORMAL;
  let em = 0;
  for (const character of text) em += table.get(character) ?? FALLBACK_EM;
  return em * fontSize;
}
function truncateToWidth(text, fontSize, maxWidth, bold = false) {
  if (textWidth(text, fontSize, bold) <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && textWidth(`${cut}\u2026`, fontSize, bold) > maxWidth) {
    cut = cut.slice(0, -1).trimEnd();
  }
  return `${cut}\u2026`;
}

// src/viewport.ts
var RESIDUE_FONT_MAX = 13;
var RESIDUE_FONT_MIN = 9;
var RESIDUE_ADVANCE_EM = 0.6021;
var RESIDUE_COLUMN_FILL = 0.84;
var RESIDUE_LETTER_PX = Math.ceil(RESIDUE_FONT_MIN / 1.4);
function residueFontSize(pxPerColumn) {
  return Math.min(RESIDUE_FONT_MAX, pxPerColumn * RESIDUE_COLUMN_FILL / RESIDUE_ADVANCE_EM);
}
var RESIDUE_INK_EM = 0.605;
function residueGlyphWidth(fontSize) {
  return Math.ceil(fontSize * RESIDUE_INK_EM);
}
var RESIDUE_CELL_PX = 4;
var PINNED_FONT = 12;
var TRACK_GAP = 10;
var NAME_HEIGHT = 20;
var BAND_HEIGHT = 30;
var LABEL_LANE = 16;
var AXIS_HEIGHT = 40;
var REGION_STRIP = 15;
var BOND_STRIP = 16;
var CONJUGATE_STRIP = 27;
function niceStep(columnsVisible, target) {
  const raw = columnsVisible / Math.max(1, target);
  for (const candidate of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1e3, 2e3]) {
    if (candidate >= raw) return candidate;
  }
  return 5e3;
}
function basisFor(role, provenance) {
  if (role === "reference") return { basis: "reference", label: "Reference", short: "Reference" };
  if (provenance === "declared") {
    return { basis: "declared", label: "Aligned on declared edits", short: "declared" };
  }
  if (provenance === "derived") {
    return {
      basis: "derived",
      label: "Aligned on correspondence derived from the sequences",
      short: "derived"
    };
  }
  return {
    basis: "none",
    label: "No correspondence to the reference",
    short: "unaligned"
  };
}
function axisTicks(frame, alignment) {
  const { width, from, to, columnsVisible, xOf } = frame;
  const ticks = [];
  const step = niceStep(columnsVisible, width < 480 ? 4 : width < 900 ? 7 : 10);
  for (const [position, column] of alignment.rootColumns) {
    if (column < from - 1 || column > to + 1) continue;
    if (position % step !== 0 && position !== 1) continue;
    const label = String(position);
    const half = textWidth(label, 10.5) / 2;
    const tickX = xOf(column + 0.5);
    ticks.push({
      x: tickX,
      labelX: Math.max(half, Math.min(tickX, width - half)),
      label,
      column
    });
  }
  return ticks;
}
function chemistryMarks(frame, row) {
  const { from, to, pxPerColumn, xOf } = frame;
  const { normalized, nchain, chainId, columnsForVariant } = row;
  const declaredMonomers = /* @__PURE__ */ new Map();
  for (const entry of nchain.chain.chemistry?.residues ?? []) {
    declaredMonomers.set(entry.position, entry.monomer);
  }
  const bondsAt = /* @__PURE__ */ new Map();
  const bondTies = [];
  const bondAnchors = [];
  const conjugateMarks = [];
  for (const bond of normalized.variant.chemistry?.bonds ?? []) {
    const ends = [bond.a, bond.b].map((end) => ({
      chainId: end.chain_id ?? chainId,
      copy: end.copy ?? 1,
      position: end.position
    }));
    const mine = ends.filter((end) => end.chainId === chainId);
    for (const end of mine) {
      const list = bondsAt.get(end.position) ?? [];
      list.push(bond.bond_id);
      bondsAt.set(end.position, list);
    }
    const describe2 = (end) => end.chainId === chainId ? `copy ${end.copy} residue ${end.position}` : `${end.chainId} ${end.position}`;
    const anchorEnd = (here, other) => {
      const column = columnsForVariant[here.position - 1];
      if (column === void 0) return;
      bondAnchors.push({
        bondId: bond.bond_id,
        kind: bond.kind,
        x: xOf(column) + pxPerColumn / 2,
        position: here.position,
        partner: describe2(other)
      });
    };
    if (mine.length === 1) {
      const other = ends.find((end) => end !== mine[0]);
      if (other !== void 0) anchorEnd(mine[0], other);
      continue;
    }
    if (mine.length === 2 && mine[0].copy !== mine[1].copy) {
      anchorEnd(mine[0], mine[1]);
      anchorEnd(mine[1], mine[0]);
      continue;
    }
    if (mine.length !== 2) continue;
    const columns = mine.map((end) => columnsForVariant[end.position - 1]);
    if (columns[0] === void 0 || columns[1] === void 0) continue;
    bondTies.push({
      bondId: bond.bond_id,
      kind: bond.kind,
      fromX: xOf(columns[0]) + pxPerColumn / 2,
      toX: xOf(columns[1]) + pxPerColumn / 2,
      fromPosition: mine[0].position,
      toPosition: mine[1].position
    });
  }
  for (const conjugate of normalized.variant.chemistry?.conjugates ?? []) {
    if ((conjugate.anchor.chain_id ?? chainId) !== chainId) continue;
    const column = columnsForVariant[conjugate.anchor.position - 1];
    if (column === void 0) continue;
    const names = conjugate.units.map((unit) => unit.monomer);
    conjugateMarks.push({
      conjugateId: conjugate.conjugate_id,
      x: xOf(column) + pxPerColumn / 2,
      position: conjugate.anchor.position,
      label: names.join("\xB7"),
      title: `${conjugate.conjugate_id}: ${names.join(", then ")} hang from residue ${conjugate.anchor.position}` + (conjugate.anchor.copy === void 0 ? "" : ` (copy ${conjugate.anchor.copy})`)
    });
  }
  const caps = [];
  for (const cap of nchain.chain.chemistry?.caps ?? []) {
    const position = cap.terminus === "N" ? 1 : nchain.chain.sequence.length;
    const column = columnsForVariant[position - 1];
    if (column === void 0) continue;
    caps.push({
      terminus: cap.terminus,
      monomer: cap.monomer,
      x: cap.terminus === "N" ? xOf(column) : xOf(column) + pxPerColumn
    });
  }
  return { declaredMonomers, bondsAt, bondTies, bondAnchors, conjugateMarks, caps };
}
function rowHeading(frame, row) {
  const { width, to } = frame;
  const { nchain, variant } = row;
  const roleLabel2 = variant.construct_role === "reference" ? "Reference" : variant.construct_role === "control" ? "Control" : "Candidate";
  const { basis, label: basisLabel, short: basisShort } = basisFor(
    variant.construct_role,
    // The CHAIN's correspondence. normalize.ts deliberately empties the
    // variant-level one once either side has several chains, so reading it
    // here would report "no correspondence" for a chain whose own edits are
    // declared and verified.
    nchain.correspondence.provenance
  );
  const fullBasis = nchain.correspondence.ambiguous ? `${basisLabel} \xB7 position ambiguous` : basisLabel;
  const basisX = textWidth(variant.name, 13, true) + 12;
  const lengthLabel = chainLengthLabel(nchain.length, nchain.chain.copies);
  const metaWidth = textWidth(`${roleLabel2}  \xB7  ${lengthLabel}`, 11);
  const basisRoom = width - basisX - metaWidth - 16;
  const basisDisplay = basisRoom >= textWidth(fullBasis, 10) ? fullBasis : basisRoom >= textWidth(basisShort, 10) ? basisShort : "";
  return { roleLabel: roleLabel2, basis, basisLabel, basisDisplay, basisX, lengthLabel };
}
function regionBand(frame, row, bandY, bondStrip) {
  const { model, width, from, to, pxPerColumn, residueDisplay, xOf } = frame;
  const { variant, variantId, chainId, chainAlignment } = row;
  const segments = [];
  const outsideLabels = [];
  const outsideLaneEnds = [];
  for (const feature of variant.features.filter(
    (f) => (f.chain_id ?? chainId) === chainId
  )) {
    const runs = chainAlignment === null ? [] : columnRuns(chainAlignment, variantId, feature.start, feature.end);
    const region = model.regions.get(feature.region_id);
    const fullLabel = feature.label ?? region?.name ?? feature.region_id;
    const paint = model.paint.get(feature.region_id) ?? "neutral";
    const widest = runs.reduce(
      (best, run) => run.to - run.from > best.to - best.from ? run : best,
      runs[0] ?? { from: 0, to: 0 }
    );
    for (const run of runs) {
      if (run.to < from - 1 || run.from > to + 1) continue;
      const x = xOf(run.from);
      const segmentWidth = (run.to - run.from + 1) * pxPerColumn;
      const isWidest = run === widest;
      const fits = textWidth(fullLabel, 12) + 14 <= segmentWidth;
      segments.push({
        instanceId: feature.instance_id,
        regionId: feature.region_id,
        kind: region?.kind ?? "other",
        paint,
        evidence: feature.evidence ?? "unknown",
        label: fullLabel,
        fullLabel,
        start: feature.start,
        end: feature.end,
        residues: feature.end - feature.start + 1,
        fromColumn: run.from,
        toColumn: run.to,
        x,
        width: Math.max(1, segmentWidth),
        split: runs.length > 1,
        showLabel: isWidest && fits && !residueDisplay,
        labelX: x + segmentWidth / 2
      });
      if (isWidest && !fits && !residueDisplay) {
        const text = truncateToWidth(fullLabel, 11.5, Math.max(40, segmentWidth + 60));
        const labelWidth = textWidth(text, 11.5);
        const left = Math.max(0, Math.min(x, width - labelWidth));
        let lane = outsideLaneEnds.findIndex((end) => left > end + 8);
        if (lane < 0) lane = outsideLaneEnds.length;
        outsideLaneEnds[lane] = left + labelWidth;
        outsideLabels.push({
          instanceId: feature.instance_id,
          text,
          x: left,
          y: bandY + BAND_HEIGHT + bondStrip + 12 + lane * LABEL_LANE
        });
      }
    }
  }
  return { segments, outsideLabels, outsideLaneEnds };
}
function backboneSpans(frame, row) {
  const { width, from, to, pxPerColumn, xOf } = frame;
  const { variantId, chainAlignment } = row;
  const backbone = [];
  for (const run of chainAlignment === null ? [] : occupiedRuns(chainAlignment, variantId)) {
    if (run.to < from - 1 || run.from > to + 1) continue;
    backbone.push({ x: xOf(run.from), width: (run.to - run.from + 1) * pxPerColumn });
  }
  return backbone;
}
function gapSpans(frame, row) {
  const { width, from, to, pxPerColumn, xOf } = frame;
  const { columnsForVariant } = row;
  const gaps = [];
  const occupied = new Set(columnsForVariant);
  const first = columnsForVariant[0] ?? 0;
  const last = columnsForVariant[columnsForVariant.length - 1] ?? 0;
  let gapStart = null;
  for (let column = first; column <= last + 1; column += 1) {
    const inside = column <= last && occupied.has(column);
    if (!inside && gapStart === null && column <= last) gapStart = column;
    else if (inside && gapStart !== null) {
      if (!(gapStart > to || column - 1 < from)) {
        gaps.push({
          fromColumn: gapStart,
          toColumn: column - 1,
          x: xOf(gapStart),
          width: (column - gapStart) * pxPerColumn
        });
      }
      gapStart = null;
    }
  }
  return gaps;
}
function residueCells(frame, row, declaredMonomers, bondsAt) {
  const { options, width, from, to, pxPerColumn, showCells, xOf } = frame;
  const { normalized, nchain, variantId, chainId, columnsForVariant } = row;
  const residues = [];
  if (showCells) {
    const lowColumn = Math.floor(from) - 1;
    const highColumn = Math.ceil(to) + 1;
    for (let position = 1; position <= columnsForVariant.length; position += 1) {
      const column = columnsForVariant[position - 1];
      if (column < lowColumn || column > highColumn) continue;
      const origin = nchain.correspondence.origins[position - 1];
      const trackApplies = options.track !== void 0 && options.track.chainId === chainId;
      const trackValues = trackApplies ? options.track.values.get(variantId) : void 0;
      const trackProvenance = trackApplies ? options.track.provenance.get(variantId) : void 0;
      const siteIds = options.sites?.get(chainId)?.get(variantId)?.get(position) ?? [];
      residues.push({
        column,
        position,
        letter: nchain.chain.sequence[position - 1] ?? "",
        x: xOf(column),
        width: pxPerColumn,
        ...declaredMonomers.has(position) ? { monomer: declaredMonomers.get(position) } : {},
        ...bondsAt.has(position) ? { bonds: bondsAt.get(position) } : {},
        origin: normalized.parent === null ? "reference" : origin === void 0 ? "retained" : origin.kind,
        value: trackValues?.[position - 1] ?? null,
        trackProvenance: trackProvenance?.[position - 1] ?? null,
        sites: siteIds
      });
    }
  }
  return residues;
}
function siteMarkRuns(frame, row) {
  const { options, width, from, to, pxPerColumn, showCells, xOf } = frame;
  const { variantId, chainId, columnsForVariant } = row;
  const siteMarks = [];
  const siteMap = options.sites?.get(chainId)?.get(variantId);
  if (siteMap !== void 0) {
    const lowColumn = Math.floor(from) - 1;
    const highColumn = Math.ceil(to) + 1;
    const runs = /* @__PURE__ */ new Map();
    for (let position = 1; position <= columnsForVariant.length; position += 1) {
      const column = columnsForVariant[position - 1];
      if (column < lowColumn || column > highColumn) continue;
      for (const siteId of siteMap.get(position) ?? []) {
        const list = runs.get(siteId) ?? [];
        const last = list[list.length - 1];
        if (last !== void 0 && column === last.to + 1) last.to = column;
        else list.push({ from: column, to: column });
        runs.set(siteId, list);
      }
    }
    for (const [siteId, list] of runs) {
      for (const run of list) {
        siteMarks.push({
          siteId,
          title: options.siteLabels?.get(siteId) ?? siteId,
          x: xOf(run.from),
          width: (run.to - run.from + 1) * pxPerColumn
        });
      }
    }
  }
  return siteMarks;
}
function pinnedLabelsFor(frame, segments) {
  const { width, from, to, residueDisplay } = frame;
  const pinnedLabels = [];
  if (residueDisplay) {
    const seen = /* @__PURE__ */ new Set();
    for (const segment of segments) {
      if (seen.has(segment.instanceId)) continue;
      seen.add(segment.instanceId);
      const visibleFrom = Math.max(0, segment.x);
      const visibleTo = Math.min(width, segment.x + segment.width);
      const room = visibleTo - visibleFrom - 6;
      if (room < 18) continue;
      pinnedLabels.push({
        instanceId: segment.instanceId,
        regionId: segment.regionId,
        // Pinned names are drawn semibold (see .cm-pinned), so they are
        // measured semibold. A browser also rounds a text box up to whole
        // pixels, so a little more room is left than the metrics demand.
        text: truncateToWidth(segment.fullLabel, PINNED_FONT, room - 2, true),
        x: visibleFrom + 3
      });
    }
  }
  return pinnedLabels;
}
function layoutRow(frame, byChain, normalized, nchain, y) {
  const { options, residueDisplay } = frame;
  const { variant } = normalized;
  const variantId = variant.variant_id;
  const chainId = nchain.chain.chain_id;
  const multiChain = normalized.chains.length > 1;
  const chainAlignment = byChain.get(chainId) ?? null;
  const columnsForVariant = chainAlignment?.columnOf.get(variantId) ?? [];
  const row = {
    normalized,
    nchain,
    variant,
    variantId,
    chainId,
    chainAlignment,
    columnsForVariant
  };
  const { declaredMonomers, bondsAt, bondTies, bondAnchors, conjugateMarks, caps } = chemistryMarks(
    frame,
    row
  );
  const { roleLabel: roleLabel2, basis, basisLabel, basisDisplay, basisX, lengthLabel } = rowHeading(frame, row);
  const bondStrip = conjugateMarks.length > 0 ? CONJUGATE_STRIP : bondTies.length > 0 || bondAnchors.length > 0 ? BOND_STRIP : 0;
  const headerHeight = options.rowHeader === false ? 0 : NAME_HEIGHT;
  const nameY = y + 14;
  const bandY = y + headerHeight + (residueDisplay ? REGION_STRIP : 0);
  const { segments, outsideLabels, outsideLaneEnds } = regionBand(frame, row, bandY, bondStrip);
  const backbone = backboneSpans(frame, row);
  const gaps = gapSpans(frame, row);
  const residues = residueCells(frame, row, declaredMonomers, bondsAt);
  const siteMarks = siteMarkRuns(frame, row);
  const pinnedLabels = pinnedLabelsFor(frame, segments);
  const laneCount = outsideLaneEnds.length;
  const height = headerHeight + (residueDisplay ? REGION_STRIP : 0) + BAND_HEIGHT + bondStrip + laneCount * LABEL_LANE + TRACK_GAP;
  return {
    variantId,
    chainId,
    chainName: nchain.chain.name,
    multiChain,
    copies: nchain.chain.copies ?? 1,
    name: multiChain ? `${variant.name} \u2014 ${nchain.chain.name}` : variant.name,
    role: variant.construct_role,
    roleLabel: roleLabel2,
    // The CHAIN's length. normalized.length is the longest chain, which for
    // a heterodimer is not this row's length.
    lengthLabel,
    note: variant.note ?? null,
    basis,
    basisLabel,
    basisDisplay,
    basisX,
    ambiguous: nchain.correspondence.ambiguous,
    y,
    height,
    nameY,
    bandY,
    bandHeight: BAND_HEIGHT,
    backbone,
    segments,
    residues,
    gaps,
    siteMarks,
    pinnedLabels,
    outsideLabels,
    caps,
    bondTies,
    bondAnchors,
    conjugateMarks
  };
}
function layoutView(model, alignmentOrMap, options) {
  const byChain = alignmentOrMap instanceof Map ? alignmentOrMap : /* @__PURE__ */ new Map([[SINGLE_CHAIN_ID, alignmentOrMap]]);
  const alignment = [...byChain.values()].reduce(
    (widest, next) => widest === null || next.totalColumns > widest.totalColumns ? next : widest,
    null
  ) ?? alignmentOrMap;
  const width = Math.max(240, options.width);
  const from = options.viewport.from;
  const to = options.viewport.to;
  const columnsVisible = Math.max(1, to - from);
  const pxPerColumn = width / columnsVisible;
  const showLetters = options.residueView === true || options.residueView !== false && pxPerColumn >= RESIDUE_LETTER_PX;
  const residueDisplay = options.residueView === true || showLetters;
  const colorMode = options.colorMode ?? "region";
  const axisMode = options.axisMode ?? "alignment";
  const paintingTrack = colorMode === "track" && options.track !== void 0;
  const showCells = options.residueView === true || pxPerColumn >= RESIDUE_CELL_PX || paintingTrack;
  const xOf = (column) => (column - from) * pxPerColumn;
  const frame = {
    model,
    options,
    width,
    from,
    to,
    columnsVisible,
    pxPerColumn,
    residueDisplay,
    showCells,
    xOf
  };
  const ticks = axisTicks(frame, alignment);
  let cursor = AXIS_HEIGHT;
  const tracks = [];
  for (const normalized of model.variants) {
    for (const nchain of normalized.chains) {
      const row = layoutRow(frame, byChain, normalized, nchain, cursor);
      tracks.push(row);
      cursor += row.height;
    }
  }
  return {
    width,
    // 8 px of bottom margin below the last row.
    height: cursor + 8,
    viewport: { from, to },
    pxPerColumn,
    showLetters,
    residueView: options.residueView === true,
    residueFont: residueFontSize(pxPerColumn),
    showCells,
    colorMode,
    paintingTrack,
    axisMode,
    // The coordinate caption sits on its own line above the ticks so it does
    // not share a baseline with the tick labels; both baselines lie inside the
    // AXIS_HEIGHT strip.
    axisLabelY: 12,
    axisY: 32,
    ticks,
    tracks,
    totalColumns: alignment.totalColumns,
    axisLabel: fitAxisLabel(axisMode, model, alignment, width)
  };
}
function fitAxisLabel(axisMode, model, alignment, width) {
  const candidates = axisMode === "chains" ? [
    "Residue position \u2014 each chain numbered from its own N-terminus; rows of different chains are not aligned to one another",
    "Residue position \u2014 each chain from its own N-terminus",
    "Each chain from its own N-terminus",
    "Chains not aligned"
  ] : axisMode === "construct" ? [
    "Residue position \u2014 each construct numbered from its own N-terminus; rows are not aligned to one another",
    "Residue position \u2014 each construct from its own N-terminus, rows not aligned",
    "Each construct from its own N-terminus",
    "Not aligned"
  ] : [
    `Residue position in ${model.variants.find((v) => v.variant.variant_id === alignment.rootVariantId)?.variant.name ?? "the reference"}`,
    "Residue position in the reference",
    "Reference position"
  ];
  for (const candidate of candidates) {
    if (textWidth(candidate, 10.5) <= width - 4) return candidate;
  }
  return truncateToWidth(candidates[candidates.length - 1], 10.5, Math.max(20, width - 4));
}

// src/render.ts
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function inertJson(json) {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
var r2 = (value) => (Math.round(value * 100) / 100).toString();
function evidenceAttrs(evidence, paint) {
  const style = EVIDENCE_STYLES[evidence];
  const colour = tokenVar(paint);
  const dash = style.strokeDasharray === null ? "" : ` stroke-dasharray="${style.strokeDasharray}"`;
  return `fill="${colour}" fill-opacity="${style.fillOpacity}" stroke="${colour}" stroke-width="1.25" stroke-opacity="${style.strokeOpacity}"${dash}`;
}
function styleBlock(scope, options) {
  return `${themeCss(scope, options.theme)}
${scope}{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
${scope} text{fill:var(--cm-text-primary)}
${scope} .cm-tick{font-size:10.5px;fill:var(--cm-text-muted);font-variant-numeric:tabular-nums}
${scope} .cm-tickline{stroke:var(--cm-border);stroke-width:1;opacity:.55}
${scope} .cm-axis-label{font-size:10.5px;fill:var(--cm-text-muted)}
${scope} .cm-track-name{font-size:13px;font-weight:600}
${scope} .cm-track-meta{font-size:11px;fill:var(--cm-text-secondary);font-variant-numeric:tabular-nums}
${scope} .cm-basis{font-size:10px;fill:var(--cm-text-muted)}
${scope} .cm-backbone{fill:var(--cm-track)}
${scope} .cm-gap{stroke:var(--cm-border-strong);stroke-width:1;stroke-dasharray:3 3;opacity:.8;fill:none}
${scope} .cm-seg{pointer-events:none}
${scope} .cm-seg-label{font-size:12px;font-weight:500;pointer-events:none;paint-order:stroke;stroke:var(--cm-surface);stroke-width:2.5px;stroke-linejoin:round}
${scope} .cm-outside-label{font-size:11.5px;fill:var(--cm-text-secondary);pointer-events:none}
${scope} .cm-pinned{font-size:${PINNED_FONT}px;font-weight:600;fill:var(--cm-text-secondary);pointer-events:none}
${scope} .cm-residue{text-anchor:middle;pointer-events:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
${scope} .cm-residue[data-origin="inserted"]{font-weight:700}
${scope} .cm-residue[data-origin="substituted"]{font-weight:700;fill:var(--cm-series-orange)}
${scope} .cm-residue[data-monomer]{font-weight:700}
${scope} .cm-chem-rule{stroke:var(--cm-edit-ink);stroke-width:1.25;pointer-events:none}
${scope} .cm-chem-name{text-anchor:middle;fill:var(--cm-edit-ink);font-weight:600;pointer-events:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;paint-order:stroke;stroke:var(--cm-surface);stroke-width:2px;stroke-linejoin:round}
${scope} .cm-bond-tie{fill:none;stroke:var(--cm-edit-ink);stroke-width:1.5;pointer-events:none}
${scope} .cm-bond-tie[data-kind="backbone"]{stroke-dasharray:5 2.5}
${scope} .cm-bond-tie[data-kind="amide"]{stroke-dasharray:1.5 2}
${scope} .cm-bond-tie[data-kind="thioester"]{stroke-dasharray:7 2 1.5 2}
${scope} .cm-bond-tie[data-kind="other"]{stroke-dasharray:1 2.5;stroke-linecap:round}
${scope} .cm-bond-anchor{fill:var(--cm-edit-ink);pointer-events:none}
${scope} .cm-conjugate{pointer-events:none}
${scope} .cm-conjugate-stem{stroke:var(--cm-edit-ink);stroke-width:1.5;fill:none}
${scope} .cm-conjugate-node{fill:var(--cm-edit-ink)}
${scope} .cm-cap{pointer-events:none}
${scope} .cm-cap-rule{stroke:var(--cm-edit-ink);stroke-width:2;pointer-events:none}
${scope} .cm-cap-label{font-size:9.5px;text-anchor:middle;fill:var(--cm-edit-ink);font-weight:600;pointer-events:none;paint-order:stroke;stroke:var(--cm-surface);stroke-width:2px;stroke-linejoin:round}
${scope} .cm-cell{stroke:none}
${scope} .cm-cell-empty{fill:none;stroke:var(--cm-border-strong);stroke-width:.75;stroke-dasharray:1.5 1.5;opacity:.7}
${scope} .cm-seg[data-outline="true"] rect{fill-opacity:0}
${scope} .cm-site{fill:var(--cm-edit-ink);opacity:.85}
${scope} .cm-site-rule{stroke:var(--cm-edit-ink);stroke-width:2;opacity:.85}
${scope} .cm-hit{fill:transparent;cursor:pointer}
${scope} .cm-seg[data-dim="true"]{opacity:.3}
${scope} .cm-seg[data-selected="true"] rect{stroke-width:2.5}
${scope} .cm-focus{fill:none;stroke:var(--cm-text-primary);stroke-width:2.5;pointer-events:none;opacity:0}
${scope} .cm-seg:focus-visible .cm-focus{opacity:1}
${scope} .cm-cursor{stroke:var(--cm-text-primary);stroke-width:1;opacity:.45;pointer-events:none}
${scope} .cm-track-row[data-active="true"] .cm-track-name{text-decoration:underline;text-underline-offset:3px}`;
}
function trackHeaderParts(track, layout, options) {
  const parts = [];
  if (options.rowHeaderInSvg !== false) {
    parts.push(
      `<text class="cm-track-name" x="0" y="${r2(track.nameY)}">${escapeXml(track.name)}</text>`
    );
    parts.push(
      `<text class="cm-track-meta" x="${r2(layout.width)}" y="${r2(track.nameY)}" text-anchor="end">${escapeXml(track.roleLabel)}  \xB7  ${escapeXml(track.lengthLabel)}</text>`
    );
    if (track.basisDisplay !== "") {
      parts.push(
        `<text class="cm-basis" x="${r2(track.basisX)}" y="${r2(track.nameY)}"><title>${escapeXml(track.basisLabel)}</title>${escapeXml(track.basisDisplay)}</text>`
      );
    }
  }
  return parts;
}
function backboneParts(track) {
  const parts = [];
  for (const span2 of track.backbone) {
    parts.push(
      `<rect class="cm-backbone" x="${r2(span2.x)}" y="${r2(track.bandY)}" width="${r2(span2.width)}" height="${r2(track.bandHeight)}" rx="3" opacity="0.35"/>`
    );
  }
  return parts;
}
function gapParts(track) {
  const parts = [];
  for (const gap of track.gaps) {
    const mid = track.bandY + track.bandHeight / 2;
    parts.push(
      `<g><title>${escapeXml(
        `No residues here: columns ${gap.fromColumn + 1}\u2013${gap.toColumn + 1} are absent from this construct`
      )}</title><path class="cm-gap" d="M${r2(gap.x)} ${r2(mid)} L${r2(gap.x + gap.width)} ${r2(mid)}"/></g>`
    );
  }
  return parts;
}
function segmentParts(track, layout, options) {
  const parts = [];
  const interactive = options.interactive === true;
  for (const segment of track.segments) {
    const tooltip = `${segment.fullLabel} \xB7 ${segment.start}\u2013${segment.end} (${segment.residues} aa) \xB7 ${EVIDENCE_STYLES[segment.evidence].description}`;
    const attrs = [
      'class="cm-seg"',
      `data-outline="${layout.paintingTrack ? "true" : "false"}"`,
      `data-instance-id="${escapeXml(segment.instanceId)}"`,
      `data-region-id="${escapeXml(segment.regionId)}"`,
      // Paint token and evidence status, exposed for inspection and external
      // styling. No rule in this stylesheet and no code in app.ts reads them.
      `data-paint="${escapeXml(segment.paint)}"`,
      `data-evidence="${escapeXml(segment.evidence)}"`,
      `data-variant-id="${escapeXml(track.variantId)}"`,
      // The chain as well as the construct. The keyboard and segment-link
      // handlers read data-chain-id; without it they fall back to `_single`
      // and resolve the wrong chain's column map.
      `data-chain-id="${escapeXml(track.chainId)}"`,
      `data-start="${segment.start}"`,
      `data-end="${segment.end}"`
    ];
    if (interactive) {
      attrs.push('tabindex="0"', 'role="button"', `aria-label="${escapeXml(tooltip)}"`);
    }
    const inner = [
      `<title>${escapeXml(tooltip)}</title>`,
      `<rect x="${r2(segment.x)}" y="${r2(track.bandY)}" width="${r2(segment.width)}" height="${r2(track.bandHeight)}" rx="3" fill="var(--cm-surface)"/>`,
      `<rect x="${r2(segment.x)}" y="${r2(track.bandY)}" width="${r2(segment.width)}" height="${r2(track.bandHeight)}" rx="3" ${evidenceAttrs(segment.evidence, segment.paint)}/>`,
      `<rect class="cm-focus" x="${r2(Math.max(1.25, segment.x + 1))}" y="${r2(track.bandY + 1)}" width="${r2(Math.max(2, segment.width - 2))}" height="${r2(track.bandHeight - 2)}" rx="2.5"/>`
    ];
    if (segment.showLabel) {
      inner.push(
        `<text class="cm-seg-label" x="${r2(segment.labelX)}" y="${r2(track.bandY + track.bandHeight / 2 + 4.2)}" text-anchor="middle">${escapeXml(segment.label)}</text>`
      );
    }
    parts.push(`<g ${attrs.join(" ")}>${inner.join("")}</g>`);
  }
  return parts;
}
function measureCellParts(track, layout) {
  const parts = [];
  if (layout.paintingTrack) {
    for (const residue of track.residues) {
      if (residue.value === null) {
        parts.push(
          `<rect class="cm-cell-empty" x="${r2(residue.x + 0.4)}" y="${r2(track.bandY + 3)}" width="${r2(Math.max(0.8, residue.width - 0.8))}" height="${r2(track.bandHeight - 6)}"/>`
        );
        continue;
      }
      const step = sequentialStep(residue.value, SEQUENTIAL_LIGHT.length) + 1;
      parts.push(
        `<rect class="cm-cell" x="${r2(residue.x)}" y="${r2(track.bandY + 2)}" width="${r2(Math.max(0.6, residue.width))}" height="${r2(track.bandHeight - 4)}" fill="var(--cm-seq-${step})"/>`
      );
    }
  }
  return parts;
}
function siteRuleParts(track) {
  const parts = [];
  if (track.siteMarks.length > 0) {
    for (const mark of track.siteMarks) {
      parts.push(
        `<g><title>${escapeXml(mark.title)}</title><path class="cm-site-rule" d="M${r2(mark.x)} ${r2(track.bandY + track.bandHeight + 2.5)} L${r2(mark.x + mark.width)} ${r2(track.bandY + track.bandHeight + 2.5)}"/></g>`
      );
    }
  }
  return parts;
}
function residueLetterParts(track, layout) {
  const parts = [];
  if (layout.showLetters) {
    const half = residueGlyphWidth(layout.residueFont) / 2;
    const insetX = (centre) => Math.min(Math.max(centre, half), layout.width - half);
    for (const residue of track.residues) {
      const centre = insetX(residue.x + residue.width / 2);
      const baseline = track.bandY + track.bandHeight / 2 + layout.residueFont * 0.35;
      parts.push(
        `<text class="cm-residue" data-origin="${residue.origin}"` + (residue.monomer === void 0 ? "" : ` data-monomer="${escapeXml(residue.monomer)}"`) + ` font-size="${r2(layout.residueFont)}" x="${r2(centre)}" y="${r2(baseline)}">${escapeXml(residue.letter)}</text>`
      );
      if (residue.monomer !== void 0) {
        parts.push(
          `<line class="cm-chem-rule" x1="${r2(residue.x + 1)}" x2="${r2(residue.x + residue.width - 1)}" y1="${r2(baseline + 2.5)}" y2="${r2(baseline + 2.5)}"/>`
        );
        parts.push(
          `<text class="cm-chem-name" font-size="${r2(Math.max(7, layout.residueFont * 0.62))}" x="${r2(centre)}" y="${r2(baseline + layout.residueFont * 0.78 + 2)}">${escapeXml(residue.monomer)}</text>`
        );
      }
    }
  }
  return parts;
}
function bondTieParts(track) {
  const parts = [];
  for (const tie of track.bondTies) {
    const from = Math.min(tie.fromX, tie.toX);
    const to = Math.max(tie.fromX, tie.toX);
    const foot = track.bandY + track.bandHeight + 1.5;
    const drop = Math.min(12, Math.max(4, (to - from) * 0.16));
    parts.push(
      `<path class="cm-bond-tie" data-bond-id="${escapeXml(tie.bondId)}" data-kind="${escapeXml(tie.kind)}" d="M ${r2(from)} ${r2(foot)} C ${r2(from)} ${r2(foot + drop)}, ${r2(to)} ${r2(foot + drop)}, ${r2(to)} ${r2(foot)}"><title>${escapeXml(`${tie.kind} bond ${tie.bondId}: ${tie.fromPosition} to ${tie.toPosition}`)}</title></path>`
    );
    for (const x of [from, to]) {
      parts.push(`<circle class="cm-bond-anchor" cx="${r2(x)}" cy="${r2(foot)}" r="1.9"/>`);
    }
  }
  return parts;
}
function bondAnchorParts(track) {
  const parts = [];
  for (const anchor of track.bondAnchors) {
    const foot = track.bandY + track.bandHeight + 1.5;
    parts.push(
      `<g class="cm-bond-anchor-group" data-bond-id="${escapeXml(anchor.bondId)}"><title>${escapeXml(
        `${anchor.kind} bond ${anchor.bondId}: residue ${anchor.position} to ${anchor.partner}, in another chain`
      )}</title><path class="cm-bond-tie" data-kind="${escapeXml(anchor.kind)}" d="M ${r2(anchor.x)} ${r2(foot)} L ${r2(anchor.x)} ${r2(foot + 7)}"/><circle class="cm-bond-anchor" cx="${r2(anchor.x)}" cy="${r2(foot)}" r="1.9"/><text class="cm-cap-label" x="${r2(anchor.x)}" y="${r2(foot + 14)}">${escapeXml(anchor.partner)}</text></g>`
    );
  }
  return parts;
}
function conjugateParts(track, layout) {
  const parts = [];
  for (const mark of track.conjugateMarks) {
    const foot = track.bandY + track.bandHeight + 1.5;
    const half = textWidth(mark.label, 9.5, true) / 2 + 2;
    const labelX = Math.min(Math.max(mark.x, half), layout.width - half);
    parts.push(
      `<g class="cm-conjugate" data-conjugate-id="${escapeXml(mark.conjugateId)}"><title>${escapeXml(mark.title)}</title><path class="cm-conjugate-stem" d="M ${r2(mark.x)} ${r2(foot)} L ${r2(mark.x)} ${r2(foot + 6)}"/><rect class="cm-conjugate-node" x="${r2(mark.x - 2.6)}" y="${r2(foot + 5)}" width="5.2" height="5.2" transform="rotate(45 ${r2(mark.x)} ${r2(foot + 7.6)})"/><text class="cm-cap-label" x="${r2(labelX)}" y="${r2(foot + 19)}">${escapeXml(mark.label)}</text></g>`
    );
  }
  return parts;
}
function capParts(track, layout) {
  const parts = [];
  for (const cap of track.caps) {
    const top = track.bandY + 2;
    const bottom = track.bandY + track.bandHeight - 2;
    const labelHalf = cap.monomer.length * 3 + 2;
    const labelX = Math.min(Math.max(cap.x, labelHalf), layout.width - labelHalf);
    parts.push(
      `<g class="cm-cap" data-terminus="${cap.terminus}"><title>${escapeXml(`${cap.terminus}-terminus capped with ${cap.monomer}`)}</title><line class="cm-cap-rule" x1="${r2(cap.x)}" x2="${r2(cap.x)}" y1="${r2(top)}" y2="${r2(bottom)}"/><text class="cm-cap-label" x="${r2(labelX)}" y="${r2(top - 2.5)}">${escapeXml(cap.monomer)}</text></g>`
    );
  }
  return parts;
}
function pinnedLabelParts(track) {
  const parts = [];
  for (const label of track.pinnedLabels) {
    parts.push(
      `<text class="cm-pinned" data-pinned-for="${escapeXml(label.instanceId)}" x="${r2(label.x)}" y="${r2(track.bandY - 4)}">${escapeXml(label.text)}</text>`
    );
  }
  return parts;
}
function outsideLabelParts(track) {
  const parts = [];
  for (const label of track.outsideLabels) {
    parts.push(
      `<text class="cm-outside-label" x="${r2(label.x)}" y="${r2(label.y)}">${escapeXml(label.text)}</text>`
    );
  }
  return parts;
}
function hitTargetParts(track, layout, options) {
  const parts = [];
  if (options.interactive === true) {
    parts.push(
      `<rect class="cm-hit" data-hit-for="${escapeXml(track.variantId)}" data-hit-chain="${escapeXml(track.chainId)}" x="0" y="${r2(track.bandY)}" width="${r2(layout.width)}" height="${r2(track.bandHeight)}"/>`
    );
  }
  return parts;
}
function renderTrackBody(track, layout, options) {
  const parts = [
    ...trackHeaderParts(track, layout, options),
    ...backboneParts(track),
    ...gapParts(track),
    ...segmentParts(track, layout, options),
    ...measureCellParts(track, layout),
    ...siteRuleParts(track),
    ...residueLetterParts(track, layout),
    ...bondTieParts(track),
    ...bondAnchorParts(track),
    ...conjugateParts(track, layout),
    ...capParts(track, layout),
    ...pinnedLabelParts(track),
    ...outsideLabelParts(track),
    ...hitTargetParts(track, layout, options)
  ];
  return `<g class="cm-track-row" data-variant-id="${escapeXml(track.variantId)}">${parts.join("")}</g>`;
}
function renderAxis(layout, options) {
  const scope = `:is(#${options.rootId} .cm-view, svg.cm-view[data-root="${options.rootId}"])`;
  const height = layout.axisY + 8;
  const ticks = layout.ticks.map(
    (tick) => `<text class="cm-tick" x="${r2(tick.labelX)}" y="${r2(layout.axisY)}" text-anchor="middle">${escapeXml(tick.label)}</text>`
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" class="cm-view cm-axis-strip" data-root="${escapeXml(options.rootId)}" viewBox="0 0 ${r2(layout.width)} ${r2(height)}" width="${r2(layout.width)}" height="${r2(height)}" aria-hidden="true" preserveAspectRatio="xMinYMin meet">` + (options.inlineStyles === false ? "" : `<style>${styleBlock(scope, options)}</style>`) + `<text class="cm-axis-label" x="0" y="${r2(layout.axisLabelY)}">${escapeXml(layout.axisLabel)}</text><g class="cm-axis">${ticks}</g></svg>`;
}
function describeFigure(layout) {
  const constructs = new Set(layout.tracks.map((track) => track.variantId)).size;
  const rows = layout.tracks.length;
  const noun = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;
  const window = `showing ${Math.round(layout.viewport.to - layout.viewport.from)} of ${layout.totalColumns} columns.`;
  if (layout.axisMode === "construct") {
    return `${noun(constructs, "construct")}, each numbered from its own N-terminus and not aligned to one another; ${window}`;
  }
  if (layout.axisMode === "chains") {
    return `${noun(constructs, "construct")} in ${noun(rows, "row")}. Rows of the same chain share a residue scale, and rows of different chains are not aligned to one another; ${window}`;
  }
  return `${noun(constructs, "construct")} aligned on a shared residue scale; ${window}`;
}
function renderTrack(layout, trackIndex, options) {
  const track = layout.tracks[trackIndex];
  if (track === void 0) return "";
  const scope = `:is(#${options.rootId} .cm-view, svg.cm-view[data-root="${options.rootId}"])`;
  const gridTop = 0;
  const gridlines = layout.axisMode === "construct" || layout.axisMode === "chains" ? "" : layout.ticks.map(
    (tick) => `<line class="cm-tickline" x1="${r2(tick.x)}" y1="${r2(gridTop)}" x2="${r2(tick.x)}" y2="${r2(track.height)}"/>`
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" class="cm-view" data-root="${escapeXml(options.rootId)}" data-track-for="${escapeXml(track.variantId)}" viewBox="0 0 ${r2(layout.width)} ${r2(track.height)}" width="${r2(layout.width)}" height="${r2(track.height)}" role="img" aria-label="${escapeXml(`${track.name}, ${track.roleLabel}, ${track.lengthLabel}`)}" preserveAspectRatio="xMinYMin meet">` + (options.inlineStyles === false ? "" : `<style>${styleBlock(scope, options)}</style>`) + `<g class="cm-grid-group">${gridlines}</g><g transform="translate(0,${r2(-track.y)})">${renderTrackBody(track, layout, options)}</g></svg>`;
}
function renderView(layout, options, standalone = false) {
  const scope = `:is(#${options.rootId} .cm-view, svg.cm-view[data-root="${options.rootId}"])`;
  const crossRowRules = layout.axisMode === "alignment";
  const ticks = layout.ticks.map(
    (tick) => (crossRowRules ? `<line class="cm-tickline" x1="${r2(tick.x)}" y1="${r2(layout.axisY + 5)}" x2="${r2(tick.x)}" y2="${r2(layout.height)}"/>` : "") + `<text class="cm-tick" x="${r2(tick.labelX)}" y="${r2(layout.axisY)}" text-anchor="middle">${escapeXml(tick.label)}</text>`
  ).join("");
  const tracks = layout.tracks.map((track) => renderTrackBody(track, layout, options)).join("");
  const background = options.background === true ? `<rect x="0" y="0" width="${r2(layout.width)}" height="${r2(layout.height)}" fill="var(--cm-surface)"/>` : "";
  const ariaLabel = options.ariaLabel ?? describeFigure(layout);
  const open = `<svg xmlns="http://www.w3.org/2000/svg" class="cm-view" data-root="${escapeXml(options.rootId)}" viewBox="0 0 ${r2(layout.width)} ${r2(layout.height)}" width="${r2(layout.width)}" height="${r2(layout.height)}" role="img" aria-label="${escapeXml(ariaLabel)}" preserveAspectRatio="xMinYMin meet">`;
  const body = (options.inlineStyles === false ? "" : `<style>${styleBlock(scope, options)}</style>`) + background + `<g class="cm-axis">${ticks}</g><text class="cm-axis-label" x="0" y="${r2(layout.axisLabelY)}">${escapeXml(layout.axisLabel)}</text>` + tracks + // A hidden vertical rule styled by .cm-cursor. Nothing in this repository
  // positions or shows it.
  `<line class="cm-cursor" x1="-10" y1="0" x2="-10" y2="${r2(layout.height)}" style="display:none"/>`;
  const svg = `${open}${body}</svg>`;
  return standalone ? `<?xml version="1.0" encoding="UTF-8"?>
${svg}
` : svg;
}

// src/peptide.ts
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// src/monomer-chemistry.ts
var CHEMISTRY = `
A|Alanine|[1*]N[C@@H](C)C([2*])=O
C|Cysteine|[1*]N[C@@H](CS[3*])C([2*])=O
D|Aspartic acid|[1*]N[C@@H](CC([3*])=O)C([2*])=O
E|Glutamic acid|[1*]N[C@@H](CCC([3*])=O)C([2*])=O
F|Phenylalanine|[1*]N[C@@H](Cc1ccccc1)C([2*])=O
G|Glycine|[1*]NCC([2*])=O
H|Histidine|[1*]N[C@@H](Cc1c[nH]cn1)C([2*])=O
I|Isoleucine|[1*]N[C@H](C([2*])=O)[C@@H](C)CC
K|Lysine|[1*]N[C@@H](CCCCN[3*])C([2*])=O
L|Leucine|[1*]N[C@@H](CC(C)C)C([2*])=O
M|Methionine|[1*]N[C@@H](CCSC)C([2*])=O
N|Asparagine|[1*]N[C@@H](CC(N)=O)C([2*])=O
P|Proline|[1*]N1CCC[C@H]1C([2*])=O
Q|Glutamine|[1*]N[C@@H](CCC(N)=O)C([2*])=O
R|Arginine|[1*]N[C@@H](CCCNC(=N)N)C([2*])=O
S|Serine|[1*]N[C@@H](CO)C([2*])=O
T|Threonine|[1*]N[C@H](C([2*])=O)[C@@H](C)O
V|Valine|[1*]N[C@H](C([2*])=O)C(C)C
W|Tryptophan|[1*]N[C@@H](Cc1c[nH]c2ccccc12)C([2*])=O
Y|Tyrosine|[1*]N[C@@H](Cc1ccc(O)cc1)C([2*])=O
dA|D-Alanine|[1*]N[C@H](C)C([2*])=O
dC|D-Cysteine|[1*]N[C@H](CS[3*])C([2*])=O
dD|D-Aspartic acid|[1*]N[C@H](CC([3*])=O)C([2*])=O
dE|D-Glutamic acid|[1*]N[C@H](CCC([3*])=O)C([2*])=O
dF|D-Phenylalanine|[1*]N[C@H](Cc1ccccc1)C([2*])=O
dH|D-Histidine|[1*]N[C@H](Cc1c[nH]cn1)C([2*])=O
dI|D-Isoleucine|[1*]N[C@@H](C([2*])=O)[C@H](C)CC
dK|D-Lysine|[1*]N[C@H](CCCCN[3*])C([2*])=O
dL|D-Leucine|[1*]N[C@H](CC(C)C)C([2*])=O
dM|D-Methionine|[1*]N[C@H](CCSC)C([2*])=O
dN|D-Asparagine|[1*]N[C@H](CC(N)=O)C([2*])=O
dP|D-Proline|[1*]N1CCC[C@@H]1C([2*])=O
dQ|D-Glutamine|[1*]N[C@H](CCC(N)=O)C([2*])=O
dR|D-Arginine|[1*]N[C@H](CCCNC(=N)N)C([2*])=O
dS|D-Serine|[1*]N[C@H](CO)C([2*])=O
dT|D-Threonine|[1*]N[C@@H](C([2*])=O)[C@H](C)O
dV|D-Valine|[1*]N[C@@H](C([2*])=O)C(C)C
dW|D-Tryptophan|[1*]N[C@H](Cc1c[nH]c2ccccc12)C([2*])=O
dY|D-Tyrosine|[1*]N[C@H](Cc1ccc(O)cc1)C([2*])=O
ac|N-Terminal acetic acid|[2*]C(C)=O
am|C-Terminal amine|[1*]N
_Me|C-Terminal methyl|[1*]C
meA|N-Methyl-Alanine|[1*]N(C)[C@@H](C)C([2*])=O
meD|N-Methyl-Aspartic acid|[1*]N(C)[C@@H](CC([3*])=O)C([2*])=O
meS|N-Methyl-Serine|[1*]N(C)[C@@H](CO)C([2*])=O
meT|N-Methyl-Threonine|[1*]N(C)[C@H](C([2*])=O)[C@@H](C)O
meV|N-Methyl-Valine|[1*]N(C)[C@H](C([2*])=O)C(C)C
meY|N-Methyl-Tyrosine|[1*]N(C)[C@@H](Cc1ccc(O)cc1)C([2*])=O
meE|N-Methyl-Glutamic acid|[1*]N(C)[C@@H](CCC([3*])=O)C([2*])=O
meG|Sarcosine (N-Methyl-Glycine)|[1*]N(C)CC([2*])=O
meI|N-Methyl-Isoleucine|[1*]N(C)[C@H](C([2*])=O)[C@@H](C)CC
meK|N-Methyl-Lysine|[1*]N(C)[C@@H](CCCCN[3*])C([2*])=O
meM|N-Methyl-Methionine|[1*]N(C)[C@@H](CCSC)C([2*])=O
meN|N-Methyl-Asparagine|[1*]N(C)[C@@H](CC(N)=O)C([2*])=O
meQ|N-Methyl-Glutamine|[1*]N(C)[C@@H](CCC(N)=O)C([2*])=O
meC|N-Methyl-Cysteine|[1*]N(C)[C@@H](CS[3*])C([2*])=O
meR|N-Methyl-Arginine|[1*]N(C)[C@@H](CCCNC(=N)N)C([2*])=O
meW|N-Methyl-Tryptophan|[1*]N(C)[C@@H](Cc1c[nH]c2ccccc12)C([2*])=O
meF|N-Methyl-Phenylalanine|[1*]N(C)[C@@H](Cc1ccccc1)C([2*])=O
meH|N-Methyl-Histidine|[1*]N(C)[C@@H](Cc1c[nH]cn1)C([2*])=O
meL|N-Methyl-Leucine|[1*]N(C)[C@@H](CC(C)C)C([2*])=O
Nle|Norleucine|[1*]N[C@@H](CCCC)C([2*])=O
Nva|Norvaline|[1*]N[C@@H](CCC)C([2*])=O
Orn|L-ornithine|[1*]N[C@@H](CCCN[3*])C([2*])=O
Iva|Isovaline|[1*]N[C@@](C)(CC)C([2*])=O
aIle|L-allo-Isoleucine|[1*]N[C@H](C([2*])=O)[C@H](C)CC
gGlu|Gamma glutamic acid|[1*]N[C@@H](CCC([2*])=O)C([3*])=O
Hcy|Homocysteine|[1*]N[C@@H](CCS[3*])C([2*])=O
Hse|Homoserine|[1*]N[C@@H](CCO)C([2*])=O
Hyp|4-Hydroxyproline|[1*]N1C[C@H](O)C[C@H]1C([2*])=O
D_gGlu|D-Gamma glutamic acid|[1*]N[C@H](CCC([2*])=O)C([3*])=O
D_Nle|D-Norleucine|[1*]N[C@H](CCCC)C([2*])=O
D_hPhe|D-Homophenylalanine|[1*]N[C@H](CCc1ccccc1)C([2*])=O
D_Hyp|D-4-Hydroxyproline|[1*]N1C[C@@H](O)C[C@@H]1C([2*])=O
D_Nva|D-Norvaline|[1*]N[C@H](CCC)C([2*])=O
D_Orn|D-Ornithine|[1*]N[C@H](CCCN[3*])C([2*])=O
Pyr|Pyroglutamic acid|[1*]N1C(=O)CC[C@H]1C([2*])=O
D_Pyr|D-Pyroglutamic acid|[2*]C(=O)[C@H]1CCC(=O)N1
Phe_3Cl|3-Chloro-L-phenylalanine|[1*]N[C@@H](Cc1cccc(Cl)c1)C([2*])=O
Phe_4Cl|4-Chloro-L-phenylalanine|[1*]N[C@@H](Cc1ccc(Cl)cc1)C([2*])=O
Phe_4NH2|p-Aminophenylalanine|[1*]N[C@@H](Cc1ccc(N)cc1)C([2*])=O
Phg|2-Phenylglycine|[1*]N[C@H](C([2*])=O)c1ccccc1
Ser_tBu|O-tert-Butyl-L-serine|[1*]N[C@@H](COC(C)(C)C)C([2*])=O
Tyr_Bn|O-Benzyl-L-tyrosine|[1*]N[C@@H](Cc1ccc(OCc2ccccc2)cc1)C([2*])=O
Tza|3-Thiazolylalanine|[1*]N[C@@H](Cc1cscn1)C([2*])=O
1Nal|3-(1-naphthyl)-alanine|[1*]N[C@@H](Cc1cccc2ccccc12)C([2*])=O
Cha|3-Cyclohexylalanine|[1*]N[C@@H](CC1CCCCC1)C([2*])=O
Lys_Boc|N-epsilon-tert-Boc-L-lysine|[1*]N[C@@H](CCCCNC(=O)OC(C)(C)C)C([2*])=O
aThr|L-allo-Threonine|[1*]N[C@H](C([2*])=O)[C@H](C)O
D_2Nal|D-3-naphthylalanine|[1*]N[C@H](Cc1ccc2ccccc2c1)C([2*])=O
D_2Thi|D-3-thienylalanine|[1*]N[C@H](Cc1cccs1)C([2*])=O
D_aHyp|D-allo-4-hydroxyproline|[1*]N1C[C@H](O)C[C@@H]1C([2*])=O
D_aIle|D-allo-Isoleucine|[1*]N[C@@H](C([2*])=O)[C@@H](C)CC
D_Phg|D-2-phenylglycine|[1*]N[C@@H](C([2*])=O)c1ccccc1
D_Ser_tBu|O-tert-Butyl-D-serine|[1*]N[C@H](COC(C)(C)C)C([2*])=O
Cya|3-Sulfoalanine|[1*]N[C@@H](CS(=O)(=O)O)C([2*])=O
Lys_Me3|Epsilon-N-trimethyllysine|[1*]N[C@@H](CCCC[N+](C)(C)C)C([2*])=O
Pen|Penicillamine (3-mercaptovaline)|[1*]N[C@H](C([2*])=O)C(C)(C)S[3*]
Phe_4Me|p-Methylphenylalanine|[1*]N[C@@H](Cc1ccc(C)cc1)C([2*])=O
Ser_Bn|O-Benzyl-L-serine|[1*]N[C@@H](COCc1ccccc1)C([2*])=O
Tyr_tBu|O-tert-Butyl-L-tyrosine|[1*]N[C@@H](Cc1ccc(OC(C)(C)C)cc1)C([2*])=O
2Nal|3-Naphthylalanine|[1*]N[C@@H](Cc1ccc2ccccc2c1)C([2*])=O
Thi|3-thienylalanine|[1*]N[C@@H](Cc1cccs1)C([2*])=O
aHyp|L-allo-4-hydroxyproline|[1*]N1C[C@@H](O)C[C@H]1C([2*])=O
Ala_tBu|3-Methylvaline|[1*]N[C@H](C([2*])=O)C(C)(C)C
hPhe|Homophenylalanine|[1*]N[C@@H](CCc1ccccc1)C([2*])=O
D_1Nal|D-3-(1-naphthyl)-alanine|[1*]N[C@H](Cc1cccc2ccccc12)C([2*])=O
D_aThr|D-allo-Threonine|[1*]N[C@@H](C([2*])=O)[C@@H](C)O
D_Cha|D-2-Amino-3-cyclohexyl-propionic acid|[1*]N[C@H](CC1CCCCC1)C([2*])=O
D_Pen|D-penicillamine (3-mercaptovaline)|[1*]N[C@@H](C([2*])=O)C(C)(C)S[3*]
D_Phe_4Cl|4-Chloro-D-phenylalanine|[1*]N[C@H](Cc1ccc(Cl)cc1)C([2*])=O
D_Ser_Bn|O-Benzyl-D-serine|[1*]N[C@H](COCc1ccccc1)C([2*])=O
Wil|Alpha-amino-2,4-dioxopyrimidinepropanoic acid|[1*]N[C@@H](Cn1ccc(=O)[nH]c1=O)C([2*])=O
MsO|Mesylate|[2*]S(C)(=O)=O
Oic_3aS_7aS|Perhydroindolic acid|[1*]N1[C@H](C([2*])=O)C[C@@H]2CCCC[C@@H]21
Pip|Pipecolic acid|[1*]N1CCCC[C@H]1C([2*])=O
3Pal|3-(2-pyridyl)-alanine|[1*]N[C@@H](Cc1cccnc1)C([2*])=O
4Pal|3-(4-Pyridyl)-alanine|[1*]N[C@@H](Cc1ccncc1)C([2*])=O
Abu|2-Aminobutanoic acid|[1*]N[C@@H](CC)C([2*])=O
Apm|2-Aminopimelic acid|[1*]N[C@@H](CCCCC([3*])=O)C([2*])=O
Chg|Alpha-cyclohexylglycine|[1*]N[C@H](C([2*])=O)C1CCCCC1
Dab|2,4-diaminobutanoic acid|[1*]N[C@@H](CCN[3*])C([2*])=O
Dap|2,3-diaminopropanoic acid|[1*]N[C@@H](CN[3*])C([2*])=O
D_3Pal|D-3-(2-pyridyl)-alanine|[1*]N[C@H](Cc1cccnc1)C([2*])=O
D_aMeAbu|D-Isovaline|[1*]N[C@](C)(CC)C([2*])=O
D_Chg|D-Alpha-cyclohexylglycine|[1*]N[C@@H](C([2*])=O)C1CCCCC1
D_Cit|D-Citrullin|[1*]N[C@H](CCCNC(N)=O)C([2*])=O
D_Dab|D-2,4-diaminobutanoic acid|[1*]N[C@H](CCN[3*])C([2*])=O
D_Pip|D-Pipecolic acid|[1*]N1CCCC[C@@H]1C([2*])=O
D_Tic|D-1,2,3,4-tetrahydro-3-isoquinolinecarboxylic acid|[1*]N1Cc2ccccc2C[C@@H]1C([2*])=O
Aca|2-Aminocapric acid|[1*]N[C@@H](CCCCCCCC)C([2*])=O
Tic|1,2,3,4-tetrahydro-3-isoquinolinecarboxylic acid|[1*]N1Cc2ccccc2C[C@H]1C([2*])=O
Aad|2-Aminoadipic acid|[1*]N[C@@H](CCCC([3*])=O)C([2*])=O
Cit|Citrullin|[1*]N[C@@H](CCCNC(N)=O)C([2*])=O
Aze|2-Carboxyazetidine|[1*]N1CC[C@H]1C([2*])=O
Ac5c|1-Amino-1-carboxycyclopentane|[1*]NC1(C([2*])=O)CCCC1
Aib|Alpha-aminoisobutyric acid (2-aminoalanine)|[1*]NC(C)(C)C([2*])=O
D_2Pal|D-3-(2-Pyridyl)-alanine|[1*]N[C@H](Cc1ccccn1)C([2*])=O
D_Abu|D-2-aminobutanoic acid|[1*]N[C@H](CC)C([2*])=O
D_Dap|D-2,3-diaminopropanoic acid|[1*]N[C@H](CN[3*])C([2*])=O
Asu|2-Aminosuberic acid|[1*]N[C@@H](CCCCCC([3*])=O)C([2*])=O
Cbz|Carboxybenzyl|[2*]C(=O)OCc1ccccc1
_Et|C-Terminal ethyl|[1*]CC
NHEt|Ethanamine|[1*]NCC
OEt|Ethanol|[1*]OCC
_OMe|C-Terminal methanol|[1*]OC
OtBu|O-tert-Butyl|[1*]OC(C)(C)C
Tos|Tosyl|[2*]S(=O)(=O)c1ccc(C)cc1
D_Thz|(4S)-1,3-thiazolidine-4-carboxylic acid|[1*]N1CSC[C@@H]1C([2*])=O
fmoc|Fluorenylmethoxycarbonyl|[2*]C(=O)OCC1c2ccccc2-c2ccccc21
Mpa|(S)-2-Mercaptopropanoic acid|[2*]C(=O)[C@H](C)S[3*]
Bua|Butanoic acid|[2*]C(=O)CCC
Glc|Glycolic acid|[2*]C(=O)CO
deamino_Cys|Deamino-Cysteine|[2*]C(=O)CCS
deamino_Dab|4-aminobutanoic acid|[1*]NCCCC(=O)O
deamino_Gly_CN|2-cyanoacetic acid|[2*]C(=O)CC#N
deamino_Gly_cPent|2-cyclopentylacetic acid|[2*]C(=O)CC1CCCC1
deamino_Gly_OH|2-hydroxyacetic acid|[1*]OCC(=O)O
deamino_Gly_thien2yl|2-(thiophen-2-yl)acetic acid|[2*]C(=O)Cc1cccs1
D_Trp_For|(2R)-2-amino-3-(1-formyl-1H-indol-3-yl)propanoic acid|[1*]N[C@H](Cc1cn(C=O)c2ccccc12)C([2*])=O
deamino_Ncy|2-sulfanylacetic acid|[2*]C(=O)CS
deamino_Phe|Deamino-Phenylalanine|[2*]C(=O)CCc1ccccc1
deamino_Phg_35diMe|2-(3,5-dimethylphenyl)acetic acid|[2*]C(=O)Cc1cc(C)cc(C)c1
deamino_Leu|Deamino-Leucine|[2*]C(=O)CCC(C)C
D_OAla|(2R)-2-hydroxypropanoic acid|[2*]C(=O)[C@@H](C)O
L_OAla|(2S)-2-hydroxypropanoic acid|[2*]C(=O)[C@H](C)O
L_OVal|(2S)-2-hydroxy-3-methylbutanoic acid|[2*]C(=O)[C@@H](O)C(C)C
NHBn_|N-Terminal 1-phenylmethanamine|[2*]NCc1ccccc1
Bz|Benzoic acid|[2*]C(=O)c1ccccc1
Et_|N-Terminal ethyl|[2*]CC
Me_|N-Terminal methyl|[2*]C
D_Tyr_Et|(2R)-2-amino-3-(4-ethoxyphenyl)propanoic acid|[1*]N[C@H](Cc1ccc(OCC)cc1)C([2*])=O
Lys_Ac|(2S)-2-amino-6-acetamidohexanoic acid|[1*]N[C@@H](CCCCNC(C)=O)C([2*])=O
OMe_|N-Terminal methanol|[2*]OC
Asp_OMe|(2S)-2-amino-4-methoxy-4-oxobutanoic acid|[1*]N[C@@H](CC(=O)OC)C([2*])=O
NMe23Abz|3-(dimethylamino)benzoic acid|[2*]C(=O)c1cccc(N(C)C)c1
Phe_ab_dehydro|2-amino-3-phenylprop-2-enoic acid|[1*]NC(=Cc1ccccc1)C([2*])=O||1
Sta_3xi4xi|4-amino-3-hydroxy-6-methylheptanoic acid|[1*]NC(CC(C)C)C(O)CC([2*])=O|2
Tyr_ab_dehydroMe|2-amino-3-(4-methoxyphenyl)prop-2-enoic acid|[1*]NC(=Cc1ccc(OC)cc1)C([2*])=O||1
App|gamma-amino-beta-hydroxybenzenepentanoic acid|[1*]N[C@@H](Cc1ccccc1)[C@H](O)CC([2*])=O
Cap|(2R,3S)-3-amino-5-cyclohexyl-2-hydroxypentanoic acid|[1*]N[C@@H](CCC1CCCCC1)[C@@H](O)C([2*])=O
Cys_SEt|(2R)-2-amino-3-(ethyldisulfanyl)propanoic acid|[1*]N[C@@H](CSSCC)C([2*])=O
Dsu|2,7-Diaminosuberic acid|[1*]N[C@@H](CCCCC(N)C(=O)O)C([2*])=O|1
pnC|PNA Cytosine|[1*]NCCN(CC([2*])=O)C(=O)Cn1ccc(N)nc1=O
pnG|PNA Guanine|[1*]NCCN(CC([2*])=O)C(=O)Cn1cnc2c(=O)[nH]c(N)nc21
Pqa|2-[1-oxo-7-(piperazin-1-yl)-1,2-dihydroisoquinolin-2-yl]acetic acid|[1*]N1CCN(c2ccc3ccn(CC([2*])=O)c(=O)c3c2)CC1
Pro_4Me3OH|(2S)-3-hydroxy-4-methylpyrrolidine-2-carboxylic acid|[1*]N1CC(C)C(O)[C@H]1C([2*])=O|2
D_Ala_ol|(2R)-2-aminopropan-1-ol|[2*]C[C@@H](N)CO
D_Phg_ol|2-amino-2-methylpropan-1-ol|[1*]NC(CO)c1ccccc1|1
D_Thr_ol|(2R,3R)-2-aminobutane-1,3-diol|[1*]N[C@H](CO)[C@@H](C)O
Gly_ol|2-aminoethanol|[1*]NCCO
Ala_ol|(2S)-2-aminopropan-1-ol|[1*]N[C@@H](C)CO
Lys_ol|(2S)-2,6-diaminohexan-1-ol|[1*]N[C@H](CO)CCCCN
Phg_ol|(2S)-2-amino-2-phenylethan-1-ol|[1*]N[C@H](CO)c1ccccc1
Pro_ol|[(2S)-pyrrolidin-2-yl]methanol|[1*]N1CCC[C@H]1CO
Val_ol|(2S)-2-amino-3-methylbutan-1-ol|[1*]N[C@H](CO)C(C)C
Ala_al|(2S)-2-aminopropanal|[1*]N[C@@H](C)C=O
Arg_al|N''-[(4S)-4-amino-5-oxopentyl]guanidine|[1*]N[C@H](C=O)CCCNC(=N)N
Asp_al|(3S)-3-amino-4-oxobutanoic acid|[1*]N[C@H](C=O)CC(=O)O
Lys_al|(2S)-2,6-diaminohexanal|[1*]N[C@H](C=O)CCCCN
Pro_al|(2S)-pyrrolidine-2-carbaldehyde|[1*]N1CCC[C@H]1C=O
_NHBn|C-Terminal 1-phenylmethanamine|[1*]NCc1ccccc1
NHMe|Methanamine|[1*]NC
Met_O2|(2S)-2-amino-4-methanesulfonylbutanoic acid|[1*]N[C@@H](CCS(C)(=O)=O)C([2*])=O
Phe_2Me|(2S)-2-amino-3-(2-methylphenyl)propanoic acid|[1*]N[C@@H](Cc1ccccc1C)C([2*])=O
Phe_34diCl|(2S)-2-amino-3-(3,4-dichlorophenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(Cl)c(Cl)c1)C([2*])=O
Phe_4Br|(2S)-2-amino-3-(4-bromophenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(Br)cc1)C([2*])=O
Phe_4I|(2S)-2-amino-3-(4-iodophenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(I)cc1)C([2*])=O
Phe_4Sdihydroorotamido|(2S)-2-amino-3-{4-[(4S)-2,6-dioxo-1,3-diazinane-4-amido]phenyl}propanoic acid|[1*]N[C@@H](Cc1ccc(NC(=O)[C@@H]2CC(=O)NC(=O)N2)cc1)C([2*])=O
Pyl|Pyrrolysine|[1*]N[C@@H](CCCCNC(=O)[C@@H]1N=CC[C@H]1C)C([2*])=O
Ser_PO3H2|(2S)-2-amino-3-(phosphonooxy)propanoic acid|[1*]N[C@@H](COP(=O)(O)O)C([2*])=O
Thr_PO3H2|(2S,3R)-2-amino-3-(phosphonooxy)butanoic acid|[1*]N[C@H](C([2*])=O)[C@@H](C)OP(=O)(O)O
Thz|(4R)-1,3-thiazolidine-4-carboxylic acid|[1*]N1CSC[C@H]1C([2*])=O
Trp_Me|(2S)-2-amino-3-(1-methyl-1H-indol-3-yl)propanoic acid|[1*]N[C@@H](Cc1cn(C)c2ccccc12)C([2*])=O
Tyr_26diMe|(2S)-2-amino-3-(4-hydroxy-2,6-dimethylphenyl)propanoic acid|[1*]N[C@@H](Cc1c(C)cc(O)cc1C)C([2*])=O
Tyr_3I|(2S)-2-amino-3-(4-hydroxy-3-iodophenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(O)c(I)c1)C([2*])=O
Tyr_3NO2|(2S)-2-amino-3-(4-hydroxy-3-nitrophenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(O)c([N+](=O)[O-])c1)C([2*])=O
Tyr_Ph4OH|(2S)-2-amino-3-[4-(4-hydroxyphenoxy)phenyl]propanoic acid|[1*]N[C@@H](Cc1ccc(Oc2ccc(O)cc2)cc1)C([2*])=O
Tyr_SO3H|(2S)-2-amino-3-[4-(sulfooxy)phenyl]propanoic acid|[1*]N[C@@H](Cc1ccc(OS(=O)(=O)O)cc1)C([2*])=O
Val_3OH|(2S)-2-amino-3-hydroxy-3-methylbutanoic acid|[1*]N[C@H](C([2*])=O)C(C)(C)O
xiIle|(2S)-2-amino-3-methylpentanoic acid|[1*]N[C@H](C([2*])=O)C(C)CC|1
NMe2Abz|2-(methylamino)benzoic acid|[1*]N(C)c1ccccc1C([2*])=O
NMebAla|3-(methylamino)propanoic acid|[1*]N(C)CCC([2*])=O
aMePhe|(2S)-2-amino-2-methyl-3-phenylpropanoic acid|[1*]N[C@@](C)(Cc1ccccc1)C([2*])=O
aMePro|(2S)-2-methylpyrrolidine-2-carboxylic acid|[1*]N1CCC[C@@]1(C)C([2*])=O
aMeTyr_3OH|(2S)-2-amino-3-(3,4-dihydroxyphenyl)-2-methylpropanoic acid|[1*]N[C@@](C)(Cc1ccc(O)c(O)c1)C([2*])=O
Bmt|(2S,3R,4R)-2-amino-3-hydroxy-4-methyloct-6-enoic acid|[1*]N[C@H](C([2*])=O)[C@H](O)[C@H](C)CC=CC||1
Bmt_E|(2S,3R,4R,6E)-2-amino-3-hydroxy-4-methyloct-6-enoic acid|[1*]N[C@H](C([2*])=O)[C@H](O)[C@H](C)C/C=C/C
Cys_Bn|(2R)-2-amino-3-(benzylsulfanyl)propanoic acid|[1*]N[C@@H](CSCc1ccccc1)C([2*])=O
Gla|Carboxyglutamic acid|[1*]N[C@@H](CC(C([3*])=O)C(=O)O)C([2*])=O|1
hHis|(2S)-2-amino-4-(1H-imidazol-4-yl)butanoic acid|[1*]N[C@@H](CCc1c[nH]cn1)C([2*])=O
His_1Me|(2S)-2-amino-3-(1-methyl-1H-imidazol-4-yl)propanoic acid|[1*]N[C@@H](Cc1cn(C)cn1)C([2*])=O
Gly_allyl|(2S)-2-aminopent-4-enoic acid|[1*]N[C@@H](CC=C)C([2*])=O
Gly_cPr|(2S)-2-amino-2-cyclopropylacetic acid|[1*]N[C@H](C([2*])=O)C1CC1
Hsl|(3S)-3-aminooxolan-2-one|[1*]N[C@H]1CCOC1=O
Asp_Ph2NH2|(2S)-2-amino-4-(2-aminophenyl)-4-oxobutanoic acid|[1*]N[C@@H](CC(=O)c1ccccc1N)C([2*])=O
Azi|(2S)-aziridine-2-carboxylic acid|[1*]N1C[C@H]1C([2*])=O|1
2Abz|2-Aminobenzoic acid|[1*]Nc1ccccc1C([2*])=O
3Abz|3-Aminobenzoic acid|[1*]Nc1cccc(C([2*])=O)c1
4Abz|4-Aminobenzoic acid|[1*]Nc1ccc(C([2*])=O)cc1
Ac3c|1-aminocyclopropane-1-carboxylic acid|[1*]NC1(C([2*])=O)CC1
Ac6c|1-aminocyclohexane-1-carboxylic acid|[1*]NC1(C([2*])=O)CCCCC1
bAla|3-aminopropanoic acid|[1*]NCCC([2*])=O
D_Bmt|(2R,3S,4S)-2-amino-3-hydroxy-4-methyloct-6-enoic acid|[1*]N[C@@H](C([2*])=O)[C@@H](O)[C@@H](C)CC=CC||1
D_Bmt_E|(2R,3S,4S,6E)-2-amino-3-hydroxy-4-methyloct-6-enoic acid|[1*]N[C@@H](C([2*])=O)[C@@H](O)[C@@H](C)C/C=C/C
D_hArg|(2R)-2-amino-6-[(diaminomethylidene)amino]hexanoic acid|[1*]N[C@H](CCCCNC(=N)N)C([2*])=O
D_Phe_4F|(2R)-2-amino-3-(4-fluorophenyl)propanoic acid|[1*]N[C@H](Cc1ccc(F)cc1)C([2*])=O
D_Trp_2Me|(2R)-2-amino-3-(2-methyl-1H-indol-3-yl)propanoic acid|[1*]N[C@H](Cc1c(C)[nH]c2ccccc12)C([2*])=O
D_Tyr_3OH|(2R)-2-amino-3-(3,4-dihydroxyphenyl)propanoic acid|[1*]N[C@H](Cc1ccc(O)c(O)c1)C(=O)O
D_Tyr_Me|(2R)-2-amino-3-(4-methoxyphenyl)propanoic acid|[1*]N[C@H](Cc1ccc(OC)cc1)C([2*])=O
D_xiIle|(2R)-2-amino-3-methylpentanoic acid|[1*]N[C@@H](C([2*])=O)C(C)CC|1
Lys_iPr|(2S)-2-amino-6-[(propan-2-yl)amino]hexanoic acid|[1*]N[C@@H](CCCCNC(C)C)C([2*])=O
_Bn|C-Terminal toluene|[1*]Cc1ccccc1
_OBn|C-Terminal phenylmethanol|[1*]OCc1ccccc1
Ph|Phenyl|[1*]c1ccccc1
Boc|Tert-butyloxycarbonyl|[2*]C(=O)OC(C)(C)C
Mba|Mercaptobutanoic acid|[2*]C(=O)[C@H](CC)S[3*]
Hva|2-Hydroxypentanoic acid|[2*]C(=O)[C@@H](O)CCC
deamino_Chg|2-cyclohexylacetic acid|[2*]C(=O)CC1CCCCC1
deamino_Dip|3,3-diphenylpropanoic acid|[2*]C(=O)CC(c1ccccc1)c1ccccc1
deamino_Gly_tBu|3,3-dimethylbutanoic acid|[2*]C(=O)CC(C)(C)C
deamino_hPhe|4-phenylbutanoic acid|[2*]C(=O)CCCc1ccccc1
deamino_nTyr_Me|2-(4-methoxyphenyl)acetic acid|[2*]C(=O)Cc1ccc(OC)cc1
deamino_Phg_4Cl|2-(4-chlorophenyl)acetic acid|[2*]C(=O)Cc1ccc(Cl)cc1
D_OVal|(2R)-2-hydroxy-3-methylbutanoic acid|[2*]C(=O)[C@H](O)C(C)C
OLeu|(2S)-2-hydroxy-4-methylpentanoic acid|[2*]C(=O)[C@@H](O)CC(C)C
Bn_|N-Terminal toluene|[2*]Cc1ccccc1
OBn_|N-Terminal phenylmethanol|[2*]OCc1ccccc1
deamino_Lys|Deamino-Lysine|[2*]C(=O)CCCCCN
NMe24Abz|4-(dimethylamino)benzoic acid|[2*]C(=O)c1ccc(N(C)C)cc1
Phe_ab_dehydro_3NO2|2-amino-3-(3-nitrophenyl)prop-2-enoic acid|[1*]NC(=Cc1cccc([N+](=O)[O-])c1)C([2*])=O||1
Sta_3S4S|(3S,4S)-4-amino-3-hydroxy-6-methylheptanoic acid|[1*]N[C@@H](CC(C)C)[C@@H](O)CC([2*])=O
Bux|(3S)-4-amino-3-hydroxybutanoic acid|[1*]NC[C@@H](O)CC([2*])=O
Dpm|Diaminopimelic acid|[1*]NC(CCCC(N)C(=O)O)C([2*])=O|2
pnA|PNA Adenine|[1*]NCCN(CC([2*])=O)C(=O)Cn1cnc2c(N)ncnc21
pnT|PNA Thymine|[1*]NCCN(CC([2*])=O)C(=O)Cn1cc(C)c(=O)[nH]c1=O
seC|SelenoCysteine|[1*]N[C@@H](C[SeH])C([2*])=O
Aib_ol|2-amino-2-methylpropan-1-ol|[1*]NC(C)(C)CO
D_Pro_ol|[(2R)-pyrrolidin-2-yl]methanol|[1*]N1CCC[C@@H]1CO
Leu_ol|(2S)-2-amino-4-methylpentan-1-ol|[1*]N[C@H](CO)CC(C)C
Phe_ol|(2S)-2-amino-3-phenylpropan-1-ol|[1*]N[C@H](CO)Cc1ccccc1
Thr_ol|(2S,3S)-2-aminobutane-1,3-diol|[1*]N[C@@H](CO)[C@H](C)O
Gly_al|2-aminoacetaldehyde|[1*]NCC=O
Leu_al|(2S)-2-amino-4-methylpentanal|[1*]N[C@H](C=O)CC(C)C
Phe_al|(2S)-2-amino-3-phenylpropanal|[1*]N[C@H](C=O)Cc1ccccc1
L_hArg(Et,Et)|(2S)-2-amino-6-{[bis(ethylamino)methylidene]amino}hexanoic acid|[1*]N[C@@H](CCCCNC(=NCC)NCC)C([2*])=O
Met_O|(2S)-2-amino-4-methanesulfinylbutanoic acid|[1*]N[C@@H](CC[S+](C)[O-])C([2*])=O|1
nTyr|(2S)-2-amino-2-(4-hydroxyphenyl)acetic acid|[1*]N[C@H](C([2*])=O)c1ccc(O)cc1
Oic_3aR_7aS|(2S,3aR,7aS)-octahydro-1H-indole-2-carboxylic acid|[1*]N1[C@H](C([2*])=O)C[C@H]2CCCC[C@@H]21
Oic_3axi_7axi|(2S)-octahydro-1H-indole-2-carboxylic acid|[1*]N1C2CCCCC2C[C@H]1C([2*])=O|2
Phe_2F|(2S)-2-amino-3-(2-fluorophenyl)propanoic acid|[1*]N[C@@H](Cc1ccccc1F)C([2*])=O
Phe_3F|(2S)-2-amino-3-(3-fluorophenyl)propanoic acid|[1*]N[C@@H](Cc1cccc(F)c1)C([2*])=O
Phe_4F|(2S)-2-amino-3-(4-fluorophenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(F)cc1)C([2*])=O
Phe_4NO2|(2S)-2-amino-3-(4-nitrophenyl)propanoic acid|[1*]N[C@@H](Cc1ccc([N+](=O)[O-])cc1)C([2*])=O
Phe_bbdiMe|(2S)-2-amino-3-methyl-3-phenylbutanoic acid|[1*]N[C@H](C([2*])=O)C(C)(C)c1ccccc1
Trp_5OH|(2S)-2-amino-3-(5-hydroxy-1H-indol-3-yl)propanoic acid|[1*]N[C@@H](Cc1c[nH]c2ccc(O)cc12)C([2*])=O
Trp_Ome|(2S)-2-amino-3-(1-methoxy-1H-indol-3-yl)propanoic acid|[1*]N[C@@H](Cc1cn(OC)c2ccccc12)C([2*])=O
Tyr_35diI|(2S)-2-amino-3-(4-hydroxy-3,5-diiodophenyl)propanoic acid|[1*]N[C@@H](Cc1cc(I)c(O)c(I)c1)C([2*])=O
Tyr_3OH|(2S)-2-amino-3-(3,4-dihydroxyphenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(O)c(O)c1)C([2*])=O
Tyr_Me|(2S)-2-amino-3-(4-methoxyphenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(OC)cc1)C([2*])=O
Tyr_PO3H2|(2S)-2-amino-3-[4-(phosphonooxy)phenyl]propanoic acid|[1*]N[C@@H](Cc1ccc(OP(=O)(O)O)cc1)C([2*])=O
xiHyp|(2S)-4-hydroxypyrrolidine-2-carboxylic acid|[1*]N1CC(O)C[C@H]1C([2*])=O|1
xiThr|(2S)-2-amino-3-hydroxybutanoic acid|[1*]N[C@H](C([2*])=O)C(C)O|1
NMe4Abz|4-(methylamino)benzoic acid|[1*]N(C)c1ccc(C([2*])=O)cc1
aMeTyr|(2S)-2-amino-3-(4-hydroxyphenyl)-2-methylpropanoic acid|[1*]N[C@@](C)(Cc1ccc(O)cc1)C([2*])=O
Aoda|(2S)-2-amino-8-oxodecanoic acid|[1*]N[C@@H](CCCCCC(=O)CC)C([2*])=O
Bpa|(2S)-2-amino-3-(4-benzoylphenyl)propanoic acid|[1*]N[C@@H](Cc1ccc(C(=O)c2ccccc2)cc1)C([2*])=O
Cys_Me|(2R)-2-amino-3-(methylsulfanyl)propanoic acid|[1*]N[C@@H](CSC)C([2*])=O
Dip|(2S)-2-amino-3,3-diphenylpropanoic acid|[1*]N[C@H](C([2*])=O)C(c1ccccc1)c1ccccc1
hArg|(2S)-2-amino-6-(diaminomethylideneamino)hexanoic acid|[1*]N[C@@H](CCCCN=C(N)N)C([2*])=O
His_1Bn|(2S)-2-amino-3-(1-benzyl-1H-imidazol-4-yl)propanoic acid|[1*]N[C@@H](Cc1cn(Cc2ccccc2)cn1)C([2*])=O
His_3Me|(2S)-2-amino-3-(1-methyl-1H-imidazol-5-yl)propanoic acid|[1*]N[C@@H](Cc1cncn1C)C([2*])=O
Hyl_5xi|(2S)-2,6-diamino-5-hydroxyhexanoic acid|[1*]N[C@@H](CCC(O)CN)C([2*])=O|1
Bip|(2S)-2-amino-3-{[1,1'-biphenyl]-4-yl}propanoic acid|[1*]N[C@@H](Cc1ccc(-c2ccccc2)cc1)C([2*])=O
Abu_23dehydro|(2Z)-2-aminobut-2-enoic acid|[1*]N/C(=C\\C)C([2*])=O
D_Dip|(2R)-2-amino-3,3-diphenylpropanoic acid|[1*]N[C@@H](C([2*])=O)C(c1ccccc1)c1ccccc1
Dha|2-aminoprop-2-enoic acid|[1*]NC(=C)C([2*])=O
D_hArg_Et2|(2R)-2-amino-6-{[bis(ethylamino)methylidene]amino}hexanoic acid|[1*]N[C@H](CCCCNC(=NCC)NCC)C([2*])=O
D_Met_S_O|(2R)-2-amino-4-[(S)-methanesulfinyl]butanoic acid|[1*]N[C@H](CC[S@+](C)[O-])C([2*])=O
D_His_1Bn|(2R)-2-amino-3-(1-benzyl-1H-imidazol-4-yl)propanoic acid|[1*]N[C@H](Cc1cn(Cc2ccccc2)cn1)C([2*])=O
D_nTyr|(2R)-2-amino-2-(4-hydroxyphenyl)acetic acid|[1*]N[C@@H](C([2*])=O)c1ccc(O)cc1
D_Phe_4ureido|(2R)-2-amino-3-[4-(carbamoylamino)phenyl]propanoic acid|[1*]N[C@H](Cc1ccc(NC(N)=O)cc1)C([2*])=O
AEEA|2-[2-(2-aminoethoxy)ethoxy]acetic acid|[1*]NCCOCCOCC([2*])=O
C18diacid|octadecanedioic acid|[2*]C(=O)CCCCCCCCCCCCCCCCC(=O)O
C16acid|hexadecanoic acid|[2*]C(=O)CCCCCCCCCCCCCCC
Mpr|3-sulfanylpropanoic acid|[2*]C(=O)CCS[3*]
`;
var BY_NAME = (() => {
  const map = /* @__PURE__ */ new Map();
  for (const line of CHEMISTRY.trim().split("\n")) {
    if (line === "") continue;
    const [name, chemicalName, smiles, open, geometry] = line.split("|");
    if (name === void 0 || chemicalName === void 0 || smiles === void 0) {
      throw new Error(`monomer chemistry: could not read ${JSON.stringify(line)}`);
    }
    const count = (field) => field === void 0 || field === "" ? 0 : Number(field);
    map.set(name, {
      name,
      chemicalName,
      smiles,
      unspecifiedCentres: count(open),
      unspecifiedGeometry: count(geometry)
    });
  }
  return map;
})();
function monomerChemistry(name) {
  return BY_NAME.get(name);
}

// src/peptide.ts
var WELDER_TIMEOUT_MS = 3e4;
var FIRST_ATOM = /^(\[[^\]]+\]|Cl|Br|[BCNOPSFI]|[bcnops])((?:[0-9]|%[0-9]{2})*)/;
function parentIsStereocentre(fragment, tokenAt, token) {
  if (tokenAt === 0) {
    const first = FIRST_ATOM.exec(fragment.slice(token.length));
    return first !== null && first[1].startsWith("[") && first[1].includes("@");
  }
  let i = tokenAt;
  if (fragment[i - 1] === "(") i -= 1;
  for (; ; ) {
    const before = fragment[i - 1];
    if (before === ")") {
      let depth = 0;
      let k = i - 1;
      for (; k >= 0; k -= 1) {
        if (fragment[k] === ")") depth += 1;
        else if (fragment[k] === "(") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      if (k < 0) return false;
      i = k;
      continue;
    }
    if (before !== void 0 && (/[0-9]/.test(before) || before === "%")) {
      i -= 1;
      continue;
    }
    break;
  }
  if (fragment[i - 1] !== "]") return false;
  const open = fragment.lastIndexOf("[", i - 1);
  return fragment.slice(open, i).includes("@");
}
function openPoint(fragment, point, ring) {
  const token = `[${point}*]`;
  const at = fragment.indexOf(token);
  if (at < 0) throw new Error(`${fragment} has no attachment ${token} to bond through`);
  if (parentIsStereocentre(fragment, at, token)) {
    throw new Error(
      `the attachment ${token} in ${fragment} hangs off a stereocentre, and replacing it with a ring closure would change that atom's neighbour order and could invert it`
    );
  }
  if (at === 0) {
    const rest = fragment.slice(token.length);
    const first = FIRST_ATOM.exec(rest);
    if (first === null) {
      throw new Error(`cannot place a ring closure after the attachment in ${fragment}`);
    }
    return rest.slice(0, first[0].length) + ring + rest.slice(first[0].length);
  }
  if (fragment[at - 1] === "(" && fragment[at + token.length] === ")") {
    return fragment.slice(0, at - 1) + ring + fragment.slice(at + token.length + 1);
  }
  return fragment.slice(0, at) + ring + fragment.slice(at + token.length);
}
function closePoint(fragment, point, free) {
  const token = `[${point}*]`;
  const at = fragment.indexOf(token);
  if (at < 0) return fragment;
  const fill = free === "OH" ? "O" : "";
  if (at === 0) return fill + fragment.slice(token.length);
  if (fragment[at - 1] === "(" && fragment[at + token.length] === ")") {
    return fragment.slice(0, at - 1) + (fill === "" ? "" : `(${fill})`) + fragment.slice(at + token.length + 1);
  }
  return fragment.slice(0, at) + fill + fragment.slice(at + token.length);
}
function welderScript() {
  const override = process.env["CONSTRUCT_MAPS_ASSEMBLER"];
  if (override !== void 0 && override !== "") {
    return existsSync(override) ? override : null;
  }
  const candidates = [
    fileURLToPath(new URL("../scripts/assemble_peptide.py", import.meta.url)),
    join(process.cwd(), "scripts", "assemble_peptide.py")
  ];
  return candidates.find((path2) => existsSync(path2)) ?? null;
}
function weldWithRdkit(names, fragments, joins) {
  const units = names.map((name, unit) => {
    const free = {};
    for (const point of [1, 2, 3]) {
      const attachment = attachmentAt(name, point);
      if (attachment !== void 0) free[String(point)] = attachment.free;
    }
    return { name, fragment: fragments[unit], free };
  });
  const payload = JSON.stringify({
    units,
    joins: joins.map(([a, b]) => [
      [a.unit, a.point],
      [b.unit, b.point]
    ])
  });
  const script = welderScript();
  if (script === null) return null;
  let result;
  try {
    result = spawnSync(
      process.env["CONSTRUCT_MAPS_PYTHON"] ?? "python3",
      [script],
      // A welder that has not answered by the timeout is treated as absent, and
      // the text assembler takes over, so a hung interpreter cannot hang a render.
      {
        input: payload,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        timeout: WELDER_TIMEOUT_MS,
        // SIGKILL, because an interpreter that ignores the default SIGTERM would
        // otherwise outlive the timeout and still block this call.
        killSignal: "SIGKILL"
      }
    );
  } catch {
    return null;
  }
  if (result.error !== void 0 || result.status !== 0 || typeof result.stdout !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(result.stdout);
    return typeof parsed.smiles === "string" ? parsed.smiles : null;
  } catch {
    return null;
  }
}
function monomerAt2(chain, position) {
  const named = chain.chemistry?.residues?.find((entry) => entry.position === position);
  if (named !== void 0) return named.monomer;
  const letter = chain.sequence[position - 1];
  if (letter === void 0 || monomer(letter) === void 0) return null;
  return letter;
}
var copyOf = (end) => end.copy ?? 1;
function gapRefusal(gaps) {
  if (gaps.length > 0) {
    const positions = gaps.map((gap) => gap.position).filter((at) => at !== void 0);
    const scope = positions.length === gaps.length && positions.length > 0 ? positions.length === 1 ? `position ${positions[0]} carries` : `positions ${positions.join(", ")} carry` : "this chain carries";
    return `${scope} chemistry this vocabulary cannot express, so the molecule is not determined`;
  }
  return null;
}
function residueNames(chain) {
  const length = chain.sequence.length;
  const names = [];
  const unresolved = [];
  for (let position = 1; position <= length; position += 1) {
    const name = monomerAt2(chain, position);
    if (name === null) {
      unresolved.push(position);
      names.push("");
      continue;
    }
    names.push(name);
  }
  if (unresolved.length > 0) {
    const letters = [...new Set(unresolved.map((p) => chain.sequence[p - 1]))].join(", ");
    return {
      names,
      reason: `${unresolved.length === 1 ? "position" : "positions"} ${unresolved.join(", ")} (${letters}) name no monomer, so the molecule is not determined`
    };
  }
  return { names, reason: null };
}
function backboneJoins(length) {
  const joins = [];
  for (let i = 0; i + 1 < length; i += 1) {
    joins.push([
      { unit: i, point: 2 },
      { unit: i + 1, point: 1 }
    ]);
  }
  return joins;
}
function addCaps(chain, length, names, joins) {
  for (const cap of chain.chemistry?.caps ?? []) {
    if (monomerChemistry(cap.monomer) === void 0) {
      return `the cap ${cap.monomer} is not a known monomer`;
    }
    names.push(cap.monomer);
    const unit = names.length - 1;
    joins.push(
      cap.terminus === "N" ? [
        { unit, point: 2 },
        { unit: 0, point: 1 }
      ] : [
        { unit, point: 1 },
        { unit: length - 1, point: 2 }
      ]
    );
  }
  return null;
}
function addBondJoins(bonds, chainId, joins) {
  for (const bond of bonds) {
    const ends = [bond.a, bond.b];
    const here = ends.filter((end) => (end.chain_id ?? chainId) === chainId);
    if (!here.some((end) => copyOf(end) === 1)) continue;
    if (here.length === 1) {
      return `bond ${bond.bond_id} has its other end in another chain, so this chain is one part of a larger molecule`;
    }
    if (copyOf(ends[0]) !== copyOf(ends[1])) {
      return `bond ${bond.bond_id} joins two copies of this chain, so this chain is one part of a larger assembly`;
    }
    if (copyOf(ends[0]) !== 1) continue;
    joins.push([
      { unit: ends[0].position - 1, point: ends[0].attachment },
      { unit: ends[1].position - 1, point: ends[1].attachment }
    ]);
  }
  return null;
}
function addConjugates(conjugates, chainId, names, joins) {
  for (const conjugate of conjugates) {
    if ((conjugate.anchor.chain_id ?? chainId) !== chainId) continue;
    if (copyOf(conjugate.anchor) !== 1) continue;
    let previous = {
      unit: conjugate.anchor.position - 1,
      point: conjugate.anchor.attachment
    };
    for (const [index, unit] of conjugate.units.entries()) {
      if (monomerChemistry(unit.monomer) === void 0) {
        return `${conjugate.conjugate_id}: ${unit.monomer} is not a known monomer`;
      }
      names.push(unit.monomer);
      const here = names.length - 1;
      joins.push([previous, { unit: here, point: unit.in }]);
      if (unit.out !== void 0) {
        previous = { unit: here, point: unit.out };
      } else if (index < conjugate.units.length - 1) {
        return `${conjugate.conjugate_id}: unit ${index + 1} has no out, but another unit follows`;
      }
    }
  }
  return null;
}
function checkJoins(names, joins, bonded) {
  for (const [a, b] of joins) {
    for (const end of [a, b]) {
      if (attachmentAt(names[end.unit], end.point) === void 0) {
        return `${names[end.unit]} has no attachment ${end.point}, so a bond cannot use it`;
      }
      if (bonded[end.unit].has(end.point)) {
        return `attachment ${end.point} of ${names[end.unit]} is already bonded, so a second bond cannot use it`;
      }
      bonded[end.unit].add(end.point);
    }
  }
  return null;
}
function openStereo(names, length) {
  const unspecified = [];
  const openGeometry = [];
  names.forEach((name, unit) => {
    const where = unit < length ? `${name} at position ${unit + 1}` : name;
    const chemistry = monomerChemistry(name);
    if ((chemistry?.unspecifiedCentres ?? 0) > 0) unspecified.push(where);
    if ((chemistry?.unspecifiedGeometry ?? 0) > 0) openGeometry.push(where);
  });
  return {
    ...unspecified.length === 0 ? {} : { unspecified },
    ...openGeometry.length === 0 ? {} : { openGeometry }
  };
}
function assembleAsText(names, fragments, joins, bonded) {
  bonded.forEach((set) => set.clear());
  try {
    joins.forEach(([a, b], index) => {
      const ring = `%${10 + index}`;
      for (const end of [a, b]) {
        fragments[end.unit] = openPoint(fragments[end.unit], end.point, ring);
        bonded[end.unit].add(end.point);
      }
    });
  } catch (error) {
    return {
      smiles: null,
      reason: error instanceof Error ? error.message : "a bond could not be placed"
    };
  }
  for (let unit = 0; unit < names.length; unit += 1) {
    for (const point of [1, 2, 3]) {
      if (bonded[unit].has(point)) continue;
      const attachment = attachmentAt(names[unit], point);
      if (attachment === void 0) continue;
      fragments[unit] = closePoint(fragments[unit], point, attachment.free);
    }
  }
  return { smiles: fragments.join("."), reason: null };
}
function assembleChain(chain, bonds, chainId, conjugates = [], gaps = []) {
  const length = chain.sequence.length;
  if (length === 0) return { smiles: null, reason: "the chain has no residues" };
  const gap = gapRefusal(gaps);
  if (gap !== null) return { smiles: null, reason: gap };
  const residues = residueNames(chain);
  if (residues.reason !== null) return { smiles: null, reason: residues.reason };
  const names = residues.names;
  const joins = backboneJoins(length);
  const refusal = addCaps(chain, length, names, joins) ?? addBondJoins(bonds, chainId, joins) ?? addConjugates(conjugates, chainId, names, joins);
  if (refusal !== null) return { smiles: null, reason: refusal };
  if (joins.length > 90) {
    return {
      smiles: null,
      reason: `${joins.length} bonds is past the ${90} this assembler can number at once`
    };
  }
  const fragments = names.map((name) => monomerChemistry(name)?.smiles ?? "");
  if (fragments.some((fragment) => fragment === "")) {
    return { smiles: null, reason: "a monomer in this chain has no structure on file" };
  }
  const bonded = names.map(() => /* @__PURE__ */ new Set());
  const unusable = checkJoins(names, joins, bonded);
  if (unusable !== null) return { smiles: null, reason: unusable };
  const stereo = openStereo(names, length);
  const welded = weldWithRdkit(names, fragments, joins);
  if (welded !== null) {
    return { smiles: welded, reason: null, builtBy: "graph", ...stereo };
  }
  const built = assembleAsText(names, fragments, joins, bonded);
  if (built.smiles === null) return built;
  return { smiles: built.smiles, reason: null, builtBy: "text", ...stereo };
}

// src/prose.ts
function span(start, end) {
  return start === end ? `${start}` : `${start}\u2013${end}`;
}
function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
function joinWords(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
function featureName(feature, regions) {
  return feature.label ?? regions.get(feature.region_id)?.name ?? feature.region_id;
}
function regionsAcross(features, regions, start, end) {
  const names = [];
  for (const feature of [...features].sort((a, b) => a.start - b.start)) {
    if (feature.end < start || feature.start > end) continue;
    const name = featureName(feature, regions);
    if (!names.includes(name)) names.push(name);
  }
  return names;
}
function whereClause(names, preposition) {
  return names.length === 0 ? "" : ` ${preposition} ${joinWords(names)}`;
}
function consumed(edit) {
  if (edit.op === "insert") return null;
  if (edit.op === "substitute") return { start: edit.position, end: edit.position };
  return { start: edit.start, end: edit.end };
}
function editTouches(edit, feature) {
  if (edit.op === "insert") return feature.start < edit.at && feature.end >= edit.at;
  const span2 = consumed(edit);
  return span2.start <= feature.end && span2.end >= feature.start;
}
function editSentences(edits, parentFeatures, regions, parentLength) {
  const sentences = [];
  const substitutions = edits.filter(
    (edit) => edit.op === "substitute"
  );
  for (const edit of edits) {
    if (edit.op === "delete") {
      const names = regionsAcross(parentFeatures, regions, edit.start, edit.end);
      sentences.push(
        `Delete residues ${span(edit.start, edit.end)}${whereClause(names, "from")} (${plural(edit.end - edit.start + 1, "residue")}).`
      );
    } else if (edit.op === "insert") {
      const length = edit.sequence.length;
      if (edit.at === 1) {
        sentences.push(`Add ${plural(length, "residue")} at the N-terminus.`);
      } else if (edit.at > parentLength) {
        sentences.push(`Add ${plural(length, "residue")} at the C-terminus.`);
      } else {
        const split = [
          ...new Set(
            parentFeatures.filter((feature) => feature.start < edit.at && feature.end >= edit.at).map((feature) => featureName(feature, regions))
          )
        ];
        let where = whereClause(split, "inside");
        if (split.length === 0) {
          const before = parentFeatures.find((feature) => feature.end === edit.at - 1);
          const after = parentFeatures.find((feature) => feature.start === edit.at);
          if (before !== void 0 && after !== void 0) {
            where = ` between ${featureName(before, regions)} and ${featureName(after, regions)}`;
          }
        }
        sentences.push(
          `Insert ${plural(length, "residue")} before position ${edit.at}${where}.`
        );
      }
    } else if (edit.op === "replace") {
      const names = regionsAcross(parentFeatures, regions, edit.start, edit.end);
      const removed = edit.end - edit.start + 1;
      sentences.push(
        `Replace residues ${span(edit.start, edit.end)}${whereClause(names, "of")} with ${plural(edit.sequence.length, "residue")}${edit.sequence.length === removed ? "" : ` (was ${plural(removed, "residue")})`}.`
      );
    }
  }
  if (substitutions.length > 0) {
    const names = [];
    for (const edit of [...substitutions].sort((a, b) => a.position - b.position)) {
      for (const name of regionsAcross(parentFeatures, regions, edit.position, edit.position)) {
        if (!names.includes(name)) names.push(name);
      }
    }
    const listed = substitutions.map((edit) => `${edit.from}${edit.position}${edit.to}`).join(", ");
    sentences.push(
      `Substitute ${plural(substitutions.length, "residue")}${whereClause(names, "in")}: ${listed}.`
    );
  }
  return sentences;
}
function retainedRegions(edits, parentFeatures, regions) {
  const sorted = [...parentFeatures].sort((a, b) => a.start - b.start);
  const names = [];
  const edited = /* @__PURE__ */ new Set();
  for (const feature of sorted) {
    const name = featureName(feature, regions);
    if (edits.some((edit) => editTouches(edit, feature))) edited.add(name);
    else if (!names.includes(name)) names.push(name);
  }
  return names.filter((name) => !edited.has(name));
}
function proseFrom(edits, parentFeatures, regions, parentLength) {
  const sentences = editSentences(edits, parentFeatures, regions, parentLength);
  if (sentences.length === 0) return null;
  const retained = retainedRegions(edits, parentFeatures, regions);
  const tail = retained.length === 0 ? "" : ` Retains ${joinWords(retained)}.`;
  return `${sentences.join(" ")}${tail}`;
}
function editProseForChains(chains, parentFeatures, regions) {
  const multi = chains.length > 1;
  const matched = chains.filter((entry) => entry.parentChain !== null);
  const omittedMeans = matched.length === 1 ? matched[0].chain.chain_id : SINGLE_CHAIN_ID;
  const parts = [];
  for (const entry of chains) {
    const edits = entry.chain.edits;
    if (edits === void 0 || edits.length === 0 || entry.parentChain === null) continue;
    const mine = parentFeatures.filter(
      (feature) => (feature.chain_id ?? omittedMeans) === entry.chain.chain_id
    );
    const text = proseFrom(edits, mine, regions, entry.parentChain.sequence.length);
    if (text === null) continue;
    parts.push(multi ? `${entry.chain.name}: ${text}` : text);
  }
  return parts.length === 0 ? null : parts.join(" ");
}

// src/document.ts
var h = escapeXml;
function sourceLink(source) {
  return `<a class="cm-source-link" href="${h(source.url)}" target="_blank" rel="noopener noreferrer">${h(source.title)}</a>`;
}
function observationBlock(observation, source) {
  const missing = source === void 0 ? '<span class="cm-warn">Source not found in the record.</span>' : "";
  return `<li class="cm-observation"><p class="cm-finding">${h(observation.finding)}</p><p class="cm-context">${h(observation.context)} \xB7 ${h(observation.locator)}</p><p class="cm-cite">${source === void 0 ? "" : sourceLink(source)}</p>` + missing + `</li>`;
}
function sameText(a, b) {
  if (a === void 0 || b === void 0) return false;
  const norm = (v) => v.trim().toLowerCase().replace(/\s+/g, " ");
  return norm(a) === norm(b);
}
function section(label, body) {
  return `<section class="cm-section"><h4 class="cm-section-label">${h(label)}</h4><div class="cm-section-body">${body}</div></section>`;
}
function hypothesisSection(normalized, model) {
  const { variant } = normalized;
  const hypothesis = variant.hypothesis_id === void 0 ? void 0 : model.hypotheses.get(variant.hypothesis_id);
  const rationale = variant.rationale;
  const question = rationale?.hypothesis ?? hypothesis?.question;
  if (question === void 0) return "";
  const lines = [`<p class="cm-section-text">${h(question)}</p>`];
  if (rationale?.uncertainty !== void 0) {
    lines.push(
      `<p class="cm-section-aside"><span>Caveats:</span> ${h(rationale.uncertainty)}</p>`
    );
  }
  return section("Hypothesis", lines.join(""));
}
function editSection(normalized, model, rootId) {
  const { variant } = normalized;
  const derived = editProseForChains(normalized.chains, normalized.parent?.features ?? [], model.regions);
  const authored = variant.rationale?.edit;
  const text = derived ?? authored;
  const body = [];
  if (text !== void 0 && text !== null) body.push(`<p class="cm-section-text">${h(text)}</p>`);
  if (derived !== null && authored !== void 0 && !sameText(derived, authored)) {
    body.push(`<p class="cm-section-aside"><span>As described</span> ${h(authored)}</p>`);
  }
  if (derived === null && authored !== void 0 && normalized.correspondence.provenance === "derived") {
    body.push(
      `<p class="cm-section-aside"><span>Coordinates</span> No edits are declared, so the positions above come from the author's description and were not derived from an edit list.</p>`
    );
  }
  const assembly = assemblyBody(normalized, model, rootId);
  if (assembly !== "") body.push(assembly);
  if (body.length === 0) return "";
  return section("Proposed edit", body.join(""));
}
function sequenceSection(normalized, model) {
  const { variant } = normalized;
  const boundaries = variant.features.map((feature) => {
    const region = model.regions.get(feature.region_id);
    const evidence = feature.evidence ?? "unknown";
    return `<li data-instance-id="${h(feature.instance_id)}" data-region-id="${h(feature.region_id)}"><span class="cm-boundary-name">${h(feature.label ?? region?.name ?? feature.region_id)}</span><span class="cm-boundary-range">${feature.start}\u2013${feature.end}</span><span class="cm-boundary-count">${feature.end - feature.start + 1} aa</span><span class="cm-boundary-evidence">${h(EVIDENCE_STYLES[evidence].description)}</span></li>`;
  }).join("");
  const parentLine = normalized.parent === null ? "" : `<p class="cm-detail-line"><span>Derived from</span> ${h(normalized.parent.name)}</p>`;
  const accession = variant.reference_id === void 0 ? "" : `<p class="cm-detail-line"><span>Reference accession</span> ${h(variant.reference_id)}</p>`;
  const correspondence = normalized.correspondence.provenance === "none" ? "" : `<p class="cm-correspondence${normalized.correspondence.ambiguous ? " cm-ambiguous" : ""}">${h(normalized.correspondence.summary)}</p>`;
  return section(
    "Sequence",
    `<p class="cm-detail-line"><span>Coordinates</span> 1-based inclusive, within this construct \xB7 ${chainSummary(normalized)}</p>` + parentLine + accession + chainBlocks(normalized) + `<ul class="cm-boundaries">${boundaries}</ul>` + correspondence
  );
}
function sitesBody(presences, model, rootId, variantId) {
  const mine = presences.filter((presence) => presence.variantId === variantId);
  if (mine.length === 0) return "";
  const byId = new Map((model.record.sites ?? []).map((site) => [site.site_id, site]));
  const items = mine.map((presence) => {
    const site = byId.get(presence.siteId);
    if (site === void 0) return "";
    const span2 = presence.positions.length === 1 ? `${presence.positions[0]}` : `${presence.positions[0]}\u2013${presence.positions[presence.positions.length - 1]}`;
    const inherited = presence.origin !== "declared";
    const sourceName = model.variants.find((v) => v.variant.variant_id === site.applies_to)?.variant.name ?? site.applies_to;
    const evidence = inherited && site.evidence === "measured" ? "established_elsewhere" : site.evidence ?? "unknown";
    const attribution = inherited ? `<p class="cm-site-origin">From ${h(sourceName)}</p>` : "";
    const integrity = presence.complete ? "" : `<span class="cm-site-partial">${presence.retained}/${presence.total} residues unchanged${presence.substituted > 0 ? `; ${presence.substituted} substituted` : ""}.</span>`;
    const observations = (site.observations ?? []).map((observation) => observationBlock(observation, model.sources.get(observation.source_id))).join("");
    return `<li class="cm-site-item"><details><summary class="cm-site-head"><span class="cm-site-label">${h(site.label)}</span><span class="cm-site-range">${h(span2)}</span></summary><p class="cm-site-note">${h(site.role)} \xB7 ${h(EVIDENCE_STYLES[evidence].description)}</p>` + attribution + integrity + (site.note === void 0 ? "" : `<p class="cm-site-note">${h(site.note)}</p>`) + (observations === "" ? "" : `<ul class="cm-observations">${observations}</ul>`) + `</details></li>`;
  }).join("");
  return `<div class="cm-sites-body" id="${h(rootId)}-sites-${h(variantId)}"><p class="cm-section-aside"><span>Sites</span> (${mine.length})</p><ul class="cm-site-list">${items}</ul></div>`;
}
function assemblyBody(normalized, model, rootId) {
  const assembly = normalized.variant.assembly;
  if (assembly === void 0) return "";
  const donors = new Map((model.record.donors ?? []).map((donor) => [donor.donor_id, donor]));
  const rows = assembly.segments.map((segment) => {
    const length = segment.end - segment.start + 1;
    const label = segment.label ?? segment.segment_id;
    if (segment.kind === "literal") {
      return `<li class="cm-seg-item cm-seg-literal"><span class="cm-seg-name">${h(label)}</span><span class="cm-seg-range">${segment.start}\u2013${segment.end}</span><span class="cm-seg-len">${length} aa</span><span class="cm-seg-origin">synthetic \u2014 not from any donor</span>` + (segment.note === void 0 ? "" : `<span class="cm-seg-note">${h(segment.note)}</span>`) + `</li>`;
    }
    const donor = donors.get(segment.donor_id);
    const accession = donor?.accession === void 0 ? "" : ` \xB7 ${h(donor.accession.database)} ${h(donor.accession.accession)}`;
    return `<li class="cm-seg-item"><span class="cm-seg-name">${h(label)}</span><span class="cm-seg-range">${segment.start}\u2013${segment.end}</span><span class="cm-seg-len">${length} aa</span><span class="cm-seg-origin">from <strong>${h(donor?.name ?? segment.donor_id)}</strong> ${segment.donor_start}\u2013${segment.donor_end}${accession}</span></li>`;
  }).join("");
  const donorCount = new Set(
    assembly.segments.filter((s) => s.kind === "donor").map((s) => s.donor_id)
  ).size;
  return `<div class="cm-assembly-body" id="${h(rootId)}-assembly-${h(normalized.variant.variant_id)}"><p class="cm-section-aside"><span>Assembled</span> ${assembly.segments.length} segments from ${donorCount} donor${donorCount === 1 ? "" : "s"}, each checked against its donor sequence</p><ul class="cm-seg-list">${rows}</ul><p class="cm-assembly-note">Every segment reproduces its donor exactly and the segments account for all ${normalized.length} residues. This verifies sequence identity. Where each donor sequence came from is declared by the record.</p></div>`;
}
function stoichiometry(normalized) {
  const instances = normalized.chains.reduce(
    (sum, nchain) => sum + (nchain.chain.copies ?? 1),
    0
  );
  if (instances < 2) return "";
  return `<span class="cm-stoich">${instances} polypeptides</span>`;
}
function constructDescription(normalized, model) {
  const { variant } = normalized;
  const parts = [];
  const edit = editProseForChains(normalized.chains, normalized.parent?.features ?? [], model.regions);
  if (edit !== null) parts.push(edit);
  const hypothesis = variant.hypothesis_id === void 0 ? void 0 : model.hypotheses.get(variant.hypothesis_id);
  const question = variant.rationale?.hypothesis ?? hypothesis?.question;
  if (question !== void 0) parts.push(`Tests: ${question}`);
  if (variant.note !== void 0) parts.push(variant.note);
  return parts.length === 0 ? null : parts.join(" ");
}
function evidenceSection(normalized, model, rootId, sitePresence) {
  const rationale = normalized.variant.rationale;
  const body = [];
  if (rationale !== void 0) {
    body.push(
      rationale.observations.length === 0 ? `<p class="cm-no-observation">No direct supporting observation was supplied. This is an exploratory proposal; the gap is recorded and no citation is supplied.</p>` : `<ul class="cm-observations">${rationale.observations.map(
        (observation) => observationBlock(observation, model.sources.get(observation.source_id))
      ).join("")}</ul>`
    );
  }
  const sites = sitesBody(sitePresence, model, rootId, normalized.variant.variant_id);
  if (sites !== "") body.push(sites);
  if (body.length === 0) return "";
  return section("Evidence", body.join(""));
}
function variantCard(normalized, model, rootId, sitePresence = [], options = {}) {
  const { variant } = normalized;
  const description = constructDescription(normalized, model);
  const head = options.header === false ? "" : `<header class="cm-card-head"><h3 class="cm-card-title">${h(variant.name)}` + (variant.headline === void 0 ? "" : `<span class="cm-card-headline"> \u2014 ${h(variant.headline)}</span>`) + `</h3><p class="cm-card-meta"><span class="cm-length">${normalized.length} aa</span>` + stoichiometry(normalized) + `</p></header>` + (description === null ? "" : `<p class="cm-card-note">${h(description)}</p>`);
  const note = options.header === false && variant.note !== void 0 ? `<p class="cm-card-note">${h(variant.note)}</p>` : "";
  return `<article class="cm-card" data-variant-id="${h(variant.variant_id)}" id="${h(rootId)}-card-${h(variant.variant_id)}">` + head + note + hypothesisSection(normalized, model) + editSection(normalized, model, rootId) + evidenceSection(normalized, model, rootId, sitePresence) + chemistrySection(normalized) + sequenceSection(normalized, model) + `</article>`;
}
function groupHeading(group, index, declared, rootId) {
  if (group.hypothesis === null) return "";
  const { hypothesis } = group;
  const bodyId = `${rootId}-hypothesis-${hypothesis.hypothesis_id}-detail`;
  return `<header class="cm-group-head" data-hypothesis-id="${h(hypothesis.hypothesis_id)}"><div class="cm-group-line-head"><button type="button" class="cm-expand" data-expand-hypothesis="${h(hypothesis.hypothesis_id)}" aria-expanded="true" aria-controls="${h(bodyId)}" aria-label="Rationale for hypothesis ${index}"><span class="cm-expand-mark" aria-hidden="true"></span></button><h2 class="cm-group-title"><span class="cm-group-index">Hypothesis ${index}</span> ${h(hypothesis.question)}</h2></div><div class="cm-group-detail" id="${h(bodyId)}"><p class="cm-group-line"><span>Rationale:</span> ${h(hypothesis.mechanism)}</p></div></header>`;
}
function objectiveLine(model) {
  const objective = model.record.objective;
  if (objective === void 0) return "";
  return `<p class="cm-objective">${h(objective)}</p>`;
}
function chemistrySection(normalized) {
  const { variant } = normalized;
  const bonds = variant.chemistry?.bonds ?? [];
  const conjugates = variant.chemistry?.conjugates ?? [];
  const rows = [];
  for (const nchain of normalized.chains) {
    const { chain } = nchain;
    const multi = normalized.chains.length > 1;
    const where = (text) => multi ? `${h(chain.name)}: ${text}` : text;
    for (const cap of chain.chemistry?.caps ?? []) {
      const named = monomerChemistry(cap.monomer);
      rows.push(
        `<li>${where(
          `the ${cap.terminus} terminus carries <code>${h(cap.monomer)}</code>` + (named === void 0 ? "" : ` (${h(named.chemicalName)})`)
        )}${cap.note === void 0 ? "" : ` ${h(cap.note)}`}</li>`
      );
    }
    for (const residue of chain.chemistry?.residues ?? []) {
      const named = monomerChemistry(residue.monomer);
      rows.push(
        `<li>${where(
          `position ${residue.position} is <code>${h(residue.monomer)}</code>` + (named === void 0 ? "" : ` (${h(named.chemicalName)})`) + // Both branches state the same two facts in the same order: what the
          // monomer is, and which letter carries it.
          (chain.sequence[residue.position - 1] === "X" ? `, written X in the sequence, having no natural analogue` : `, written ${h(chain.sequence[residue.position - 1] ?? "?")} in the sequence`)
        )}${residue.note === void 0 ? "" : ` ${h(residue.note)}`}</li>`
      );
    }
  }
  for (const bond of bonds) {
    const end = (side) => `${side.chain_id === void 0 ? "" : `${h(side.chain_id)} `}${side.position}${side.copy === void 0 ? "" : ` (copy ${side.copy})`}`;
    rows.push(
      `<li><code>${h(bond.bond_id)}</code> is a ${h(bond.kind)} bond joining ${end(bond.a)} and ${end(bond.b)}${bond.note === void 0 ? "" : ` ${h(bond.note)}`}</li>`
    );
  }
  for (const conjugate of conjugates) {
    const units = conjugate.units.map((unit) => {
      const named = monomerChemistry(unit.monomer);
      return `<code>${h(unit.monomer)}</code>${named === void 0 ? "" : ` (${h(named.chemicalName)})`}`;
    }).join(", then ");
    const where = `${conjugate.anchor.chain_id === void 0 ? "" : `${h(conjugate.anchor.chain_id)} `}${conjugate.anchor.position}`;
    rows.push(
      `<li><code>${h(conjugate.conjugate_id)}</code> hangs from position ${where}: ${units}${conjugate.note === void 0 ? "" : ` ${h(conjugate.note)}`}</li>`
    );
  }
  const unexpressed = variant.unexpressed_chemistry ?? [];
  for (const entry of unexpressed) {
    rows.push(
      `<li><strong>Not encoded:</strong> ${entry.position === void 0 ? "" : `position ${entry.position}, `}${h(entry.what)}${entry.chain_id === void 0 ? "" : ` on ${h(entry.chain_id)}`} \u2014 ${h(entry.why)}</li>`
    );
  }
  if (rows.length === 0) return "";
  const molecules = normalized.chains.map((nchain) => {
    const chainGaps = unexpressed.filter(
      (entry) => (entry.chain_id ?? nchain.chain.chain_id) === nchain.chain.chain_id
    );
    const built = assembleChain(
      nchain.chain,
      bonds,
      nchain.chain.chain_id,
      conjugates,
      chainGaps
    );
    const copies = nchain.chain.copies ?? 1;
    const label = normalized.chains.length > 1 || copies > 1 ? `<span>${h(nchain.chain.name)}${copies > 1 ? ` (copy 1 of ${copies})` : ""}</span>` : "";
    if (built.smiles === null) {
      return `<p class="cm-card-note">${label}No structure derived: ${h(built.reason ?? "unstated")}.</p>`;
    }
    const form = built.builtBy === "text" ? `<p class="cm-card-note">Written as ring-closure fragments because RDKit was unavailable at render time. The fragments describe one molecule, and some drawing tools refuse the form. Rendering again with RDKit installed gives ordinary SMILES.</p>` : "";
    const target = `${variant.variant_id}:${nchain.chain.chain_id}:smiles`;
    return label + `<div class="cm-copy-row"><button type="button" class="cm-copy" data-copy-kind="smiles" data-copy-target="${h(target)}">Copy SMILES</button><span class="cm-copy-status" role="status" aria-live="polite"></span></div><code class="cm-sequence" data-sequence-for="${h(target)}">${h(built.smiles)}</code>` + (built.unspecified === void 0 ? "" : `<p class="cm-card-note">Unspecified stereocentre: ${h(built.unspecified.join(", "))}. The structure does not identify a single enantiomer.</p>`) + // A separate sentence, because it is a separate ambiguity with a separate
    // remedy: not which enantiomer, but which geometric isomer.
    (built.openGeometry === void 0 ? "" : `<p class="cm-card-note">Unspecified double-bond geometry: ${h(built.openGeometry.join(", "))}. The structure does not identify E or Z.</p>`) + form;
  }).join("");
  return section(
    "Chemistry",
    // Export is refused for ANY chain carrying chemistry -- a single D-residue is
    // enough -- so that sentence belongs here rather than beside the gap note,
    // where it would be hidden from the common case.
    `<p class="cm-card-note">Chemical modifications are listed below. Sequence-only export is unavailable for these constructs.</p><ul class="cm-attempts">${rows.join("")}</ul>${molecules}`
  );
}
function attemptsSection(model) {
  const attempts = model.record.attempted_analyses ?? [];
  if (attempts.length === 0) return "";
  const named = (attempt) => {
    const variant = model.variants.find((v) => v.variant.variant_id === attempt.target);
    const base = attempt.target_kind === "donor" ? (model.record.donors ?? []).find((d) => d.donor_id === attempt.target)?.name ?? attempt.target : variant?.variant.name ?? attempt.target;
    const chain = attempt.chain_id === void 0 || attempt.chain_id === SINGLE_CHAIN_ID ? "" : ` (${h(
      variant?.chains.find((c) => c.chain.chain_id === attempt.chain_id)?.chain.name ?? attempt.chain_id
    )} chain)`;
    return `${h(base)}${chain}`;
  };
  const rows = attempts.map(
    (attempt) => `<li><span class="cm-attempt-target">${named(attempt)}</span> ${h(attempt.reason)}` + (attempt.attempted === void 0 ? "" : ` <span>${h(attempt.attempted)}</span>`) + `</li>`
  ).join("");
  const plural2 = attempts.length === 1 ? "measure was" : "measures were";
  return section(
    "Not measured",
    `<p class="cm-card-note">${attempts.length} ${plural2} attempted and returned nothing usable. Each reason is below.</p><ul class="cm-attempts">${rows}</ul>`
  );
}
function sourcesSection(model, rootId) {
  if (model.record.sources.length === 0) return "";
  const items = model.record.sources.map(
    (source) => `<li id="${h(rootId)}-source-${h(source.id)}"><p class="cm-cite">${sourceLink(source)}</p></li>`
  ).join("");
  return `<section class="cm-sources"><h2>Sources</h2><ul>${items}</ul></section>`;
}
function chainSummary(normalized) {
  const chains = normalized.chains;
  const copiesOf = (chain) => chain.chain.copies ?? 1;
  const assembled = chains.reduce((sum, c) => sum + c.length * copiesOf(c), 0);
  const parts = chains.map((c) => copiesOf(c) > 1 ? `${c.length} \xD7 ${copiesOf(c)}` : `${c.length}`).join(" + ");
  if (chains.length === 1) {
    return copiesOf(chains[0]) === 1 ? `${chains[0].length} aa` : `${parts} = ${assembled} aa assembled`;
  }
  return `${chains.length} chains, ${parts} = ${assembled} aa assembled`;
}
function markedSequence(sequence, correspondence) {
  if (correspondence.provenance === "none" || correspondence.segments.length === 0) {
    return h(sequence);
  }
  const out = [];
  let cursor = 1;
  for (const segment of [...correspondence.segments].sort((a, b) => a.start - b.start)) {
    if (segment.start > cursor) out.push(h(sequence.slice(cursor - 1, segment.start - 1)));
    const text = h(sequence.slice(segment.start - 1, segment.end));
    out.push(
      segment.kind === "retained" ? text : `<span class="cm-seq-run" data-origin="${h(segment.kind)}">${text}</span>`
    );
    cursor = segment.end + 1;
  }
  if (cursor <= sequence.length) out.push(h(sequence.slice(cursor - 1)));
  return out.join("");
}
function changeKey(correspondence) {
  if (correspondence.provenance === "none") return "";
  const kinds = new Set(correspondence.segments.map((segment) => segment.kind));
  const parts = [];
  if (kinds.has("inserted")) {
    parts.push(`<span class="cm-seq-run" data-origin="inserted">added</span>`);
  }
  if (kinds.has("substituted")) {
    parts.push(`<span class="cm-seq-run" data-origin="substituted">substituted</span>`);
  }
  if (parts.length === 0) return "";
  const basis = correspondence.provenance === "declared" ? "from the declared edits" : "inferred from the sequences";
  return `<p class="cm-section-aside"><span>Marked</span> ${parts.join(", ")} \xB7 ${basis}</p>`;
}
function chainBlocks(normalized) {
  const { variant } = normalized;
  return normalized.chains.map((nchain) => {
    const chain = nchain.chain;
    const multi = normalized.chains.length > 1;
    const target = multi ? `${variant.variant_id}:${chain.chain_id}` : variant.variant_id;
    const copies = (chain.copies ?? 1) > 1 ? ` \xD7${chain.copies}` : "";
    const heading = multi || copies !== "" ? `<p class="cm-detail-line"><span>${h(chain.name)}${copies}</span>${nchain.length} aa${chain.reference_id === void 0 ? "" : ` \xB7 ${h(chain.reference_id)}`}</p>` : "";
    return heading + `<div class="cm-copy-row"><button type="button" class="cm-copy" data-copy-target="${h(target)}">Copy ${multi ? `${h(chain.name)} ` : ""}sequence</button><span class="cm-copy-status" role="status" aria-live="polite"></span></div><code class="cm-sequence" data-sequence-for="${h(target)}">${markedSequence(chain.sequence, nchain.correspondence)}</code>` + changeKey(nchain.correspondence);
  }).join("");
}
function documentStyle(rootId, theme) {
  const s = `#${rootId}`;
  return `
${themeCss(s, theme)}
${s}{--cm-max:72ch;color:var(--cm-text-primary);background:var(--cm-surface);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;line-height:1.55;font-size:15px;box-sizing:border-box}
${s} *,${s} *::before,${s} *::after{box-sizing:inherit}
${s} h1,${s} h2,${s} h3,${s} h4{margin:0;font-weight:600;letter-spacing:-.01em}
${s} p{margin:0}
${s} .cm-head{margin:0 0 26px}
${s} .cm-title{font-size:clamp(25px,3vw,32px);line-height:1.12;letter-spacing:-.021em}
${s} .cm-subtitle{margin-top:8px;color:var(--cm-text-secondary);font-size:13px;max-width:var(--cm-max)}
${s} .cm-toolbar{display:flex;flex-wrap:wrap;gap:2px 4px;align-items:center;margin:0 0 18px;
  padding-bottom:10px;border-bottom:1px solid var(--cm-border)}
${s} .cm-action{font:inherit;font-size:13px;padding:6px 10px;border-radius:6px;border:1px solid transparent;
  background:none;color:var(--cm-text-secondary);cursor:pointer;min-height:34px}
/* Guarded: an unconditional transition animates for readers who asked for no
   motion, and the reduced-motion check counts every animated element. */
@media (prefers-reduced-motion:no-preference){
${s} .cm-action{transition:background-color .12s ease-out,color .12s ease-out}}
${s} .cm-action:hover{background:var(--cm-surface-sunken);color:var(--cm-text-primary)}
${s} .cm-action:focus-visible{outline:2px solid var(--cm-text-primary);outline-offset:2px}
${s} .cm-action-status,${s} .cm-copy-status{font-size:12.5px;color:var(--cm-text-secondary);min-height:1em}
${s} .cm-action-status[data-state="error"],${s} .cm-copy-status[data-state="error"]{color:#c0362c}
${s} .cm-figure-holder{margin:0 0 6px;overflow:visible}
${s} .cm-figure-holder svg{display:block;width:100%;height:auto}
${s} .cm-figure-hint{color:var(--cm-text-muted);font-size:12.5px;margin:0 0 20px;max-width:var(--cm-max)}
${s} .cm-warnings{border-left:3px solid var(--cm-series-orange);padding:10px 0 10px 14px;margin:0 0 22px}
${s} .cm-warnings h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--cm-text-secondary)}
${s} .cm-warnings ul{margin:6px 0 0;padding-left:18px;font-size:13.5px;color:var(--cm-text-secondary)}
${s} .cm-cards{display:flex;flex-direction:column;gap:0}
${s} .cm-card{border-top:1px solid var(--cm-border);padding:18px 0}
${s} .cm-card[data-dim="true"]{opacity:.45}
${s} .cm-card-head{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;justify-content:space-between}
${s} .cm-card-title{font-size:16.5px}
${s} .cm-card-meta{display:flex;gap:10px;align-items:baseline;font-size:12.5px;color:var(--cm-text-secondary)}
${s} .cm-length{font-variant-numeric:tabular-nums}
${s} .cm-attempts{margin:6px 0 0;padding-left:18px;font-size:13.5px;color:var(--cm-text-secondary)}
${s} .cm-attempts li{margin:3px 0}
${s} .cm-attempt-target{color:var(--cm-text-primary);font-weight:600}
${s} .cm-stoich{font-variant-numeric:tabular-nums}
${s} .cm-card-note{margin-top:5px;color:var(--cm-text-secondary);font-size:13.5px;max-width:var(--cm-max)}
${s} details{margin-top:12px}
${s} summary{cursor:pointer;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;padding:7px 0;min-height:32px;list-style:none}
${s} summary::-webkit-details-marker{display:none}
${s} summary::before{content:"";width:7px;height:7px;border-right:1.5px solid var(--cm-text-muted);border-bottom:1.5px solid var(--cm-text-muted);transform:rotate(-45deg);margin-right:4px;flex:none;align-self:center}
${s} details[open]>summary::before{transform:rotate(45deg)}
@media (prefers-reduced-motion:no-preference){${s} summary::before{transition:transform .15s ease-out}}
${s} summary:focus-visible{outline:2px solid var(--cm-text-primary);outline-offset:2px;border-radius:4px}
${s} .cm-summary-text{font-weight:500;font-size:14px}
${s} .cm-summary-hint{color:var(--cm-text-muted);font-size:12.5px}
${s} .cm-section{margin:14px 0 0;max-width:var(--cm-max)}
${s} .cm-section-label{font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--cm-text-muted);font-weight:600}
${s} .cm-section-body{margin-top:4px;padding-left:12px;border-left:2px solid var(--cm-border)}
${s} .cm-section-text{font-size:14px}
${s} .cm-section-aside{margin-top:5px;font-size:12.5px;color:var(--cm-text-muted)}
${s} .cm-section-aside span:first-child{color:var(--cm-text-secondary);margin-right:5px;font-weight:500}
${s} .cm-card-headline{font-weight:500;color:var(--cm-text-secondary)}
${s} .cm-seq-run{border-radius:3px;padding:0 1px}
${s} .cm-seq-run[data-origin="inserted"]{background:var(--cm-series-aqua);color:var(--cm-surface);font-weight:600}
${s} .cm-seq-run[data-origin="substituted"]{background:var(--cm-series-orange);color:var(--cm-surface);font-weight:600}
${s} .cm-objective{margin-top:10px;font-size:16.5px;line-height:1.45;max-width:58ch;
  color:var(--cm-text-secondary)}
${s} .cm-group{margin:0}
${s} .cm-group-head{margin:0}
${s} .cm-group-line-head{display:flex;align-items:flex-start;gap:4px}
${s} .cm-group-detail{margin:7px 0 0;max-width:60ch}
${s} .cm-group-detail[hidden]{display:none}
${s} .cm-group-title{font-size:13px;line-height:1.4;letter-spacing:0;max-width:58ch;font-weight:600}
${s} .cm-group-index{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.09em;
  color:var(--cm-text-muted);font-weight:600;margin-bottom:2px}
${s} .cm-group-line{margin-top:5px;font-size:12px;line-height:1.45;color:var(--cm-text-muted)}
${s} .cm-group-line span:first-child{color:var(--cm-text-secondary);margin-right:5px;font-weight:500}
${s} .cm-observations{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:14px}
${s} .cm-observation{padding-left:12px;border-left:2px solid var(--cm-border)}
${s} .cm-finding{font-size:14px}
${s} .cm-context{font-size:12.5px;color:var(--cm-text-muted)}
${s} .cm-context{margin-top:3px}
${s} .cm-cite{margin-top:3px;font-size:13px}
${s} .cm-no-observation{font-size:13.5px;color:var(--cm-text-secondary);margin-top:6px}
${s} a{color:var(--cm-series-blue);overflow-wrap:anywhere}
${s} .cm-detail-line{font-size:13px;color:var(--cm-text-secondary);margin-bottom:4px}
${s} .cm-detail-line span:first-child{color:var(--cm-text-muted);margin-right:6px}
${s} .cm-copy-row{display:flex;gap:10px;align-items:center;margin:10px 0 8px;flex-wrap:wrap}
${s} .cm-copy{font:inherit;font-size:12.5px;padding:5px 10px;border-radius:6px;border:1px solid var(--cm-border-strong);background:var(--cm-surface-sunken);color:var(--cm-text-primary);cursor:pointer;min-height:32px}
${s} .cm-copy:focus-visible{outline:2px solid var(--cm-text-primary);outline-offset:2px}
${s} .cm-sequence{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.7;overflow-wrap:anywhere;word-break:break-all;background:var(--cm-surface-sunken);padding:10px 12px;border-radius:6px;color:var(--cm-text-primary)}
${s} .cm-boundaries{list-style:none;margin:12px 0 0;padding:0;font-size:13px;display:flex;flex-direction:column;gap:2px}
${s} .cm-boundaries li{display:grid;grid-template-columns:minmax(64px,auto) auto auto 1fr;gap:4px 12px;padding:4px 6px;border-radius:5px;align-items:baseline}
${s} .cm-boundaries li[data-highlight="true"]{background:var(--cm-surface-sunken)}
${s} .cm-boundary-name{font-weight:500}
${s} .cm-boundary-range,${s} .cm-boundary-count{font-variant-numeric:tabular-nums;color:var(--cm-text-secondary)}
${s} .cm-boundary-evidence{color:var(--cm-text-muted);font-size:12.5px}
${s} .cm-correspondence{margin-top:12px;font-size:12.5px;color:var(--cm-text-muted)}
${s} .cm-correspondence.cm-ambiguous{color:var(--cm-text-secondary)}
${s} .cm-sources{margin-top:34px;border-top:1px solid var(--cm-border);padding-top:18px}
${s} .cm-sources h2{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--cm-text-muted)}
${s} .cm-sources .cm-cite{font-size:12.5px;line-height:1.45}
${s} .cm-sources a{color:var(--cm-text-primary);text-decoration:none;
  border-bottom:1px solid var(--cm-border-strong)}
${s} .cm-sources a:hover{border-bottom-color:var(--cm-text-primary)}
${s} .cm-sources ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
${s} .cm-site-list{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:14px}
${s} .cm-site-item{padding-left:12px;border-left:2px solid var(--cm-border)}
${s} .cm-site-head{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}
${s} .cm-site-label{font-weight:600;font-size:13.5px}
${s} .cm-site-range{font-variant-numeric:tabular-nums;font-size:12.5px;color:var(--cm-text-secondary)}
${s} .cm-site-role{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--cm-text-muted)}
${s} .cm-site-evidence{font-size:12px;color:var(--cm-text-muted)}
${s} .cm-site-origin{font-size:12.5px;color:var(--cm-text-muted);margin-top:2px}
${s} .cm-site-partial{display:block;font-size:12.5px;color:var(--cm-series-orange);margin-top:3px}
${s} .cm-site-note{font-size:12.5px;color:var(--cm-text-secondary);margin-top:4px}
${s} .cm-sites-body{padding:4px 0 8px 18px;border-left:2px solid var(--cm-border);margin-left:3px;max-width:var(--cm-max)}
${s} .cm-seg-list{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:3px}
${s} .cm-seg-item{display:grid;grid-template-columns:minmax(90px,auto) auto auto 1fr;gap:4px 12px;
  padding:4px 6px;border-radius:5px;align-items:baseline;font-size:13px}
${s} .cm-seg-literal{color:var(--cm-text-muted)}
${s} .cm-seg-name{font-weight:500}
${s} .cm-seg-range,${s} .cm-seg-len{font-variant-numeric:tabular-nums;color:var(--cm-text-secondary)}
${s} .cm-seg-origin{color:var(--cm-text-muted);font-size:12.5px}
${s} .cm-seg-note{grid-column:1/-1;color:var(--cm-text-muted);font-size:12px}
${s} .cm-assembly-body{padding:4px 0 8px 18px;border-left:2px solid var(--cm-border);margin-left:3px;max-width:var(--cm-max)}
${s} .cm-assembly-note{margin-top:10px;font-size:12.5px;color:var(--cm-text-muted)}
@media (max-width:480px){${s} .cm-seg-item{grid-template-columns:1fr auto}
${s} .cm-seg-origin{grid-column:1/-1}}
${s} .cm-warn{color:var(--cm-series-orange)}
@media (max-width:480px){
${s}{font-size:14.5px}
${s} .cm-section-body{padding-left:10px}
${s} .cm-boundaries li{grid-template-columns:1fr auto;row-gap:1px}
${s} .cm-boundary-evidence{grid-column:1/-1}
}`;
}

// src/workspace.ts
var h2 = escapeXml;
function toolbar(tracks) {
  const options = tracks.map((track) => `<option value="track:${h2(track.track_id)}">${h2(track.label)}</option>`).join("");
  return `<div class="cm-toolbar" role="toolbar" aria-label="Sequence viewer controls"><button type="button" class="cm-action cm-action-primary" data-action="reset-view" title="Collapse every construct and fit the diagrams">Reset view</button><label class="cm-control"><span class="cm-control-label">Sequence view</span><select class="cm-select" data-view-mode aria-label="Sequence view"><option value="region" selected>Regions</option><option value="residue">Amino acids</option></select></label>` + (tracks.length === 0 ? "" : `<label class="cm-control"><span class="cm-control-label">Coloring scheme</span><select class="cm-select" data-color-mode aria-label="Coloring scheme"><option value="region" selected>Functional region</option>${options}</select></label>`) + // A visually hidden live region, filled by app.ts, so a screen reader hears
  // when a zoom or pan changes the visible columns.
  `<span class="cm-sr-only" data-zoom-readout aria-live="polite"></span><span class="cm-spacer"></span><button type="button" class="cm-action" data-action="clear-selection" hidden>Clear selection</button><button type="button" class="cm-action" data-action="export-svg">Export figure</button><span class="cm-action-status" role="status" aria-live="polite"></span></div><p class="cm-selection" data-readout hidden></p>`;
}
function zoomControl() {
  const glass = (sign) => `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4 L14 14"/>` + (sign === "+" ? `<path d="M7 4.9v4.2M4.9 7h4.2"/>` : `<path d="M4.9 7h4.2"/>`) + `</svg>`;
  return `<div class="cm-zoom-float" role="group" aria-label="Zoom"><button type="button" class="cm-zoom-btn" data-action="zoom-in" aria-label="Zoom in" title="Zoom in">${glass("+")}</button><button type="button" class="cm-zoom-btn" data-action="zoom-out" aria-label="Zoom out" title="Zoom out">${glass("-")}</button></div>`;
}
function constructRow(normalized, model, rootId, rows, sitePresence) {
  const id = normalized.variant.variant_id;
  const bodyId = `${rootId}-body-${id}`;
  const named = normalized.chains.length > 1;
  const canvases = normalized.chains.map((nchain) => {
    const chainId = nchain.chain.chain_id;
    const svg = rows.find((r) => r.variantId === id && r.chainId === chainId)?.svg ?? "";
    const slot = trackSlotId(id, chainId);
    const copies = nchain.chain.copies ?? 1;
    const caption = named ? `<p class="cm-chain-caption">${h2(nchain.chain.name)}<span class="cm-chain-size">${nchain.length} aa` + (copies > 1 ? ` \xD7 ${copies}` : "") + `</span></p>` : "";
    return `<div class="cm-chain-slot">${caption}<div class="cm-row-canvas" data-track-slot="${h2(slot)}">${svg}</div></div>`;
  }).join("");
  return `<div class="cm-row" data-row-for="${h2(id)}"><div class="cm-row-main"><div class="cm-row-head"><div class="cm-row-title"><button type="button" class="cm-expand" data-expand-for="${h2(id)}" aria-expanded="true" aria-controls="${h2(bodyId)}" aria-label="Details for ${h2(normalized.variant.name)}"><span class="cm-expand-mark" aria-hidden="true"></span></button><h3 class="cm-row-name">${h2(normalized.variant.name)}` + (normalized.variant.headline === void 0 ? "" : `<span class="cm-row-headline">${h2(normalized.variant.headline)}</span>`) + `</h3></div><p class="cm-row-meta"><span class="cm-length">${normalized.length} aa</span>` + stoichiometry(normalized) + `</p></div><div class="cm-row-canvases">${canvases}</div></div><div class="cm-row-body" id="${h2(bodyId)}">${variantCard(normalized, model, rootId, sitePresence, { header: false })}</div></div>`;
}
function renderWorkspace(model, options) {
  const { rootId } = options;
  const coordinateNote = model.record.coordinate_note ?? "Residue positions are 1-based within each construct. Columns are alignment positions, established from the recorded edits.";
  const warnings = model.warnings.length === 0 ? "" : `<div class="cm-warnings" role="note"><h2>Checks</h2><ul>${model.warnings.map((warning) => `<li>${h2(warning)}</li>`).join("")}</ul></div>`;
  return `<div id="${h2(rootId)}" class="cm-root cm-workspace${(model.record.hypotheses ?? []).length === 0 ? " cm-no-brackets" : ""}" data-root-id="${h2(rootId)}"><style>${documentStyle(rootId)}${workspaceStyle(rootId)}${styleBlock(`#${rootId}`, { rootId, interactive: true })}${options.hostStyle ?? ""}</style><header class="cm-head"><h1 class="cm-title">${h2(model.record.title)}</h1>` + objectiveLine(model) + `</header>` + toolbar(paintableTracks(model.record.tracks)) + `<div class="cm-canvas-wrap"><div class="cm-legend" data-legend hidden></div><div class="cm-canvas" data-canvas tabindex="0" role="application" aria-label="Aligned construct canvas. Arrow keys pan, plus and minus zoom.">` + zoomControl() + // The axis is wrapped in the same three-column skeleton as a row rather
  // than given its own padding, so the ticks sit over the residues they
  // measure by construction instead of by two numbers agreeing.
  `<div class="cm-axis-slot" data-axis-slot><div class="cm-group"><div class="cm-group-rows"><div class="cm-row-main"><div class="cm-row-head" aria-hidden="true"></div><div class="cm-row-canvas cm-axis-canvas" data-axis-canvas>${options.axisSvg}</div></div></div><div class="cm-group-bracket"></div></div></div><div class="cm-rows">${(() => {
    const declared = (model.record.hypotheses ?? []).length;
    let index = 0;
    return model.groups.map((group) => {
      if (group.hypothesis !== null) index += 1;
      const rows = group.variants.map(
        (normalized) => constructRow(normalized, model, rootId, options.trackSvgs, options.sitePresence ?? [])
      ).join("");
      const heading = groupHeading(group, index, declared, rootId);
      return `<div class="cm-group"><div class="cm-group-rows">${rows}</div><div class="cm-group-bracket">` + // `heading` is '' only for the band with no hypothesis (see
      // groupHeading), so the bracket rule and the heading appear together.
      (heading === "" ? "" : (group.hypothesis === null ? "" : `<div class="cm-bracket-rule" aria-hidden="true"></div>`) + heading) + `</div></div>`;
    }).join("");
  })()}</div></div><div class="cm-tip" data-tip hidden></div><p class="cm-hint">Drag to pan \xB7 press + or \u2212 to zoom \xB7 click a region to trace it across constructs</p>` + warnings + `</div>` + attemptsSection(model) + sourcesSection(model, rootId) + // Escaped here, so no caller can embed a payload that closes the script element.
  `<script type="application/json" data-design-payload>${inertJson(options.payload)}</script>` + (options.script === void 0 ? "" : `<script>${options.script}</script>`) + `</div>`;
}
function renderWorkspaceDocument(model, options) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${h2(model.record.title)}</title>
<style>:root{color-scheme:light dark}html,body{margin:0;padding:0;background:#fcfcfb}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) body{background:#1a1a19}}:root[data-theme="dark"] body{background:#1a1a19}body{padding:clamp(14px,3vw,32px)}</style>
</head>
<body>
` + renderWorkspace(model, options) + `
</body>
</html>
`;
}
function workspaceStyle(rootId) {
  const s = `#${rootId}`;
  return `
${s}.cm-workspace{width:100%;min-width:0;max-width:1500px;margin:0 auto;
  container-type:inline-size;container-name:cm-workspace;
  /* One pair of numbers drives the label gutter and the bracket column, for
     the axis and for every row, so the scale cannot drift between them. */
  --cm-label:206px;--cm-bracket:208px;--cm-col-gap:14px}
${s} .cm-canvas-wrap{min-width:0;position:relative}
${s} .cm-canvas{position:relative;border-radius:8px}
${s} .cm-canvas:focus-visible{outline:2px solid var(--cm-text-primary);outline-offset:3px}
${s} .cm-canvas svg{display:block;width:100%;height:auto}
/* Pinned to the figure's top-right and above the canvas, so it is reachable
   whatever the zoom has done to what is underneath it. */
${s} .cm-zoom-float{position:absolute;top:2px;right:0;z-index:4;display:flex;gap:4px}
${s} .cm-zoom-btn{display:inline-flex;align-items:center;justify-content:center;
  width:32px;height:32px;padding:0;cursor:pointer;border-radius:7px;
  border:1px solid var(--cm-border-strong);background:var(--cm-surface);
  color:var(--cm-text-secondary);box-shadow:0 1px 3px rgba(0,0,0,.07)}
${s} .cm-zoom-btn:hover{color:var(--cm-text-primary);border-color:var(--cm-text-muted)}
${s} .cm-zoom-btn:focus-visible{outline:2px solid var(--cm-text-primary);outline-offset:2px}
${s} .cm-zoom-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;
  stroke-linecap:round}
${s} .cm-spacer{flex:1}
${s} .cm-hint{color:var(--cm-text-muted);font-size:12px;margin:18px 0 0}
${s} .cm-legend{margin:0 0 10px;padding:9px 11px;border:1px solid var(--cm-border);border-radius:8px;
  background:var(--cm-surface-sunken);font-size:12px}
${s} .cm-legend-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px}
${s} .cm-legend-name{font-weight:600;font-size:12.5px}
${s} .cm-legend-low,${s} .cm-legend-high{color:var(--cm-text-muted);font-variant-numeric:tabular-nums}
${s} .cm-ramp{display:inline-flex;border-radius:3px;overflow:hidden;border:1px solid var(--cm-border)}
${s} .cm-swatch{width:17px;height:11px;display:inline-block}
${s} .cm-swatch-empty{border:1px dashed var(--cm-border-strong);border-radius:2px;background:none;flex:none}
${s} .cm-legend-hint{color:var(--cm-text-muted);flex:1;min-width:0}
${s} .cm-method{margin-top:2px}
${s} .cm-method summary{font-size:11.5px;color:var(--cm-text-secondary);padding:3px 0;min-height:24px}
${s} .cm-method-list{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:4px 0 0;font-size:11.5px}
${s} .cm-method-list dt{color:var(--cm-text-muted)}
${s} .cm-method-list dd{margin:0;color:var(--cm-text-secondary);overflow-wrap:anywhere}
${s} .cm-legend-note{margin:0 0 7px;font-size:12px;line-height:1.45;color:var(--cm-text-muted);
  max-width:var(--cm-max)}
${s} .cm-tip{position:absolute;z-index:5;max-width:320px;pointer-events:none;
  background:var(--cm-surface);border:1px solid var(--cm-border-strong);border-radius:8px;
  padding:9px 11px;box-shadow:0 6px 20px rgba(0,0,0,.14);font-size:12.5px;line-height:1.45}
${s} .cm-tip-title{font-weight:600;font-size:13px;display:block}
${s} .cm-tip-line{color:var(--cm-text-secondary);display:block;margin-top:2px}
${s} .cm-tip-diff{display:block;margin-top:5px;font-weight:500}
${s} .cm-tip-seq{display:block;margin-top:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:11px;line-height:1.55;word-break:break-all;color:var(--cm-text-primary);
  background:var(--cm-surface-sunken);border-radius:5px;padding:6px 7px;max-height:7.2em;overflow:hidden}
${s} .cm-tip-more{display:block;margin-top:4px;color:var(--cm-text-muted);font-size:11.5px}
${s} .cm-selection{margin:0 0 10px;padding:7px 11px;border-left:2px solid var(--cm-border-strong);
  background:var(--cm-surface-sunken);border-radius:0 6px 6px 0;font-size:12.5px;
  color:var(--cm-text-secondary);display:flex;flex-wrap:wrap;gap:3px 12px;align-items:baseline}
${s} .cm-selection[hidden]{display:none}
${s} .cm-readout-title{font-weight:600;color:var(--cm-text-primary);font-size:13px}
${s} .cm-readout-line{color:var(--cm-text-secondary)}
${s} .cm-readout-ids{flex-basis:100%;font-size:11px;color:var(--cm-text-muted);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;word-break:break-all}
${s} .cm-rows{display:flex;flex-direction:column}
${s}.cm-no-brackets{--cm-bracket:0px}
${s}.cm-no-brackets .cm-group{gap:0}
${s}.cm-no-brackets .cm-group-bracket{display:none}
${s} .cm-group{display:flex;align-items:stretch;gap:var(--cm-col-gap)}
${s} .cm-group + ${s} .cm-group{margin-top:16px}
${s} .cm-group-rows{flex:1 1 0;min-width:0}
${s} .cm-group-bracket{flex:0 0 var(--cm-bracket);display:flex;align-items:center;
  gap:10px;padding:6px 0}
${s} .cm-bracket-rule{flex:none;align-self:stretch;width:9px;
  border:1.5px solid var(--cm-border-strong);border-right:0;border-radius:3px 0 0 3px;
  transform:rotate(180deg)}
${s} .cm-row-main{display:flex;align-items:center;gap:var(--cm-col-gap)}
${s} .cm-row-head{flex:0 0 var(--cm-label);min-width:0;display:block;margin:0}
${s} .cm-row-canvases{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:3px}
${s} .cm-chain-slot{min-width:0}
${s} .cm-chain-caption{display:flex;gap:8px;align-items:baseline;font-size:11.5px;
  color:var(--cm-text-secondary);margin:0 0 1px}
${s} .cm-chain-size{font-variant-numeric:tabular-nums}
${s} .cm-axis-canvas{flex:1 1 0;min-width:0}
${s} .cm-row{padding:0}
${s} .cm-row-canvas{touch-action:none;user-select:none}
${s} .cm-row-canvas svg{display:block;width:100%;height:auto}
${s} .cm-axis-slot{position:sticky;top:0;z-index:2;background:var(--cm-surface);
  padding-bottom:2px;margin-bottom:2px}
${s} .cm-row-body{padding:2px 0 14px calc(var(--cm-label) + var(--cm-col-gap))}
${s} .cm-axis-slot svg{display:block;width:100%;height:auto}
${s} .cm-row{padding:5px 0}
${s} .cm-row-head{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;margin:0}
${s} .cm-row-title{display:flex;align-items:baseline;gap:6px;min-width:0}
${s} .cm-expand{flex:none;appearance:none;background:none;border:0;padding:6px;margin:0 0 0 -6px;
  cursor:pointer;color:var(--cm-text-muted);border-radius:6px;display:inline-flex;
  align-items:center;justify-content:center;width:26px;height:26px;align-self:center}
${s} .cm-expand:hover{color:var(--cm-text-primary);background:var(--cm-surface-sunken)}
${s} .cm-expand:focus-visible{outline:2px solid var(--cm-text-primary);outline-offset:1px}
${s} .cm-expand-mark{width:7px;height:7px;border-right:1.75px solid currentColor;
  border-bottom:1.75px solid currentColor;transform:rotate(-45deg);margin-left:-2px}
${s} .cm-expand[aria-expanded="true"] .cm-expand-mark{transform:rotate(45deg);margin:-2px 0 0 0}
@media (prefers-reduced-motion:no-preference){${s} .cm-expand-mark{transition:transform .15s ease-out}}
${s} .cm-row-name{font-size:13.5px;line-height:1.3;font-weight:600;letter-spacing:-.006em;
  overflow-wrap:anywhere}
${s} .cm-row-headline{display:block;font-weight:400;font-size:12.5px;line-height:1.35;
  color:var(--cm-text-secondary);margin-left:19px}
${s} .cm-row-meta{display:flex;gap:8px;align-items:baseline;font-size:13px;
  color:var(--cm-text-muted);font-variant-numeric:tabular-nums;margin-left:19px}
${s} .cm-row-body[hidden]{display:none}
/* Narrow: three columns cannot hold. The label returns above its diagram and
   the bracket becomes a heading over the band it was bracketing, so the
   grouping survives even where the brace cannot be drawn. */
/* Measure this workspace, not the host browser viewport or the SVG --width.
   A normal 736px chat frame must keep the right-hand hypothesis column; a
   viewport media query cannot tell those apart, and stacked the columns in a
   wide window whenever the frame around them was narrow. */
@container cm-workspace (max-width:639px){
${s} .cm-group{flex-direction:column-reverse;gap:6px}
${s} .cm-group + ${s} .cm-group{margin-top:22px}
${s} .cm-group-bracket{flex:0 0 auto;align-items:flex-start;padding:0}
${s} .cm-bracket-rule{display:none}
${s} .cm-row-main{flex-direction:column;align-items:stretch;gap:3px}
${s} .cm-row-head{flex:0 0 auto}
${s} .cm-row-headline,${s} .cm-row-meta{margin-left:19px}
${s} .cm-row-body{padding-left:19px}
${s} .cm-axis-slot .cm-row-head{display:none}
}
${s} .cm-row-body .cm-card{border-top:0;padding:0}
${s} .cm-row-body .cm-section:first-child{margin-top:4px}
${s} .cm-action-primary{color:var(--cm-text-primary);font-weight:500;
  border-color:var(--cm-border-strong);background:var(--cm-surface-sunken)}
${s} .cm-action-primary:hover{border-color:var(--cm-text-muted)}
${s} .cm-sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
  clip-path:inset(50%);white-space:nowrap;border:0}
${s} .cm-control{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap;min-width:0;
  margin-left:10px}
${s} .cm-control-label{font-size:13px;font-weight:600;color:var(--cm-text-secondary)}
${s} .cm-select{font:inherit;font-size:13px;min-height:34px;max-width:100%;
  border:1px solid var(--cm-border-strong);border-radius:6px;padding:5px 8px;
  background:var(--cm-surface);color:var(--cm-text-primary)}
${s} .cm-select:focus-visible{outline:2px solid var(--cm-text-primary);outline-offset:2px}
/* The selected mode has to be visible, not only announced. Leaving it to
   aria-pressed alone is how a control ends up looking like it does nothing;
   a filled slab is too loud for a two-way switch, so this reads as a
   selected segment. */
${s} .cm-action[aria-pressed="true"]{background:var(--cm-surface-sunken);
  border-color:var(--cm-border-strong);color:var(--cm-text-primary);font-weight:600}
`;
}

// src/monomer-lookup.ts
import { readFileSync } from "node:fs";
import { join as join2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var aliasTable = null;
function aliases(name) {
  if (aliasTable === null) {
    aliasTable = {};
    for (const candidate of [
      fileURLToPath2(new URL("../data/monomers/aliases.json", import.meta.url)),
      join2(process.cwd(), "data", "monomers", "aliases.json")
    ]) {
      try {
        const raw = readFileSync(candidate, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.monomers === void 0) continue;
        aliasTable = parsed.monomers;
        break;
      } catch {
      }
    }
  }
  return aliasTable[name]?.names ?? [];
}
var MAX_ROWS = 40;
var NOTES = {
  Thr_ol: "the enantiomer: this is threoninol from D-threonine. L-threoninol is D_Thr_ol",
  D_Thr_ol: "L-threoninol, the reduction of L-threonine. Named by CIP descriptor, which flips on reduction, so the D_ prefix is the descriptor of the reduced carbon"
};
var ALIAS_OVERRIDES = {
  Thr_ol: ["threoninol", "d-threoninol"],
  D_Thr_ol: ["threoninol", "l-threoninol"]
};
var THREE_LETTER = {
  Ala: "A",
  Gly: "G",
  Leu: "L",
  Phe: "F",
  Pro: "P",
  Thr: "T",
  Val: "V",
  Lys: "K"
};
function aliasesOf(name) {
  const override = ALIAS_OVERRIDES[name];
  if (override !== void 0) return [...override];
  const match = /^(D_)?([A-Z][a-z]{2})_(ol|al)$/.exec(name);
  if (match === null) return [];
  const letter = THREE_LETTER[match[2]];
  const base = letter === void 0 ? void 0 : monomerChemistry(letter)?.chemicalName.toLowerCase();
  if (base === void 0) return [];
  const word = `${base.replace(/e$/, "")}${match[3]}`;
  return match[1] === void 0 ? [word, `l-${word}`] : [`d-${word}`];
}
var rowOf = (monomer2) => ({
  name: monomer2.name,
  kind: monomer2.kind,
  // A cap or a linker occupies no sequence position, so it has no letter.
  letter: monomer2.kind === "aa" ? monomer2.natAnalog : "-",
  attachments: [...monomer2.attachments].sort(([a], [b]) => a - b).map(([point, attachment]) => `${point} ${attachment.element}`).join(", "),
  chemicalName: monomerChemistry(monomer2.name)?.chemicalName ?? "",
  refused: refusedMonomer(monomer2.name),
  unspecifiedCentres: monomerChemistry(monomer2.name)?.unspecifiedCentres ?? 0,
  note: NOTES[monomer2.name],
  aliases: aliasesOf(monomer2.name),
  alsoCalled: aliases(monomer2.name)
});
function lookupMonomers(words, kind, element) {
  const terms = words.map((word) => word.toLowerCase()).filter((word) => word !== "");
  const joined = terms.join(" ");
  const matches = allMonomers().filter((monomer2) => kind === void 0 || monomer2.kind === kind).filter(
    (monomer2) => element === void 0 || [...monomer2.attachments.values()].some(
      (attachment) => attachment.element.toLowerCase() === element.toLowerCase()
    )
  ).map(rowOf).filter((row) => {
    const haystack = `${row.name} ${row.chemicalName} ${row.aliases.join(" ")} ${row.alsoCalled.join(" ")} ${row.note ?? ""}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
  const rank = (row) => {
    const name = row.name.toLowerCase();
    if (name === joined || name === terms[0] || row.aliases.includes(joined)) return 0;
    if (terms.length > 0 && name.startsWith(terms[0])) return 1;
    const own = `${row.name} ${row.chemicalName} ${row.aliases.join(" ")} ${row.note ?? ""}`.toLowerCase();
    if (terms.every((term) => own.includes(term))) return 2;
    return 3;
  };
  matches.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return { rows: matches.slice(0, MAX_ROWS), total: matches.length };
}
function describeVocabulary() {
  const counts = { aa: 0, cap: 0, linker: 0 };
  for (const monomer2 of allMonomers()) counts[monomer2.kind] += 1;
  return `Monomer vocabulary: ${counts.aa + counts.cap + counts.linker} monomers (${counts.aa} residues, ${counts.cap} caps, ${counts.linker} linkers).

  monomers <words...>           search by name, chemical name or a published synonym
  monomers --kind aa|cap|linker list one kind (add words to narrow it)
  monomers --element S          by ATTACHMENT ATOM, when no name comes to mind
                                (N, C, O or S; composes with --kind)

Patterns, all case-sensitive:
  a D-residue is d + its letter       dA, dL, dF      (the sequence keeps the L letter)
  N-methylation is me + the letter    meV, meA, meG
  N-terminal acetyl is ac, C-terminal amide is am     (see: monomers --kind cap)
  a non-natural residue has its own name: Aib, Nle, Orn, Dab, Hcy, Pen, ...
  a conjugate unit is a linker or a residue used as one: AEEA, C18diacid, C16acid, gGlu
`;
}
function formatMonomers(rows, total) {
  const lines = [];
  const width = Math.max(4, ...rows.map((row) => row.name.length));
  lines.push(`${"NAME".padEnd(width)}  KIND    LETTER  ATTACHMENTS      WHAT`);
  for (const row of rows) {
    const flags = [];
    if (row.refused !== void 0) flags.push(`REFUSED: ${row.refused}`);
    if (row.unspecifiedCentres > 0) {
      flags.push("leaves a stereocentre unspecified");
    }
    if (row.note !== void 0) flags.push(`NOTE: ${row.note}`);
    if (row.alsoCalled.length > 0) flags.push(`also called ${row.alsoCalled.join("; ")}`);
    lines.push(
      `${row.name.padEnd(width)}  ${row.kind.padEnd(6)}  ${row.letter.padEnd(6)}  ${row.attachments.padEnd(15)}  ${row.chemicalName}` + (flags.length === 0 ? "" : `  [${flags.join("; ")}]`)
    );
  }
  if (total > rows.length) {
    lines.push(`... and ${total - rows.length} more. Add a word to narrow it.`);
  }
  lines.push(
    "",
    "LETTER is what to write in the sequence at that position. X means the monomer has no",
    "natural analogue: write X, and name the monomer under that chain's chemistry.residues.",
    "- means it occupies no sequence position (a cap or a linker).",
    "Write the NAME exactly as printed: names are case-sensitive."
  );
  return `${lines.join("\n")}
`;
}

// src/genpept.ts
var GENPEPT_LAYOUT = {
  /** No line may exceed this. The reference file's longest is exactly 79. */
  lineWidth: 79,
  /** A keyword's value begins here, and so does its continuation. */
  keywordColumn: 13,
  /** `     Region` -- five spaces, then the key. */
  featureKeyColumn: 6,
  /** Locations and qualifiers, and the continuation of a wrapped qualifier. */
  featureValueColumn: 22,
  locusNameColumn: 13,
  /** The residue count is right-justified to end here. */
  locusLengthEnd: 40,
  locusUnitsColumn: 42,
  locusTopologyColumn: 56,
  locusDivisionColumn: 65,
  locusDateColumn: 69,
  /** `ORIGIN` lines: a right-justified position, then six groups of ten. */
  originNumberWidth: 9,
  originGroupSize: 10,
  originGroupsPerLine: 6
};
var LOCUS_NAME_LIMIT = 16;
var DIVISION = "SYN";
var TRANSLITERATIONS = [
  [/[‐-―]/g, "-"],
  [/[‘’‛]/g, "'"],
  [/[“”]/g, '"'],
  [/…/g, "..."],
  [/×/g, "x"],
  [/·/g, "-"],
  [/[  - ]/g, " "],
  [/°/g, " degrees"],
  [/±/g, "+/-"],
  [/→/g, "->"],
  [/≥/g, ">="],
  [/≤/g, "<="],
  [/µ/g, "micro"]
];
var GREEK = {
  "\u03B1": "alpha",
  "\u03B2": "beta",
  "\u03B3": "gamma",
  "\u03B4": "delta",
  "\u03B5": "epsilon",
  "\u03B6": "zeta",
  "\u03B7": "eta",
  "\u03B8": "theta",
  "\u03B9": "iota",
  "\u03BA": "kappa",
  "\u03BB": "lambda",
  "\u03BC": "mu",
  "\u03BD": "nu",
  "\u03BE": "xi",
  "\u03BF": "omicron",
  "\u03C0": "pi",
  "\u03C1": "rho",
  "\u03C2": "sigma",
  "\u03C3": "sigma",
  "\u03C4": "tau",
  "\u03C5": "upsilon",
  "\u03C6": "phi",
  "\u03C7": "chi",
  "\u03C8": "psi",
  "\u03C9": "omega"
};
function spellGreek(text) {
  return text.replace(/[Α-ω]/g, (letter) => {
    const lower = letter.toLowerCase();
    const name = GREEK[lower];
    if (name === void 0) return letter;
    return letter === lower ? name : name[0].toUpperCase() + name.slice(1);
  });
}
var GenPeptError = class extends Error {
};
function ascii(text, where) {
  let out = text.replace(/\s+/g, " ").trim();
  for (const [pattern, replacement] of TRANSLITERATIONS) out = out.replace(pattern, replacement);
  out = spellGreek(out);
  const bad = out.match(/[^\x20-\x7e]/);
  if (bad !== null) {
    const code = bad[0].codePointAt(0) ?? 0;
    throw new GenPeptError(
      `${where}: cannot be written to a flat file: U+${code.toString(16).toUpperCase().padStart(4, "0")} (${JSON.stringify(bad[0])}). Flat files are printable ASCII. Replace it in the record rather than having it dropped here.`
    );
  }
  return out;
}
function wrapAt(column, first, rest, where, separator = false) {
  const room = GENPEPT_LAYOUT.lineWidth - (column - 1) - (separator ? 1 : 0);
  const words = rest.split(" ").filter((w) => w.length > 0);
  for (const word of words) {
    if (word.length <= room) continue;
    throw new GenPeptError(
      `${where ?? "a field"}: ${JSON.stringify(word.slice(0, 32))}... is ${word.length} characters with no break, and ${room} is all that fits at column ${column}. Splitting it would put a space inside the value when a reader rejoins the lines, so shorten it in the record.`
    );
  }
  const lines = [];
  let line = "";
  for (const word of words) {
    if (line === "") {
      line = word;
      continue;
    }
    if (line.length + 1 + word.length <= room) {
      line = `${line} ${word}`;
      continue;
    }
    lines.push(line);
    line = word;
  }
  if (line !== "") lines.push(line);
  if (lines.length === 0) lines.push("");
  const pad = " ".repeat(column - 1);
  return lines.map((text, index) => {
    const tail = separator && index < lines.length - 1 ? " " : "";
    return (index === 0 ? first + text : pad + text) + tail;
  });
}
function keyword(name, value, where) {
  return wrapAt(
    GENPEPT_LAYOUT.keywordColumn,
    name.padEnd(GENPEPT_LAYOUT.keywordColumn - 1),
    value,
    where ?? name
  );
}
function subKeyword(name, value) {
  return wrapAt(
    GENPEPT_LAYOUT.keywordColumn,
    `  ${name}`.padEnd(GENPEPT_LAYOUT.keywordColumn - 1),
    value,
    name
  );
}
function featureHeading(key, location) {
  const keyField = GENPEPT_LAYOUT.featureValueColumn - GENPEPT_LAYOUT.featureKeyColumn;
  return " ".repeat(GENPEPT_LAYOUT.featureKeyColumn - 1) + key.padEnd(keyField) + location;
}
function qualifier(name, value, where) {
  const column = GENPEPT_LAYOUT.featureValueColumn;
  const pad = " ".repeat(column - 1);
  if (value === null) return [`${pad}/${name}`];
  const escaped = value.replace(/"/g, '""');
  return wrapAt(column, pad, `/${name}="${escaped}"`, where ?? `/${name}`, true);
}
function canonicalResidues(normalized, nchain, where) {
  const { chain } = nchain;
  const reasons = [];
  const residues = chain.chemistry?.residues ?? [];
  if (residues.length > 0) {
    const named = residues.slice().sort((a, b) => a.position - b.position).map((entry) => `${entry.position} is ${entry.monomer}`);
    reasons.push(`${named.length === 1 ? "position" : "positions"} ${named.join(", ")}`);
  }
  for (const cap of chain.chemistry?.caps ?? []) {
    reasons.push(`the ${cap.terminus} terminus is capped with ${cap.monomer}`);
  }
  const bonds = (normalized.variant.chemistry?.bonds ?? []).filter(
    (bond) => [bond.a, bond.b].some(
      (end) => (end.chain_id ?? chain.chain_id) === chain.chain_id
    )
  );
  for (const bond of bonds) {
    reasons.push(
      `${bond.bond_id} is a ${bond.kind} bond joining ${bond.a.position} and ${bond.b.position}`
    );
  }
  for (const conjugate of normalized.variant.chemistry?.conjugates ?? []) {
    if ((conjugate.anchor.chain_id ?? chain.chain_id) !== chain.chain_id) continue;
    reasons.push(
      `${conjugate.conjugate_id} hangs ${conjugate.units.map((unit) => unit.monomer).join(" then ")} off position ${conjugate.anchor.position}`
    );
  }
  if (reasons.length > 0) {
    throw new GenPeptError(
      `${where}: this chain's chemistry cannot be written as amino-acid letters -- ${reasons.join("; ")}. A flat file carries one letter per residue and nothing else, so these letters would describe a different molecule from the one the record designs. Export the chemistry instead of the sequence.`
    );
  }
  const unexpressed = (normalized.variant.unexpressed_chemistry ?? []).filter(
    (entry) => (entry.chain_id ?? chain.chain_id) === chain.chain_id
  );
  if (unexpressed.length > 0) {
    const named = unexpressed.map(
      (entry) => `${entry.position === void 0 ? "" : `position ${entry.position}: `}${entry.what} (${entry.why})`
    );
    throw new GenPeptError(
      `${where}: this design declares chemistry it cannot express -- ${named.join("; ")}. Nothing is recorded for it, so these letters are the UNMODIFIED peptide: they would describe a different molecule from the one designed, exactly as they would for a D-residue. Deliver the structure and the modification in words.`
    );
  }
  return chain.sequence;
}
function originBlock(sequence) {
  const { originNumberWidth, originGroupSize, originGroupsPerLine } = GENPEPT_LAYOUT;
  const perLine = originGroupSize * originGroupsPerLine;
  const residues = sequence.toUpperCase();
  const lines = [];
  for (let offset = 0; offset < residues.length; offset += perLine) {
    const chunk = residues.slice(offset, offset + perLine);
    const groups = [];
    for (let at = 0; at < chunk.length; at += originGroupSize) {
      groups.push(chunk.slice(at, at + originGroupSize));
    }
    lines.push(`${String(offset + 1).padStart(originNumberWidth)} ${groups.join(" ")}`);
  }
  return lines;
}
function locusLine(name, length, date, maxName = LOCUS_NAME_LIMIT) {
  const L = GENPEPT_LAYOUT;
  if (name.length > maxName) {
    throw new GenPeptError(`locus name ${JSON.stringify(name)} exceeds ${maxName} characters`);
  }
  const at = (line2, column) => line2.padEnd(Math.max(column - 1, line2.length + 1));
  let line = "LOCUS".padEnd(L.locusNameColumn - 1) + name.padEnd(LOCUS_NAME_LIMIT);
  const count = String(length);
  line = line.padEnd(Math.max(L.locusLengthEnd - count.length, line.length + 1)) + count;
  line = at(line, L.locusUnitsColumn) + "aa";
  line = at(line, L.locusTopologyColumn) + "linear";
  line = at(line, L.locusDivisionColumn) + DIVISION;
  line = at(line, L.locusDateColumn) + date;
  return line;
}
function flatFileDate(when) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(when.getUTCDate()).padStart(2, "0");
  return `${day}-${months[when.getUTCMonth()]}-${when.getUTCFullYear()}`;
}
function locusNames(variants) {
  const names = /* @__PURE__ */ new Map();
  const taken = /* @__PURE__ */ new Set();
  for (const normalized of variants) {
    for (const nchain of normalized.chains) {
      const variantId = normalized.variant.variant_id;
      const chainId = nchain.chain.chain_id;
      const key = `${variantId}:${chainId}`;
      const clean = (text) => text.replace(/[^A-Za-z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
      const variantPart = clean(variantId) === "" ? "construct" : clean(variantId);
      const chainPart = chainId === SINGLE_CHAIN_ID ? "" : clean(chainId);
      const compose = (reserved) => {
        const limit = LOCUS_NAME_LIMIT - reserved;
        if (chainPart === "") return variantPart.slice(0, limit);
        const space = limit - chainPart.length - 1;
        const head = space >= 1 ? variantPart.slice(0, space).replace(/_+$/, "") : "";
        return head === "" ? chainPart.slice(0, limit) : `${head}_${chainPart}`;
      };
      let name = compose(0);
      for (let n = 2; taken.has(name); n += 1) {
        const suffix = `_${n}`;
        name = compose(suffix.length) + suffix;
      }
      taken.add(name);
      names.set(key, name);
    }
  }
  return names;
}
function composition(normalized) {
  return normalized.chains.map((nchain) => {
    const copies = nchain.chain.copies ?? 1;
    const name = nchain.chain.chain_id === SINGLE_CHAIN_ID ? "one polypeptide" : nchain.chain.name;
    return copies > 1 ? `${name} x${copies}` : name;
  }).join("; ");
}
function commentLines(model, normalized, nchain, digest, profile = "plain") {
  const { variant } = normalized;
  const out = [];
  const say = (text) => {
    out.push(ascii(text, `variants.${variant.variant_id} comment`));
  };
  say(`Construct: ${variant.name}`);
  if (nchain.chain.chain_id !== SINGLE_CHAIN_ID) say(`Chain: ${nchain.chain.name}`);
  say(
    nchain.chain.chain_id === SINGLE_CHAIN_ID ? `Record identity: variant_id ${variant.variant_id}` : `Record identity: variant_id ${variant.variant_id}, chain_id ${nchain.chain.chain_id}`
  );
  const instances = normalized.chains.reduce((n, c) => n + (c.chain.copies ?? 1), 0);
  say(`Intended composition: ${composition(normalized)}`);
  if (instances > 1) {
    say(
      "That composition is declared by the design record. The sequence verification checks the residues, not the assembly."
    );
  }
  say(
    "Coordinates: feature locations are 1-based and inclusive in THIS sequence, which may not be the numbering a construct name or the literature uses. Parent coordinates appear only where they are labelled as such."
  );
  if (model.record.coordinate_note !== void 0) {
    say(`Coordinate note from the design record: ${model.record.coordinate_note}`);
  }
  say(`Role in the comparison: ${variant.construct_role}`);
  if (variant.headline !== void 0) say(`Change: ${variant.headline}`);
  if (normalized.parent !== null) say(`Derived from: ${normalized.parent.name}`);
  for (const gap of nchain.correspondence.deletions) {
    const span2 = gap.start === gap.end ? `${gap.start}` : `${gap.start}-${gap.end}`;
    const where = gap.derivedJunction <= 0 ? "before residue 1 of this sequence" : gap.derivedJunction >= nchain.length ? "after the final residue of this sequence" : `between residues ${gap.derivedJunction} and ${gap.derivedJunction + 1}`;
    say(
      `Deletion: parent residues ${span2} are absent from this sequence and have no coordinates in it. The junction falls ${where}.`
    );
  }
  if (model.record.objective !== void 0) say(`Objective: ${model.record.objective}`);
  const hypothesis = variant.hypothesis_id === void 0 ? void 0 : model.hypotheses.get(variant.hypothesis_id);
  if (hypothesis !== void 0) say(`Hypothesis: ${hypothesis.question}`);
  if (normalized.parent !== null) {
    say(
      "Edits here are verified against the sequences. Whether any of these proteins has been made is a separate question this record does not answer."
    );
  }
  say(
    `Selected annotations only; the design record "${model.record.title}" is authoritative and holds the evidence, the comparisons and the per-residue analyses` + (digest === void 0 ? "." : `. Source record sha256 ${digest}.`)
  );
  say(
    "No database accession is assigned, because this is a locally generated construct export and was not retrieved from a sequence database."
  );
  if (profile === "snapgene") {
    say(
      `Written in SnapGene's documented GenBank/GenPept interchange format, so that feature colours are read: the "Exported" locus name and the Direct Submission reference are that format's recognition markers. This file was generated by construct-maps, not exported by SnapGene.`
    );
  }
  return out;
}
var DB_XREF_NAMESPACES = [
  "UniProtKB/Swiss-Prot",
  "UniProtKB/TrEMBL",
  "PDB",
  "InterPro",
  "Pfam",
  "GeneID",
  "CDD",
  "taxon"
];
function colorOf(token) {
  if (token === void 0) return null;
  if (token === "neutral") return LIGHT.neutral;
  if (token === "membrane") return LIGHT.membrane;
  const index = Number(token.slice("dom-".length));
  return DOMAIN_HUES[index - 1] ?? null;
}
function colorNote(profile, hex) {
  if (profile !== "snapgene" || hex === null) return [];
  return qualifier("note", `color: ${hex.toUpperCase()}`);
}
function labelLines(profile, name) {
  return profile === "snapgene" ? qualifier("label", name) : [];
}
function identifier(value, where) {
  if (!/^[\x21-\x7e]+$/.test(value)) {
    throw new GenPeptError(
      `${where}: ${JSON.stringify(value)} is not a usable identifier. It must be printable ASCII with no spaces, and an identifier is never rewritten to make it fit.`
    );
  }
  return value;
}
function donorReference(model, donorId) {
  const donor = model.record.donors?.find((d) => d.donor_id === donorId);
  const accession = donor?.accession;
  if (accession === void 0) return null;
  const version = accession.version === void 0 ? "" : `, recorded version ${accession.version}`;
  const text = `${accession.database} ${accession.accession}${version}`;
  const known = DB_XREF_NAMESPACES.find(
    (namespace) => namespace.toLowerCase() === accession.database.toLowerCase()
  );
  return {
    text,
    xref: known === void 0 ? null : `${known}:${identifier(accession.accession, `donor ${donorId} accession`)}`
  };
}
function segmentAccount(model, segment) {
  if (segment.kind !== "donor") {
    return {
      name: segment.label ?? "Literal assembly segment",
      // What the RECORD called it, which is absent here more often than not.
      label: segment.label,
      note: "This assembly segment is specified as a literal sequence; no donor reference is supplied for it here.",
      xref: null
    };
  }
  const donor = model.record.donors?.find((d) => d.donor_id === segment.donor_id);
  const name = donor?.name ?? segment.donor_id;
  const reference = donorReference(model, segment.donor_id);
  return {
    name: segment.label ?? `From ${name}`,
    label: segment.label,
    note: `These residues are ${name} residues ${segment.donor_start}-${segment.donor_end}, and were checked to equal them exactly` + (reference === null ? "." : `. Donor accession as recorded: ${reference.text}.`),
    xref: reference?.xref ?? null
  };
}
function assemblyFor(normalized, nchain) {
  return nchain.chain.assembly ?? (nchain.chain.chain_id === SINGLE_CHAIN_ID ? normalized.variant.assembly : void 0);
}
function substitutionLabel(changes, start, end) {
  const plural2 = changes.length === 1 ? "substitution" : "substitutions";
  const full = `Designed ${plural2} ${changes.join("/")}`;
  const room = GENPEPT_LAYOUT.lineWidth - (GENPEPT_LAYOUT.featureValueColumn - 1);
  if (`/region_name="${full}"`.length <= room) return full;
  return `Designed ${plural2} at ${start}..${end}`;
}
var spanOf = (start, end) => `${start}..${end}`;
function mergedSegments(forThisChain, segments) {
  const featuresBySpan = /* @__PURE__ */ new Map();
  for (const feature of forThisChain) {
    const key = spanOf(feature.start, feature.end);
    featuresBySpan.set(key, (featuresBySpan.get(key) ?? 0) + 1);
  }
  const merged = /* @__PURE__ */ new Map();
  for (const segment of segments) {
    const key = spanOf(segment.start, segment.end);
    if (featuresBySpan.get(key) === 1) merged.set(key, segment);
  }
  return merged;
}
function designRegionLines(model, forThisChain, merged, profile) {
  const out = [];
  for (const feature of forThisChain) {
    const region = model.regions.get(feature.region_id);
    const name = feature.label ?? region?.name ?? feature.region_id;
    const location = feature.start === feature.end ? `${feature.start}` : `${feature.start}..${feature.end}`;
    out.push(featureHeading("Region", location));
    const shown = ascii(name, `feature ${feature.instance_id} name`);
    out.push(...qualifier("region_name", shown));
    out.push(...labelLines(profile, shown));
    const notes = [];
    if (region?.description !== void 0) notes.push(region.description);
    if (feature.note !== void 0) notes.push(feature.note);
    if (feature.evidence !== void 0) {
      notes.push(
        feature.evidence === "measured" ? "Measured in this construct." : feature.evidence === "established_elsewhere" ? "Established elsewhere, not in this construct." : feature.evidence === "predicted" ? "Predicted, not measured." : "Evidence not stated in the record."
      );
    }
    notes.push(`Occurrence ${feature.instance_id} of region ${feature.region_id}.`);
    const segment = merged.get(spanOf(feature.start, feature.end));
    let xref = null;
    if (segment !== void 0) {
      const account = segmentAccount(model, segment);
      const called = account.label === void 0 || account.label === name ? "" : ` (${account.label})`;
      notes.push(`Assembly segment${called}: ${account.note}`);
      xref = account.xref;
    }
    out.push(...qualifier("note", ascii(notes.join(" "), `feature ${feature.instance_id} note`)));
    if (xref !== null) out.push(...qualifier("db_xref", xref));
    out.push(...colorNote(profile, colorOf(model.paint.get(feature.region_id))));
  }
  return out;
}
function unmergedSegmentLines(model, segments, merged, profile) {
  const out = [];
  for (const segment of segments) {
    if (merged.has(spanOf(segment.start, segment.end))) continue;
    const account = segmentAccount(model, segment);
    const location = segment.start === segment.end ? `${segment.start}` : `${segment.start}..${segment.end}`;
    out.push(featureHeading("Region", location));
    const segmentName = ascii(account.name, "assembly segment");
    out.push(...qualifier("region_name", segmentName));
    out.push(...labelLines(profile, segmentName));
    out.push(...qualifier("note", ascii(account.note, "assembly segment note")));
    if (account.xref !== null) out.push(...qualifier("db_xref", account.xref));
    out.push(...colorNote(profile, LIGHT.neutral));
  }
  return out;
}
function changeRegionLines(normalized, nchain, profile) {
  const { variant } = normalized;
  const chainId = nchain.chain.chain_id;
  const out = [];
  const origins = nchain.correspondence.origins;
  for (const segment of nchain.correspondence.segments) {
    if (segment.kind === "retained") continue;
    const location = segment.start === segment.end ? `${segment.start}` : `${segment.start}..${segment.end}`;
    out.push(featureHeading("Region", location));
    if (segment.kind === "substituted") {
      const changes = [];
      const parentPositions = [];
      for (let at = segment.start; at <= segment.end; at += 1) {
        const origin = origins[at - 1];
        const to = nchain.chain.sequence[at - 1];
        if (origin === void 0 || origin.kind !== "substituted" || to === void 0) {
          throw new GenPeptError(
            `variants.${variant.variant_id} chain ${chainId}: position ${at} is inside a substituted run but its origin is not a substitution. The correspondence and the sequence disagree, and no annotation can be written from that.`
          );
        }
        changes.push(`${origin.fromResidue}${at}${to}`);
        parentPositions.push(`${origin.fromResidue}${origin.parentPosition}`);
      }
      const plural2 = changes.length === 1 ? "substitution" : "substitutions";
      const editName = substitutionLabel(changes, segment.start, segment.end);
      out.push(...qualifier("region_name", editName));
      out.push(...labelLines(profile, editName));
      out.push(
        ...qualifier(
          "note",
          `${changes.length} ${plural2} in this construct's coordinates: ${changes.join(", ")}. In the parent's coordinates the replaced residues are ${parentPositions.join(", ")}. Verified against both sequences.`
        )
      );
      out.push(...colorNote(profile, LIGHT.editInk));
    } else {
      const insertName = `Designed insertion ${location}`;
      out.push(...qualifier("region_name", insertName));
      out.push(...labelLines(profile, insertName));
      out.push(
        ...qualifier(
          "note",
          `${segment.end - segment.start + 1} residue(s) not present in the parent construct. Verified against both sequences.`
        )
      );
      out.push(...colorNote(profile, LIGHT.editInk));
    }
  }
  return out;
}
function featureLines(model, normalized, nchain, profile) {
  const { variant } = normalized;
  const chainId = nchain.chain.chain_id;
  const out = [];
  out.push(featureHeading("Protein", `1..${nchain.length}`));
  const product = chainId === SINGLE_CHAIN_ID ? variant.name : `${variant.name}, ${nchain.chain.name} chain`;
  out.push(...qualifier("product", ascii(product, `variants.${variant.variant_id} name`)));
  const forThisChain = variant.features.filter(
    (feature) => (feature.chain_id ?? SINGLE_CHAIN_ID) === chainId || normalized.chains.length === 1
  );
  const segments = assemblyFor(normalized, nchain)?.segments ?? [];
  const merged = mergedSegments(forThisChain, segments);
  out.push(...designRegionLines(model, forThisChain, merged, profile));
  out.push(...unmergedSegmentLines(model, segments, merged, profile));
  out.push(...changeRegionLines(normalized, nchain, profile));
  return out;
}
function renderGenPept(model, normalized, options) {
  const { variant } = normalized;
  const profile = options.profile ?? "plain";
  const lines = [];
  for (const nchain of normalized.chains) {
    const key = `${variant.variant_id}:${nchain.chain.chain_id}`;
    const name = options.names.get(key) ?? variant.variant_id;
    const copies = nchain.chain.copies ?? 1;
    const lead = variant.construct_role === "reference" ? "Reference construct" : "Proposed construct";
    const chainPart = nchain.chain.chain_id === SINGLE_CHAIN_ID ? "" : `; ${nchain.chain.name} chain`;
    const copyPart = copies > 1 ? `; ${copies} copies per intended assembly` : "";
    const locusName = profile === "snapgene" ? `Exported_${name}` : name;
    lines.push(
      locusLine(
        locusName,
        nchain.length,
        options.date,
        profile === "snapgene" ? LOCUS_NAME_LIMIT + "Exported_".length : LOCUS_NAME_LIMIT
      )
    );
    lines.push(
      ...keyword(
        "DEFINITION",
        ascii(`${lead} ${variant.name}${chainPart}${copyPart}.`, `variants.${variant.variant_id}`)
      )
    );
    lines.push(...keyword("KEYWORDS", "."));
    if (profile === "snapgene") {
      lines.push(`REFERENCE   1  (residues 1 to ${nchain.length})`);
      lines.push(...subKeyword("AUTHORS", "."));
      lines.push(...subKeyword("TITLE", "Direct Submission"));
      lines.push(...subKeyword("JOURNAL", "SnapGene GenBank format"));
    }
    const continuation = " ".repeat(GENPEPT_LAYOUT.keywordColumn - 1);
    commentLines(model, normalized, nchain, options.digest, profile).forEach((text, index) => {
      lines.push(
        ...index === 0 ? keyword("COMMENT", text) : wrapAt(GENPEPT_LAYOUT.keywordColumn, continuation, text)
      );
    });
    lines.push("FEATURES".padEnd(GENPEPT_LAYOUT.featureValueColumn - 1) + "Location/Qualifiers");
    lines.push(...featureLines(model, normalized, nchain, profile));
    lines.push("ORIGIN".padEnd(GENPEPT_LAYOUT.keywordColumn - 1));
    lines.push(
      ...originBlock(
        canonicalResidues(normalized, nchain, `${variant.variant_id}:${nchain.chain.chain_id}`)
      )
    );
    lines.push("//");
  }
  return `${lines.join("\n")}
`;
}
function renderFasta(normalized, options) {
  const { variant } = normalized;
  const out = [];
  for (const nchain of normalized.chains) {
    const key = `${variant.variant_id}:${nchain.chain.chain_id}`;
    const id = options.names.get(key) ?? variant.variant_id;
    const copies = nchain.chain.copies ?? 1;
    const parts = [variant.name];
    if (nchain.chain.chain_id !== SINGLE_CHAIN_ID) parts.push(`${nchain.chain.name} chain`);
    if (copies > 1) parts.push(`${copies} copies per assembly`);
    const residues = canonicalResidues(normalized, nchain, `${variant.variant_id}:${nchain.chain.chain_id}`);
    out.push(`>${id} ${ascii(parts.join("; "), `variants.${variant.variant_id}`)}`);
    for (let at = 0; at < residues.length; at += 60) {
      out.push(residues.slice(at, at + 60));
    }
  }
  return `${out.join("\n")}
`;
}

// src/cli.ts
var USAGE = `construct-maps - protein construct architecture figures

Usage:
  construct-maps render <input.json> <output.html>   interactive document
  construct-maps render <input.json> <output.svg>    static figure
  construct-maps validate <input.json>               check without rendering
  construct-maps validate --final <input.json>       also require the analyses
  construct-maps export <input.json> <outdir>        GenPept (one file) and FASTA
  construct-maps monomers [words...]                 look up the monomer names a peptide's
                                                     chemistry may use (try: monomers D-alanine)

Options:
  --fragment         emit an embeddable HTML fragment instead of a full page
  --amino-acids      draw the sequence letters instead of opening on regions
  --kind <k>         monomers: aa | cap | linker
  --element <e>      monomers: require an attachment on N | C | O | S
  --plain            export: standards-only GenPept, without SnapGene's colour
                     and recognition markers
  --max-bytes <n>    fragment size ceiling in UTF-8 bytes (default 1000000;
                     0 disables). An over-size embed fails silently, so this
                     refuses to hand one on
  --width <px>       figure width used for layout (default 960)
  --theme <t>        light | dark | auto (default auto; follows the reader)
  --no-script        omit the inlined behaviour bundle from an HTML output
  --host-style <f>   append a CSS file to a fragment, so an embedding client
                     can supply its own appearance through an adapter
  -h, --help         show this message

The output format is taken from the output file extension. Version 1 records
are adapted automatically; the adapter reports what it synthesised.

Exit status: 0 on success; 1 when a gate refuses (validate --final with unmet
requirements, or an over-size fragment); 2 for an invalid record, bad usage or
an unreadable file.
`;
var INLINE_EMBED_LIMIT = 1e6;
function parseOptions(argv) {
  const options = {
    final: false,
    fragment: false,
    maxBytes: INLINE_EMBED_LIMIT,
    aminoAcids: false,
    plain: false,
    width: 960,
    theme: "auto",
    script: true,
    hostStyle: null,
    kind: null,
    element: null
  };
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--final":
        options.final = true;
        break;
      case "--fragment":
        options.fragment = true;
        break;
      case "--amino-acids":
        options.aminoAcids = true;
        break;
      case "--plain":
        options.plain = true;
        break;
      case "--max-bytes": {
        const value = Number(argv[++i]);
        if (!Number.isInteger(value) || value < 0) {
          throw new Error("--max-bytes must be a whole number of bytes, or 0 to disable");
        }
        options.maxBytes = value;
        break;
      }
      case "--no-script":
        options.script = false;
        break;
      case "--host-style": {
        const value = argv[++i];
        if (value === void 0) throw new Error("--host-style needs a file path");
        options.hostStyle = value;
        break;
      }
      case "--width": {
        const value = Number(argv[++i]);
        if (!Number.isFinite(value) || value < 260) {
          throw new Error("--width must be a number of at least 260");
        }
        options.width = value;
        break;
      }
      case "--kind": {
        const value = argv[++i];
        if (value !== "aa" && value !== "cap" && value !== "linker") {
          throw new Error("--kind must be aa, cap or linker");
        }
        options.kind = value;
        break;
      }
      case "--element": {
        const value = argv[++i];
        if (value === void 0 || !["N", "C", "O", "S"].includes(value.toUpperCase())) {
          throw new Error("--element takes N, C, O or S, the atoms an attachment can sit on");
        }
        options.element = value.toUpperCase();
        break;
      }
      case "--theme": {
        const value = argv[++i];
        if (value !== "light" && value !== "dark" && value !== "auto") {
          throw new Error("--theme must be light, dark or auto");
        }
        options.theme = value;
        break;
      }
      default:
        if (arg.startsWith("-")) throw new Error(`Unknown option ${arg}`);
        rest.push(arg);
    }
  }
  return { rest, options };
}
async function loadRecord(file) {
  let parsed;
  const raw = await readFile(file, "utf8");
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${file} is not valid JSON: ${error.message}`);
  }
  if (isLegacyRecord(parsed)) {
    const adapted = adaptLegacyRecord(parsed);
    return { record: validateRecord(adapted.record), notes: adapted.notes };
  }
  return { record: validateRecord(parsed), notes: [] };
}
async function readViewerBundle() {
  const here = path.dirname(fileURLToPath3(import.meta.url));
  for (const candidate of [
    path.join(here, "viewer.js"),
    path.join(here, "..", "dist", "viewer.js")
  ]) {
    if (existsSync2(candidate)) return readFile(candidate, "utf8");
  }
  return null;
}
function runMonomers(rest, options) {
  if (rest.length === 0 && options.kind === null && options.element === null) {
    process.stdout.write(describeVocabulary());
    return 0;
  }
  const { rows, total } = lookupMonomers(
    rest,
    options.kind ?? void 0,
    options.element ?? void 0
  );
  if (rows.length === 0) {
    const element = options.element === null ? "" : ` with a ${options.element} attachment`;
    process.stderr.write(
      `No monomer NAME matches ${JSON.stringify(rest.join(" "))}${options.kind === null ? "" : ` among ${options.kind}s`}${element}.
No name matched these words, and the chemistry may still be available. Monomer names come from two conventions -- some rows are named "mercapto", others "sulfanyl" for the same group -- so try a synonym, or search by the ATOM instead:
  monomers --element S        every monomer offering a sulfur attachment
  monomers --element N        a nitrogen, --element C a carbon, --element O an oxygen
  monomers --kind cap         every terminal cap
If an element search also finds nothing, report that the chemistry is not available, and do not substitute a different monomer.
`
    );
    return 1;
  }
  process.stdout.write(formatMonomers(rows, total));
  return 0;
}
async function runValidate(rest, options) {
  const input = rest[0];
  if (input === void 0) throw new Error("validate needs an input file");
  const { record, notes } = await loadRecord(input);
  const model = buildModel(record);
  process.stdout.write(`${input}: valid.
`);
  process.stdout.write(
    `  ${model.variants.length} construct(s), ${record.regions.length} region(s), ${record.sources.length} source(s); longest ${model.maxLength} aa.
`
  );
  let unreliableTracks = 0;
  for (const track of record.tracks ?? []) {
    const recorded = track.method["scored_sequence_sha256"];
    if (typeof recorded !== "string") continue;
    let subject;
    let label;
    if ((track.target_kind ?? "variant") === "donor") {
      subject = (record.donors ?? []).find((d) => d.donor_id === track.applies_to)?.sequence;
      label = `donor ${track.applies_to}`;
    } else {
      const target = model.variants.find((v) => v.variant.variant_id === track.applies_to);
      const chainId = track.chain_id ?? defaultChainId((target?.chains ?? []).map((c) => c.chain));
      subject = target?.chains.find((c) => c.chain.chain_id === chainId)?.chain.sequence;
      label = `${track.applies_to}:${chainId}`;
    }
    if (subject === void 0) {
      process.stdout.write(
        `  WARNING: track ${track.track_id} records a sequence hash but its target (${label}) could not be resolved, so the hash was NOT verified.
`
      );
      unreliableTracks += 1;
      continue;
    }
    const actual = createHash("sha256").update(subject).digest("hex");
    if (actual !== recorded) {
      process.stdout.write(
        `  WARNING: track ${track.track_id} records sha256 ${recorded.slice(0, 16)}... but ${label} now hashes to ${actual.slice(0, 16)}...
           The sequence changed after the track was imported, so these values are indexed into a sequence that no longer exists. Recompute and re-import.
`
      );
      unreliableTracks += 1;
    }
  }
  for (const note of notes) process.stdout.write(`  adapter: ${note}
`);
  for (const warning of model.warnings) process.stdout.write(`  check: ${warning}
`);
  for (const item of model.outstanding) process.stdout.write(`  outstanding: ${item}
`);
  const outstanding = model.outstanding;
  const unmet = outstanding.length + unreliableTracks;
  if (options.final && unmet > 0) {
    process.stderr.write(
      `
${input}: ${unmet} delivery requirement(s) not satisfied, listed above. ` + (outstanding.length > 0 ? "Record each analysis as done, or as attempted with the specific reason it produced nothing usable. " : "") + (unreliableTracks > 0 ? "A track whose sequence hash does not match, or cannot be checked, is recomputed and imported again." : "") + "\n"
    );
    return 1;
  }
  for (const normalized of model.variants) {
    for (const nchain of normalized.chains) {
      if (nchain.correspondence.provenance === "none") continue;
      const label = normalized.chains.length > 1 ? `${normalized.variant.name} / ${nchain.chain.chain_id}` : normalized.variant.name;
      process.stdout.write(`  ${label}: ${nchain.correspondence.headline}
`);
    }
  }
  return 0;
}
async function runExport(rest, options) {
  const [input, outdir] = rest;
  if (input === void 0 || outdir === void 0) {
    throw new Error("export needs an input file and an output directory");
  }
  const { record, notes } = await loadRecord(input);
  const model = buildModel(record);
  for (const note of notes) process.stderr.write(`adapter: ${note}
`);
  const date = flatFileDate(/* @__PURE__ */ new Date());
  const names = locusNames(model.variants);
  const digest = createHash("sha256").update(await readFile(input)).digest("hex");
  const stem = path.basename(input).replace(/\.json$/i, "").replace(/[^A-Za-z0-9_.-]+/g, "_");
  const gp = model.variants.map(
    (normalized) => renderGenPept(model, normalized, {
      date,
      names,
      digest,
      profile: options.plain ? "plain" : "snapgene"
    })
  ).join("");
  const files = /* @__PURE__ */ new Map([[`${stem || "constructs"}.gp`, gp]]);
  for (const normalized of model.variants) {
    const name = `${normalized.variant.variant_id.replace(/[^A-Za-z0-9_.-]+/g, "_")}.fasta`;
    if (files.has(name)) {
      throw new Error(
        `two constructs produce the same file name ${JSON.stringify(name)}; give them variant_ids that differ by more than punctuation`
      );
    }
    files.set(name, renderFasta(normalized, { names }));
  }
  await mkdir(outdir, { recursive: true });
  for (const [name, text] of files) {
    await writeFile(path.join(outdir, name), text, "utf8");
  }
  const records = model.variants.reduce((n, v) => n + v.chains.length, 0);
  process.stdout.write(
    `${outdir}: ${stem || "constructs"}.gp holds ${model.variants.length} construct(s) as ${records} record(s); ${model.variants.length} FASTA file(s) beside it, one each.
`
  );
  process.stdout.write(
    "  Protein only. No coding sequence is written, because a back-translation is a design decision this tool does not make.\n"
  );
  process.stdout.write(
    "  Format conformance is checked against a reference record from NCBI. Nothing here verifies import into SnapGene.\n"
  );
  return 0;
}
function viewSetup(model) {
  const assembled = isAssemblyRecord(model);
  const chainIds = [
    ...new Set(model.variants.flatMap((v) => v.chains.map((c) => c.chain.chain_id)))
  ];
  const alignments = new Map(
    chainIds.map((chainId) => [
      chainId,
      assembled ? buildConstructAxis(model, chainId) : buildAlignment(model, chainId)
    ])
  );
  const widest = [...alignments.values()].reduce(
    (a, b) => b.totalColumns > a.totalColumns ? b : a
  );
  const multiChainRecord = model.variants.some((v) => v.chains.length > 1);
  return {
    assembled,
    alignments,
    fullViewport: { from: 0, to: widest.totalColumns },
    axisOptions: assembled ? { axisMode: "construct" } : multiChainRecord ? { axisMode: "chains" } : {}
  };
}
function renderSvgFigure(model, setup, options) {
  const layout = layoutView(model, setup.alignments, {
    width: options.width,
    viewport: setup.fullViewport,
    // A static figure has no mode to be in, so it takes the viewer's
    // documented default, which is the functional regions. An export made
    // from inside the viewer passes the mode it is actually in, so
    // exporting from Amino acids still carries the sequence.
    residueView: options.aminoAcids,
    ...setup.axisOptions
  });
  return renderView(
    layout,
    {
      rootId: model.rootId,
      background: true,
      ...options.theme === "auto" ? {} : { theme: options.theme }
    },
    true
  );
}
async function renderHtmlPage(model, record, setup, options) {
  const layout = layoutView(model, setup.alignments, {
    width: options.width,
    viewport: setup.fullViewport,
    // The workspace carries the row header in the DOM, so the rows neither
    // draw it nor reserve space for it.
    rowHeader: false,
    // Same policy as the mounted viewer, so the first frame and the first
    // redraw show the same thing. A viewer that opens on regions never shows
    // residue letters at first, so shipping one SVG <text> element per
    // residue per construct would add thousands of nodes that the first
    // redraw discards.
    // The letters are recomputed on any redraw anyway, so this costs a
    // reader nothing: switching mode already rebuilds the rows, and every
    // construct's full sequence is in its details disclosure as selectable
    // text, which is what a reader without scripts can actually use.
    residueView: options.aminoAcids,
    ...setup.axisOptions
  });
  const renderOptions = {
    rootId: model.rootId,
    interactive: true,
    // The workspace document emits the scoped stylesheet once, so the rows
    // inside it do not each carry a copy.
    inlineStyles: false,
    ...options.theme === "auto" ? {} : { theme: options.theme }
  };
  const axisSvg = renderAxis(layout, renderOptions);
  const trackSvgs = layout.tracks.map((track, index) => ({
    variantId: track.variantId,
    chainId: track.chainId,
    // The workspace prints name, role, length and basis as a DOM heading
    // beside the expand control, so the row SVG must not print them again.
    svg: renderTrack(layout, index, { ...renderOptions, rowHeaderInSvg: false })
  }));
  const script = options.script ? await readViewerBundle() : null;
  if (options.script && script === null) {
    process.stderr.write(
      "warning: dist/viewer.js was not found, so the document is static. Run `npm run build`.\n"
    );
  }
  const hostStyle = options.hostStyle === null ? null : await readFile(options.hostStyle, "utf8");
  if (hostStyle !== null && !options.fragment) {
    process.stderr.write(
      "note: --host-style is intended for --fragment output embedded in a host page.\n"
    );
  }
  const documentOptions = {
    rootId: model.rootId,
    axisSvg,
    trackSvgs,
    sitePresence: resolveSites(model, setup.alignments, record.sites ?? [], {
      propagate: !setup.assembled
    }),
    // The renderer escapes the payload for embedding in a script element.
    payload: JSON.stringify(record),
    ...script === null ? {} : { script },
    ...hostStyle === null ? {} : { hostStyle }
  };
  return options.fragment ? renderWorkspace(model, documentOptions) : renderWorkspaceDocument(model, documentOptions);
}
function refusesFragment(bytes, options, output) {
  if (!options.fragment || options.maxBytes <= 0 || bytes <= options.maxBytes) return false;
  process.stderr.write(
    `
${path.resolve(output)}: ${bytes.toLocaleString()} UTF-8 bytes, over the ${options.maxBytes.toLocaleString()}-byte inline limit by ${(bytes - options.maxBytes).toLocaleString()}.
Nothing was written, because an over-size embed fails without a visible error. Reduce the number of constructs or shorten their text, link the standalone document instead, or pass --max-bytes to change the ceiling.
`
  );
  return true;
}
async function runRender(rest, options) {
  const [input, output] = rest;
  if (input === void 0 || output === void 0) {
    throw new Error("render needs an input file and an output file");
  }
  const { record, notes } = await loadRecord(input);
  const model = buildModel(record);
  for (const note of notes) process.stderr.write(`adapter: ${note}
`);
  for (const warning of model.warnings) process.stderr.write(`check: ${warning}
`);
  await mkdir(path.dirname(path.resolve(output)), { recursive: true });
  const extension = path.extname(output).toLowerCase();
  const setup = viewSetup(model);
  if (extension === ".svg") {
    await writeFile(output, renderSvgFigure(model, setup, options));
  } else if (extension === ".html" || extension === ".htm") {
    const html = await renderHtmlPage(model, record, setup, options);
    const bytes = Buffer.byteLength(html, "utf8");
    if (refusesFragment(bytes, options, output)) return 1;
    await writeFile(output, html);
    if (options.fragment) {
      const share = options.maxBytes > 0 ? ` (${Math.round(bytes / options.maxBytes * 100)}% of the ${options.maxBytes.toLocaleString()}-byte inline limit)` : "";
      process.stdout.write(`  fragment: ${bytes.toLocaleString()} UTF-8 bytes${share}
`);
    }
  } else {
    throw new Error(
      `Cannot tell the output format from ${JSON.stringify(extension)}. Use .html or .svg.`
    );
  }
  process.stdout.write(`${path.resolve(output)}
`);
  return 0;
}
async function main(argv) {
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    process.stdout.write(USAGE);
    return argv.length === 0 ? 1 : 0;
  }
  const command = argv[0];
  const { rest, options } = parseOptions(argv.slice(1));
  switch (command) {
    case "monomers":
      return runMonomers(rest, options);
    case "validate":
      return runValidate(rest, options);
    case "export":
      return runExport(rest, options);
    case "render":
      return runRender(rest, options);
    default:
      throw new Error(`Unknown command ${JSON.stringify(command)}`);
  }
}
var invoked = process.argv[1] !== void 0;
if (invoked) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}
`);
    process.exitCode = 2;
  });
}
export {
  main
};
