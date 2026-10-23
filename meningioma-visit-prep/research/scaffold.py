#!/usr/bin/env python3
"""Offline, synthetic-only research plumbing. No model, training or inference."""
import argparse
from collections import defaultdict
import hashlib
import json
import math
from pathlib import Path

TASKS = {'men_four_sequence': ['t1n', 't1c', 't2w', 'flair'], 'men_rt_t1c': ['t1c']}
WARNING = 'SYNTHETIC ENGINEERING TEST ONLY — NOT CLINICAL PERFORMANCE; NO TRAINED MODEL'


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate(manifest):
    """Validate declared metadata, NOT actual NIfTI geometry or clinical suitability."""
    require(manifest.get('schema_version') == 1, 'schema_version must be 1')
    require(manifest.get('synthetic') is True, 'Real patient data is disabled in this release')
    task = manifest.get('task')
    require(task in TASKS, 'Unsupported task')
    studies = manifest.get('studies')
    require(isinstance(studies, list) and studies, 'studies must be nonempty')
    seen = set()
    for s in studies:
        for k in ('patient_id', 'study_id', 'center_id'):
            require(isinstance(s.get(k), str) and s[k].startswith('SYN-'), f'{k} must be synthetic SYN- ID')
        require(s['study_id'] not in seen, 'Duplicate study_id')
        seen.add(s['study_id'])
        require(s.get('authorization') == 'synthetic_no_patient_data', 'Synthetic provenance required')
        require(s.get('label_source') == 'synthetic', 'Synthetic label provenance required')
        require(s.get('deidentified') is True, 'deidentified must be true')
        seq = s.get('sequences', {})
        require(set(seq) == set(TASKS[task]), 'Missing or unexpected sequence; do not substitute tasks')
        grid = None
        for info in seq.values():
            require(isinstance(info, dict), 'Sequence metadata must be an object')
            shape, spacing = info.get('shape'), info.get('spacing_mm')
            require(isinstance(shape, list) and len(shape) == 3 and all(type(n) is int and n > 0 for n in shape), 'Invalid 3D shape')
            require(isinstance(spacing, list) and len(spacing) == 3 and all(type(n) in (int, float) and math.isfinite(n) and n > 0 for n in spacing), 'Invalid spacing')
            require(info.get('orientation') == 'RAS', 'Synthetic orientation must be RAS')
            require(isinstance(info.get('grid_id'), str) and info['grid_id'], 'grid_id required')
            require(isinstance(info.get('sha256'), str) and len(info['sha256']) == 64 and all(c in '0123456789abcdef' for c in info['sha256']), 'Invalid SHA256')
            require(isinstance(info.get('uri'), str) and info['uri'].startswith('synthetic://'), 'Only synthetic URIs accepted')
            current = (shape, spacing, info['grid_id'], info['orientation'])
            require(grid is None or grid == current, 'Declared grids differ; registration not established')
            grid = current
    return {'valid_declared_metadata': True, 'actual_image_qc': 'NOT IMPLEMENTED', 'patients': len({s['patient_id'] for s in studies}), 'studies': len(studies), 'manifest_sha256': digest(manifest), 'warning': WARNING}


def audit_split(manifest, split):
    validate(manifest)
    require(split.get('manifest_sha256') == digest(manifest), 'Manifest has changed since split freeze')
    require(set(split.get('sets', {})) == {'train', 'validation', 'test'}, 'Three named sets required')
    studies = {s['study_id']: s for s in manifest['studies']}
    seen, owners = set(), {}
    for group, ids in split['sets'].items():
        require(isinstance(ids, list) and ids, 'Empty partition; increase synthetic cohort')
        for sid in ids:
            require(sid in studies and sid not in seen, 'Unknown or repeated study in split')
            seen.add(sid)
            pid = studies[sid]['patient_id']
            require(pid not in owners or owners[pid] == group, 'PATIENT LEAKAGE across partitions')
            owners[pid] = group
    require(seen == set(studies), 'Split must cover all studies')
    return True


def split_manifest(manifest, seed=20261009, external_center=None):
    validate(manifest)
    patients = {s['patient_id'] for s in manifest['studies']}
    require(len(patients) >= 5, 'At least five synthetic patients needed for three nonempty partitions')
    order = lambda ids: sorted(ids, key=lambda p: hashlib.sha256(f'{seed}:{p}'.encode()).hexdigest())
    if external_center:
        test = {s['patient_id'] for s in manifest['studies'] if s['center_id'] == external_center}
        require(test, 'External center does not exist')
        development = order(patients - test)
        require(len(development) >= 3, 'Too few remaining patients')
        n_val = max(1, int(len(development) * .2))
        val, train = set(development[:n_val]), set(development[n_val:])
    else:
        ids = order(patients)
        n_test = max(1, int(len(ids) * .2)); n_val = max(1, int(len(ids) * .2))
        test, val, train = set(ids[:n_test]), set(ids[n_test:n_test+n_val]), set(ids[n_test+n_val:])
    sets = {name: sorted(s['study_id'] for s in manifest['studies'] if s['patient_id'] in pids) for name, pids in [('train', train), ('validation', val), ('test', test)]}
    result = {'schema_version': 1, 'manifest_sha256': digest(manifest), 'seed': seed, 'external_center': external_center, 'sets': sets, 'warning': WARNING}
    audit_split(manifest, result)
    return result


