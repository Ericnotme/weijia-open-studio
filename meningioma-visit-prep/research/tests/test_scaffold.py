import copy
import json
from pathlib import Path
import unittest
from scaffold import validate, split_manifest, audit_split, evaluate

class ScaffoldTests(unittest.TestCase):
    def setUp(self):
        self.m=json.loads((Path(__file__).parents[1]/'manifest.example.json').read_text())
        self.s=split_manifest(self.m)
    def cases(self, empty=False):
        lookup={s['study_id']:s for s in self.m['studies']}
        return [{'study_id':sid,'patient_id':lookup[sid]['patient_id'],'synthetic':True,'shape':[1,1,2],'target':[0,0] if empty else [1,0],'prediction':[0,0] if empty else [1,0]} for sid in self.s['sets']['test']]
    def test_manifest(self): self.assertTrue(validate(self.m)['valid_declared_metadata'])
    def test_real_data_blocked(self):
        self.m['synthetic']=False
        with self.assertRaisesRegex(ValueError,'disabled'): validate(self.m)
    def test_missing_sequence(self):
        del self.m['studies'][0]['sequences']['t1c']
        with self.assertRaisesRegex(ValueError,'sequence'): validate(self.m)
    def test_task_swap_blocked(self):
        self.m['task']='men_four_sequence'
        with self.assertRaises(ValueError): validate(self.m)
    def test_invalid_spacing(self):
        self.m['studies'][0]['sequences']['t1c']['spacing_mm']=[1,0,1]
        with self.assertRaises(ValueError): validate(self.m)
    def test_reproducible(self): self.assertEqual(self.s,split_manifest(self.m))
    def test_grouped_repeat_studies(self):
        owners={}
        for group, ids in self.s['sets'].items():
            for s in self.m['studies']:
                if s['study_id'] in ids:
                    if s['patient_id'] in owners: self.assertEqual(owners[s['patient_id']],group)
                    owners[s['patient_id']]=group
    def test_patient_leak_detected(self):
        pair=[s['study_id'] for s in self.m['studies'] if s['patient_id']=='SYN-P00']
        source=next(k for k,ids in self.s['sets'].items() if pair[0] in ids)
        dest=next(k for k in self.s['sets'] if k!=source)
        self.s['sets'][source].remove(pair[0]);self.s['sets'][dest].append(pair[0])
        with self.assertRaisesRegex(ValueError,'LEAKAGE'): audit_split(self.m,self.s)
    def test_manifest_change_detected(self):
        self.m['studies'][0]['center_id']='SYN-OTHER'
        with self.assertRaisesRegex(ValueError,'changed'): audit_split(self.m,self.s)
    def test_external_center(self):
        s=split_manifest(self.m, external_center='SYN-C2')
        for row in self.m['studies']:
            if row['center_id']=='SYN-C2': self.assertIn(row['study_id'],s['sets']['test'])
    def test_perfect_synthetic(self):
        result=evaluate(self.m,self.s,self.cases())
        self.assertEqual(result['engineering_patient_macro_dice'],1)
        self.assertFalse(result['trained_model'])
    def test_both_empty_not_inflated(self):
        result=evaluate(self.m,self.s,self.cases(empty=True))
        self.assertIsNone(result['engineering_patient_macro_dice'])
        self.assertEqual(result['defined_dice_patients'],0)
    def test_negative_false_positive(self):
        cases=self.cases(empty=True)
        for c in cases:c['prediction']=[1,0]
        result=evaluate(self.m,self.s,cases)
        self.assertEqual(result['engineering_patient_macro_dice'],0)
        self.assertEqual(result['negative_target_with_fp_studies'],len(cases))
    def test_no_selective_reporting(self):
        with self.assertRaises(ValueError):evaluate(self.m,self.s,self.cases()[:-1])
    def test_nonbinary_rejected(self):
        cases=self.cases();cases[0]['prediction']=[2,0]
        with self.assertRaises(ValueError):evaluate(self.m,self.s,cases)
    def test_shape_mismatch(self):
        cases=self.cases();cases[0]['shape']=[1,1,3]
        with self.assertRaises(ValueError):evaluate(self.m,self.s,cases)
    def test_train_eval_rejected(self):
        cases=self.cases();cases[0]['study_id']=self.s['sets']['train'][0]
        with self.assertRaises(ValueError):evaluate(self.m,self.s,cases)

if __name__=='__main__':unittest.main()
