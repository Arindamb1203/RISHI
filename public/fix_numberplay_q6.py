import json, os

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'class7', 'number-play.json')
with open(path, encoding='utf-8') as f:
    d = json.load(f)

pq = d['practice_questions']
print("Q6 before:", pq[5]['answers'], "|", pq[5]['question'][:60])
pq[5]['answers'] = ["2 x 2 x 7", "2^2 x 7"]
pq[5]['steps'][2] = "Combine all prime factors: 28 = 2 x 2 x 7 = 2^2 x 7."

with open(path, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
print("Q6 after:", pq[5]['answers'])
print("Fixed.")
