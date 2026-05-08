import json, os

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'class7', 'a-peek-beyond-the-point.json')
with open(path, encoding='utf-8') as f:
    d = json.load(f)

eq = d['explain_questions']

# Q1: "place value of 4 in 0.49?" → Tenths (4 is first digit after decimal)
eq[0]['answers'] = ["Tenths", "tenths"]
eq[0]['nudges'][2] = "The digit 4 is the first digit after the decimal point, which is the tenths place."
print("Q1 fixed:", eq[0]['answers'])

# Q2: "How do you read 10.05?" → Ten point zero five
eq[1]['answers'] = ["Ten point zero five"]
eq[1]['nudges'][2] = "You read it as 'Ten point zero five'. The digits after the decimal are read individually."
print("Q2 fixed:", eq[1]['answers'])

# Q3: "Convert 7/100 to a decimal" → 0.07
eq[2]['answers'] = ["0.07"]
eq[2]['nudges'][0] = "The denominator 100 has 2 zeros, so the decimal will have 2 places after the point."
eq[2]['nudges'][1] = "The numerator is 7. Write it in the hundredths place with a zero in the tenths place."
eq[2]['nudges'][2] = "7/100 = 0.07. The 7 is in the hundredths (second decimal) place."
print("Q3 fixed:", eq[2]['answers'])

# Q4: "Which is smaller: 1.2 or 1.25?" → 1.2
eq[3]['answers'] = ["1.2", "1.20"]
eq[3]['nudges'][0] = "Write both with same decimal places: 1.20 and 1.25."
eq[3]['nudges'][1] = "Both have 1 in ones and 2 in tenths. Compare hundredths: 0 vs 5."
eq[3]['nudges'][2] = "0 is less than 5, so 1.20 is smaller. Answer: 1.2"
print("Q4 fixed:", eq[3]['answers'])

# Q5: "What is 2.1 + 0.55?" → 2.65
eq[4]['answers'] = ["2.65"]
eq[4]['nudges'][0] = "Align decimal points: 2.10 and 0.55."
eq[4]['nudges'][1] = "Add hundredths: 0+5=5. Add tenths: 1+5=6. Add ones: 2+0=2."
eq[4]['nudges'][2] = "2.10 + 0.55 = 2.65"
print("Q5 fixed:", eq[4]['answers'])

# Q6: "What is 7.3 - 1.25?" → 6.05
eq[5]['answers'] = ["6.05"]
eq[5]['nudges'][0] = "Write 7.3 as 7.30. Then align: 7.30 - 1.25."
eq[5]['nudges'][1] = "Subtract hundredths: 0-5 requires borrowing. After borrowing: 10-5=5."
eq[5]['nudges'][2] = "7.30 - 1.25 = 6.05"
print("Q6 fixed:", eq[5]['answers'])

# Q7: "What is 1.2 x 4?" → 4.8
eq[6]['answers'] = ["4.8"]
eq[6]['nudges'][0] = "Multiply 12 by 4 ignoring decimal: 12 x 4 = 48."
eq[6]['nudges'][1] = "Count decimal places in 1.2: one decimal place."
eq[6]['nudges'][2] = "Place decimal in 48: one place from right gives 4.8"
print("Q7 fixed:", eq[6]['answers'])

# Q8: "What is 3.7 / 10?" → 0.37
eq[7]['answers'] = ["0.37"]
eq[7]['nudges'][0] = "Dividing by 10 means moving decimal point one place to the left."
eq[7]['nudges'][1] = "3.7 has the decimal after the 3. Move it one place left."
eq[7]['nudges'][2] = "3.7 / 10 = 0.37"
print("Q8 fixed:", eq[7]['answers'])

# Q9: "What is 0.2 x 0.5?" → 0.10
eq[8]['answers'] = ["0.1", "0.10"]
eq[8]['nudges'][0] = "Multiply 2 by 5 ignoring decimals: 2 x 5 = 10."
eq[8]['nudges'][1] = "Total decimal places: 1 (in 0.2) + 1 (in 0.5) = 2 places."
eq[8]['nudges'][2] = "Place decimal 2 places from right in 10: gives 0.10 = 0.1"
print("Q9 fixed:", eq[8]['answers'])

with open(path, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
print("\nAll 9 fixes saved successfully.")
