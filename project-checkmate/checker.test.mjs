import {verify} from './checker.mjs';
const tests=[
  {
    "schema": "cm-kxk-v1",
    "challenge": "kxk-01",
    "proof": {
      "move": "g6g7",
      "next": {
        "mate": true
      }
    }
  },
  {
    "schema": "cm-kxk-v1",
    "challenge": "kxk-02",
    "proof": {
      "move": "a7a8",
      "next": {
        "mate": true
      }
    }
  },
  {
    "schema": "cm-kxk-v1",
    "challenge": "kxk-03",
    "proof": {
      "move": "e7f6",
      "next": {
        "replies": {
          "h8g8": {
            "move": "a7g7",
            "next": {
              "mate": true
            }
          }
        }
      }
    }
  },
  {
    "schema": "cm-kxk-v1",
    "challenge": "kxk-04",
    "proof": {
      "move": "e7f7",
      "next": {
        "replies": {
          "h8h7": {
            "move": "a5h5",
            "next": {
              "mate": true
            }
          }
        }
      }
    }
  },
  {
    "schema": "cm-kxk-v1",
    "challenge": "kxk-05",
    "proof": {
      "move": "b4c3",
      "next": {
        "replies": {
          "a1a2": {
            "move": "b8b2",
            "next": {
              "mate": true
            }
          }
        }
      }
    }
  }
];
let pass=0;for(const t of tests){verify(t);pass++;}
const rejects=[{...tests[0],proof:{mate:true}},{...tests[0],proof:{move:'a1a2',next:{mate:true}}},{...tests[0],challenge:'unknown'}];
const d=JSON.parse(JSON.stringify(tests.find(t=>t.proof.next?.replies)));delete d.proof.next.replies[Object.keys(d.proof.next.replies)[0]];rejects.push(d);
for(const t of rejects){let failed=false;try{verify(t)}catch(e){failed=true;}if(!failed)throw Error('negative test accepted');pass++;}console.log('Passed '+pass+' certificate tests (calibration only)');
