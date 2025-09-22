"use client";

import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

const sampleMarkdown = `# BPSC STET 2025 Computer Science Complete Course Guide

## 🎯 Course Overview

Welcome to the most comprehensive preparation guide for **BPSC STET 2025 Computer Science**! This course is meticulously designed to help aspiring teachers crack the State Teacher Eligibility Test with confidence and excellence.

### 📊 Exam Pattern
- **Paper II (Subject Specific)**: Computer Science - 100 Marks
- **Art of Teaching**: 30 Marks  
- **Other Skills**: 20 Marks
- **Total**: 150 Marks

---

## 📚 Complete Syllabus Breakdown

### 🔧 **Unit 1: Digital Logic** (Foundation Level)
**What You'll Master:**
- Number systems (Binary, Octal, Hexadecimal) and conversions
- Code representations (BCD, ASCII, EBCDIC, Gray codes)
- Boolean algebra and logic gates
- Combinational circuits (Adders, Multiplexers, Encoders)
- Sequential circuits (Flip-flops, Registers, Counters)
- Memory systems (RAM, ROM, EPROM)
- A/D and D/A conversion techniques

**Why It Matters:** Digital logic forms the foundation of all computer systems. Master this to understand how computers process information at the hardware level.

---

### 🏗️ **Unit 2: Computer Organization and Architecture** (Core Level)
**What You'll Master:**
- Data representation and number systems
- Binary arithmetic operations
- Error detection and correction codes
- Microprocessor and microcontroller concepts
- CPU architecture (Address bus, Data bus, Control bus)
- Memory hierarchy and types
- Logic gates and universal gates
- K-Map simplifications and ALU design

**Why It Matters:** Understanding computer architecture is crucial for teaching how computers execute instructions and manage resources.

### 💾 **Unit 3: Programming and Data Structures** (Advanced Level)
**What You'll Master:**
- Data types and abstract data types
- Algorithm design and analysis
- Arrays and their applications
- Recursion and backtracking
- Linked lists (Singly, Doubly, Circular)
- Stacks and queues implementation
- Searching algorithms (Linear, Binary, Hashing)
- Sorting algorithms (Bubble, Selection, Merge, Heap)
- Trees and graphs
- Advanced trees (AVL, B-trees)

**Code Example:**
\`\`\`javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`

> **Important Note:** Data structures are the backbone of efficient programming and problem-solving.

### 🎯 **Success Strategy:**
1. **Daily Study Plan**: Structured 2-3 hours daily study schedule
2. **Weekly Assessments**: Regular testing and feedback
3. **Doubt Resolution**: Clear explanations for complex concepts
4. **Revision Cycles**: Multiple revision rounds before exam
5. **Mock Tests**: Full-length practice tests

For more information, visit [our website](https://example.com) or check out this ![sample image](https://via.placeholder.com/150x100).

---

*Start your preparation today and join thousands of successful STET candidates!*`;

export default function MarkdownTestComponent() {
  const [content, setContent] = useState('');

  const loadSampleMarkdown = () => {
    setContent(sampleMarkdown);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-blue-800 mb-2">Markdown Editor Test</h2>
        <p className="text-blue-700 mb-4">
          Test the markdown functionality by clicking the button below to load sample markdown content, 
          or paste your own markdown content into the editor.
        </p>
        <button
          onClick={loadSampleMarkdown}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Load Sample Markdown Content
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Click "Load Sample Markdown Content" to see markdown in action</li>
          <li>When markdown is detected, you'll see a "Markdown detected" badge</li>
          <li>Click "Convert MD" to convert the markdown to formatted HTML</li>
          <li>Use "Raw MD" mode to edit markdown directly</li>
          <li>Use "Markdown" mode to see the rendered markdown preview</li>
          <li>Use "Preview" mode to see the final HTML output</li>
        </ol>
      </div>

      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Paste your markdown content here or click the button above to load sample content..."
      />

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Current Content Preview:</h3>
        <div className="bg-white border rounded p-3 max-h-40 overflow-y-auto">
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
            {content || 'No content yet...'}
          </pre>
        </div>
      </div>
    </div>
  );
}