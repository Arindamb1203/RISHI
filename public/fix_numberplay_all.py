import json, os

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'class7', 'number-play.json')
with open(path, encoding='utf-8') as f:
    d = json.load(f)

eq = d['explain_questions']

# Q3 confirm: "List all factors of 18" — answer was factors of 24
eq[2]['answers'] = ["1, 2, 3, 6, 9, 18", "1 2 3 6 9 18"]
eq[2]['nudges'][2] = "The factors of 18 are 1, 2, 3, 6, 9, 18. (Not 4 or 8 — those don't divide 18 exactly!)"
print("Q3 fixed:", eq[2]['answers'])

# Q4 confirm: "List first 4 multiples of 9" — answer was multiples of 7
eq[3]['answers'] = ["9, 18, 27, 36", "9 18 27 36"]
eq[3]['nudges'][2] = "First 4 multiples of 9: 9x1=9, 9x2=18, 9x3=27, 9x4=36."
print("Q4 fixed:", eq[3]['answers'])

# Q5 confirm: "Is 316 divisible by 4 and 8?" — 316/4=79 YES, 316/8=39.5 NO
eq[4]['answers'] = ["Yes, No", "Yes No"]
eq[4]['nudges'][2] = "Last two digits of 316 form 16, divisible by 4 (16/4=4). Last three digits form 316. 316/8=39.5, NOT divisible by 8. Answer: Yes, No."
print("Q5 fixed:", eq[4]['answers'])

# Q6 confirm: "Is 734 divisible by 6?" — 7+3+4=14, not div by 3, so NO
eq[5]['answers'] = ["No", "no"]
eq[5]['nudges'][1] = "Next, calculate the sum of digits of 734: 7+3+4=14. Is 14 divisible by 3? No!"
eq[5]['nudges'][2] = "734 is even (div by 2) but digit sum is 14, NOT divisible by 3. So 734 is NOT divisible by 6."
print("Q6 fixed:", eq[5]['answers'])

# Q8 confirm: "Prime factorisation of 48" — 48=2x2x2x2x3, not 2x2x3x5
eq[7]['answers'] = ["2 x 2 x 2 x 2 x 3", "2^4 x 3", "2*2*2*2*3"]
eq[7]['nudges'][0] = "Start by splitting 48 into two factors, for example, 8 and 6."
eq[7]['nudges'][1] = "Now, split 8 into its prime factors (2x2x2) and 6 into its prime factors (2x3)."
eq[7]['nudges'][2] = "48 = 8 x 6 = (2x2x2) x (2x3) = 2 x 2 x 2 x 2 x 3."
print("Q8 fixed:", eq[7]['answers'])

# Q9 confirm: "HCF of 28 and 42" — HCF=14, not 12
# 28=2^2x7, 42=2x3x7. Common: 2^1 and 7^1. HCF=2x7=14
eq[8]['answers'] = ["14"]
eq[8]['nudges'][0] = "Prime factors of 28 are 2 x 2 x 7."
eq[8]['nudges'][1] = "Prime factors of 42 are 2 x 3 x 7."
eq[8]['nudges'][2] = "Common prime factors: one 2 and one 7. HCF = 2 x 7 = 14."
print("Q9 fixed:", eq[8]['answers'])

with open(path, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
print("\nAll fixes saved successfully.")
