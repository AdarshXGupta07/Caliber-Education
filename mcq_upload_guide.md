# Comprehensive MCQ Configuration Guide

This document provides a detailed breakdown of how to construct a CA Hierarchy MCQ Test Paper. You can either construct your test seamlessly using the **Manual Form Editor** or massively accelerate the process using the **Bulk JSON Uploader**.

---

## Method 1: The Manual Editor (Step-by-Step)

The manual editor has been entirely redesigned so that Case Scenarios and Normal Questions sit directly side-by-side inside your Exam Sections.

1. **Access the Hierarchy Engine:** Open your Admin Dashboard and click the **MCQ Hierarchy** tab.
2. **Create/Edit a Paper:** Click "+ New Paper" or edit an existing one. Define the Level, Group, Subject, duration, and marking logic.
3. **Go to Sections & Questions:** Click the final tab. If the paper is empty, click **+ Manual Section** to create a block (e.g., "Section A: Compulsory").
4. **Add Items to the Section:**
   * **To add a standard MCQ:** Click **+ Add Normal Question**. You'll get a clean form to write the question, 4 options, marks, and the correct option.
   * **To add a Case Study:** Click **+ Add Case Study Block**. 
     - A massive text block will appear for your reading passage/narrative.
     - Beneath that, a special **"+ Add Sub-Question"** button appears. Click it to strictly bind consecutive MCQs to that specific reading passage.
5. **Save the Exam:** Once you have loaded your sections, hit the green **Publish** switch on the "Hierarchy & Settings" tab and click "Save Paper". 

---

## Method 2: Bulk JSON Uploader (Fast Automation)

If you have 100 questions typed out by a faculty member, you can use the JSON Uploader to instantly inject the entire exam into the database.

1. Open the **Sections & Questions** tab. 
2. Click the shiny gold **Bulk Upload JSON** button.
3. Select your pre-formatted `.json` file from your computer.

### The Strict JSON Format Required:

The JSON file MUST be an **Array of Sections**. Each section contains a `title` and an array of `questions`. 
Case Study questions have `type: "case"` and define the `case_narrative` directly on the first sub-question (the system automatically groups them!).

```json
[
  {
    "title": "Section A: Independent Assessment",
    "questions": [
      {
        "type": "normal",
        "content": "According to Ind AS 2, what is the measurement principle for inventory?",
        "options": [
          "Lower of cost or net realizable value",
          "Fair value less costs to sell",
          "Historical cost",
          "Replacement cost"
        ],
        "correct_option": 0,
        "explanation": "Ind AS 2 standard core principle.",
        "marks": 2,
        "negative_marks": 0.5,
        "difficulty": "medium"
      }
    ]
  },
  {
    "title": "Section B: Integrated Case Studies",
    "questions": [
      {
        "type": "case",
        "case_narrative": "ABC Ltd is a manufacturing company. During the year, they purchased machinery for Rs 10 Lakhs. They also incurred installation costs of Rs 50,000. Due to a union strike, there was an idle time loss of Rs 20,000...",
        "content": "What is the total capitalizable cost of the machinery?",
        "options": ["Rs 10,00,000", "Rs 10,50,000", "Rs 10,70,000", "Rs 10,30,000"],
        "correct_option": 1,
        "explanation": "Purchase cost + installation. Idle time is ignored.",
        "marks": 2,
        "negative_marks": 0
      },
      {
        "type": "case",
        "content": "How should the Rs 20,000 idle time loss be treated in the financials?",
        "options": ["Capitalized", "Deferred", "Charged to P&L", "Ignored"],
        "correct_option": 2,
        "explanation": "Abnormal losses are P&L charged.",
        "marks": 2,
        "negative_marks": 0
      }
    ]
  }
]
```

### Auto-Grouping Logic:
If the system sees consecutive questions with `type: "case"`, it automatically assumes they belong to the SAME case study block. You only need to provide the `case_narrative` on the **first question** of the cluster!