def evaluate(manifest, split, cases):
    audit_split(manifest, split)
    require(isinstance(cases, list) and cases, 'No evaluation cases')
    expected = set(split['sets']['test']); seen = set()
    studies = {s['study_id']: s for s in manifest['studies']}
    per_patient = defaultdict(list); rows = []; both_empty = 0; negative_cases = 0; negative_fp = 0
    for c in cases:
        sid = c.get('study_id')
        require(sid in expected and sid not in seen, 'Evaluation must contain each frozen TEST study exactly once')
        seen.add(sid); pid = studies[sid]['patient_id']
        require(c.get('patient_id') == pid, 'Patient ID mismatch')
        require(c.get('synthetic') is True, 'Only synthetic evaluation supported')
        gt, pred, shape = c.get('target'), c.get('prediction'), c.get('shape')
        require(isinstance(shape, list) and len(shape) == 3 and all(type(n) is int and n > 0 for n in shape), 'Invalid evaluation shape')
        require(isinstance(gt, list) and isinstance(pred, list) and len(gt) == len(pred) == math.prod(shape), 'Mask shape/length mismatch')
        require(all(type(x) is int and x in (0, 1) for x in gt + pred), 'Masks must be binary integer arrays')
        g, p = sum(gt), sum(pred); intersection = sum(a*b for a,b in zip(gt,pred))
        dice = (2 * intersection / (g+p)) if g+p else None
        both_empty += int(g+p == 0); negative_cases += int(g == 0); negative_fp += int(g == 0 and p > 0)
        per_patient[pid]  # preserve patients with only empty masks in denominator reporting
        if dice is not None: per_patient[pid].append(dice)
        rows.append({'study_id': sid, 'patient_id': pid, 'dice': dice, 'both_empty': g+p == 0, 'false_positive_voxels': sum(a == 0 and b == 1 for a,b in zip(gt,pred)), 'absolute_volume_error_voxels': abs(p-g)})
    require(seen == expected, 'Missing frozen TEST study; selective reporting blocked')
    patient_means = {p: sum(ds)/len(ds) if ds else None for p,ds in sorted(per_patient.items())}
    defined = [x for x in patient_means.values() if x is not None]
    return {'warning': WARNING, 'trained_model': False, 'clinical_validation': False, 'manifest_sha256': digest(manifest), 'split_sha256': digest(split), 'engineering_patient_macro_dice': sum(defined)/len(defined) if defined else None, 'patient_dice': patient_means, 'defined_dice_patients': len(defined), 'total_test_patients': len(per_patient), 'both_empty_excluded_studies': both_empty, 'negative_target_studies': negative_cases, 'negative_target_with_fp_studies': negative_fp, 'per_study': rows, 'not_implemented': ['NIfTI loading', 'preprocessing and inverse transforms', 'HD95', 'lesion detection', 'confidence intervals', 'clinical subgroup and external validation']}


def read(path): return json.loads(Path(path).read_text())
def write(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False)+'\n')


def main():
    ap=argparse.ArgumentParser(description=__doc__); sub=ap.add_subparsers(dest='command', required=True)
    v=sub.add_parser('validate'); v.add_argument('manifest')
    s=sub.add_parser('split'); s.add_argument('manifest'); s.add_argument('--seed', type=int, default=20261009); s.add_argument('--external-center'); s.add_argument('--out', default='output')
    e=sub.add_parser('evaluate'); e.add_argument('manifest'); e.add_argument('split'); e.add_argument('cases'); e.add_argument('--out', default='output')
    d=sub.add_parser('demo'); d.add_argument('--out', default='output')
    a=ap.parse_args()
    try:
        if a.command=='validate': print(json.dumps(validate(read(a.manifest)), indent=2))
        elif a.command=='split':
            data=split_manifest(read(a.manifest), a.seed, a.external_center); write(Path(a.out)/'split.json', data); print(WARNING)
        elif a.command=='evaluate':
            data=evaluate(read(a.manifest), read(a.split), read(a.cases)); write(Path(a.out)/'evaluation.json', data); print(WARNING)
        else:
            manifest=read(Path(__file__).with_name('manifest.example.json')); split=split_manifest(manifest)
            lookup={s['study_id']:s for s in manifest['studies']}
            cases=[{'study_id':sid, 'patient_id':lookup[sid]['patient_id'], 'synthetic':True, 'shape':[2,2,2], 'target':[1,1,0,0,0,0,0,0], 'prediction':[1,0,1,0,0,0,0,0]} for sid in split['sets']['test']]
            write(Path(a.out)/'split.json', split); write(Path(a.out)/'synthetic-cases.json', cases); write(Path(a.out)/'evaluation.json', evaluate(manifest,split,cases)); print(WARNING)
    except (ValueError, KeyError, TypeError) as ex:
        ap.error(str(ex))

if __name__ == '__main__': main()
