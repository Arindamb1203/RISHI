import json
path = 'data/class7/arithmetic-expressions.json'
with open(path, encoding='utf-8') as f:
    data = json.load(f)
data['practice_questions'][12]['answers'] = ['20']
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('Fixed. Answer is now:', data['practice_questions'][12]['answers'])
