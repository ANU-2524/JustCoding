const mongoose = require('mongoose');
const { Tutorial } = require('../models/Tutorial');
require('dotenv').config();

const sampleTutorials = [
  {
    title: "JavaScript Fundamentals",
    slug: "javascript-fundamentals",
    description: "Master the core concepts of JavaScript programming including variables, functions, objects, and control flow.",
    shortDescription: "Learn JavaScript basics from scratch",
    difficulty: "beginner",
    category: "fundamentals",
    language: "javascript",
    tags: ["variables", "functions", "objects", "basics"],
    estimatedDuration: 120,
    prerequisites: [],
    learningObjectives: [
      "Understand JavaScript syntax and structure",
      "Work with variables and data types",
      "Create and use functions",
      "Manipulate objects and arrays"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Introduction to JavaScript",
        content: "JavaScript is a versatile programming language that runs in web browsers and on servers. It's the foundation of modern web development.",
        codeExample: {
          code: `// Your first JavaScript code
console.log("Hello, World!");

// Variables
let message = "Welcome to JavaScript";
console.log(message);`,
          language: "javascript",
          explanation: "This code demonstrates basic JavaScript syntax for output and variables."
        }
      },
      {
        stepNumber: 2,
        title: "Variables and Data Types",
        content: "Learn about different types of data you can store and manipulate in JavaScript.",
        codeExample: {
          code: `// Numbers
let age = 25;
let price = 99.99;

// Strings
let name = "Alice";
let greeting = \`Hello, \${name}!\`;

// Booleans
let isActive = true;
let isComplete = false;

// Arrays
let colors = ["red", "green", "blue"];

// Objects
let person = {
  name: "Bob",
  age: 30,
  city: "New York"
};`,
          language: "javascript",
          explanation: "JavaScript supports various data types including numbers, strings, booleans, arrays, and objects."
        },
        interactive: {
          enabled: true,
          prompt: "Create a variable called 'favoriteColor' and assign it your favorite color as a string.",
          starterCode: "// Create your variable here\n",
          solution: "let favoriteColor = \"blue\"; // or any color",
          hints: ["Use the 'let' keyword", "Remember to use quotes for strings"]
        }
      },
      {
        stepNumber: 3,
        title: "Functions",
        content: "Functions are reusable blocks of code that perform specific tasks.",
        codeExample: {
          code: `// Function declaration
function greet(name) {
  return "Hello, " + name + "!";
}

// Function expression
const add = function(a, b) {
  return a + b;
};

// Arrow function
const multiply = (x, y) => x * y;

// Using functions
console.log(greet("Alice"));
console.log(add(5, 3));
console.log(multiply(4, 7));`,
          language: "javascript",
          explanation: "Functions can be declared in multiple ways and help organize your code."
        },
        quiz: {
          enabled: true,
          question: "What will this code output: console.log(add(10, 5));",
          options: ["10", "5", "15", "Error"],
          correctAnswer: 2,
          explanation: "The add function returns the sum of its two parameters: 10 + 5 = 15"
        }
      }
    ],
    relatedChallenges: [],
    nextTutorials: [],
    isFeatured: true,
    author: "JustCoding Team"
  },
  {
    title: "Python for Beginners",
    slug: "python-for-beginners",
    description: "Start your programming journey with Python, one of the most beginner-friendly programming languages.",
    shortDescription: "Get started with Python programming",
    difficulty: "beginner",
    category: "fundamentals",
    language: "python",
    tags: ["python", "basics", "programming", "syntax"],
    estimatedDuration: 90,
    prerequisites: [],
    learningObjectives: [
      "Understand Python syntax",
      "Work with variables and basic data types",
      "Use Python's built-in functions",
      "Write simple programs"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Python Basics",
        content: "Python is known for its simple, readable syntax that makes it perfect for beginners.",
        codeExample: {
          code: `# Your first Python program
print("Hello, World!")

# Variables (no declaration needed)
name = "Python"
version = 3.9
is_awesome = True

print(f"Welcome to {name} {version}!")`,
          language: "python",
          explanation: "Python uses simple syntax with no semicolons or curly braces required."
        }
      },
      {
        stepNumber: 2,
        title: "Data Types and Operations",
        content: "Explore Python's built-in data types and operations.",
        codeExample: {
          code: `# Numbers
age = 25
height = 5.8

# Strings
first_name = "John"
last_name = "Doe"
full_name = first_name + " " + last_name

# Lists (like arrays)
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]

# Dictionaries (like objects)
person = {
    "name": "Alice",
    "age": 30,
    "city": "Boston"
}

print(f"Person: {person['name']}, Age: {person['age']}")`,
          language: "python",
          explanation: "Python's data types are similar to other languages but with cleaner syntax."
        }
      }
    ],
    isFeatured: true,
    author: "JustCoding Team"
  },
  {
    title: "React Hooks Deep Dive",
    slug: "react-hooks-deep-dive",
    description: "Master React Hooks including useState, useEffect, useContext, and custom hooks for modern React development.",
    shortDescription: "Advanced React Hooks concepts",
    difficulty: "advanced",
    category: "frontend",
    language: "react",
    tags: ["react", "hooks", "useState", "useEffect", "frontend"],
    estimatedDuration: 180,
    prerequisites: [],
    learningObjectives: [
      "Master built-in React Hooks",
      "Create custom hooks",
      "Understand hook patterns and best practices",
      "Optimize React components with hooks"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "useState Hook",
        content: "The useState hook allows you to add state to functional components.",
        codeExample: {
          code: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <p>Hello, {name}!</p>
    </div>
  );
}`,
          language: "javascript",
          explanation: "useState returns an array with the current state value and a setter function."
        }
      },
      {
        stepNumber: 2,
        title: "useEffect Hook",
        content: "useEffect handles side effects in functional components.",
        codeExample: {
          code: `import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Effect runs after render
    async function fetchUser() {
      setLoading(true);
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]); // Dependency array

  // Cleanup effect
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Polling...');
    }, 5000);

    return () => clearInterval(timer); // Cleanup
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`,
          language: "javascript",
          explanation: "useEffect handles mounting, updating, and unmounting lifecycle events."
        }
      }
    ],
    isFeatured: false,
    author: "JustCoding Team"
  },
  {
    title: "Data Structures: Arrays and Lists",
    slug: "data-structures-arrays-lists",
    description: "Understanding arrays and lists - the fundamental data structures used in programming.",
    shortDescription: "Learn arrays and lists fundamentals",
    difficulty: "intermediate",
    category: "data-structures",
    language: "general",
    tags: ["arrays", "lists", "data-structures", "algorithms"],
    estimatedDuration: 150,
    prerequisites: [],
    learningObjectives: [
      "Understand array and list concepts",
      "Learn common operations on arrays",
      "Analyze time complexity",
      "Implement basic algorithms"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "What are Arrays?",
        content: "Arrays are collections of elements stored in contiguous memory locations, accessible by index.",
        codeExample: {
          code: `// JavaScript Array Examples
let numbers = [1, 2, 3, 4, 5];
let fruits = ["apple", "banana", "cherry"];

// Accessing elements (0-indexed)
console.log(numbers[0]); // 1
console.log(fruits[1]);  // "banana"

// Array properties
console.log(numbers.length); // 5

// Common operations
numbers.push(6);        // Add to end
numbers.unshift(0);     // Add to beginning
let last = numbers.pop(); // Remove from end
let first = numbers.shift(); // Remove from beginning

console.log(numbers); // [1, 2, 3, 4, 5]`,
          language: "javascript",
          explanation: "Arrays provide fast access to elements but may be slower for insertions/deletions."
        }
      },
      {
        stepNumber: 2,
        title: "Array vs List Performance",
        content: "Understanding the performance characteristics of different operations.",
        codeExample: {
          code: `// Time Complexity Examples

// Access by index: O(1) - Constant time
function getElement(arr, index) {
  return arr[index]; // Always takes same time
}

// Search for element: O(n) - Linear time
function findElement(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found at index i
    }
  }
  return -1; // Not found
}

// Insert at beginning: O(n) - All elements shift
function insertAtBeginning(arr, element) {
  arr.unshift(element); // Shifts all existing elements
}

// Insert at end: O(1) - Amortized constant time
function insertAtEnd(arr, element) {
  arr.push(element); // Just add to end
}`,
          language: "javascript",
          explanation: "Different operations have different time complexities based on how much data needs to be moved."
        }
      }
    ],
    isFeatured: false,
    author: "JustCoding Team"
  },
  {
    title: "Web Development Fundamentals",
    slug: "web-development-fundamentals",
    description: "Learn the basics of web development including HTML, CSS, and JavaScript working together.",
    shortDescription: "Complete web development basics",
    difficulty: "beginner",
    category: "web-development",
    language: "general",
    tags: ["html", "css", "javascript", "web", "frontend"],
    estimatedDuration: 200,
    prerequisites: [],
    learningObjectives: [
      "Understand how web technologies work together",
      "Create structured content with HTML",
      "Style web pages with CSS",
      "Add interactivity with JavaScript"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "HTML Structure",
        content: "HTML provides the structure and content of web pages using semantic markup.",
        codeExample: {
          code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the main content area.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
</html>`,
          language: "html",
          explanation: "HTML uses semantic tags to create meaningful structure for both browsers and search engines."
        }
      },
      {
        stepNumber: 2,
        title: "CSS Styling",
        content: "CSS controls the visual presentation and layout of HTML elements.",
        codeExample: {
          code: `/* Basic CSS styling */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: #2c3e50;
    color: white;
    padding: 1rem 0;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
}

nav li {
    margin: 0 1rem;
}

nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background 0.3s;
}

nav a:hover {
    background: #34495e;
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.button {
    background: #3498db;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.button:hover {
    background: #2980b9;
}`,
          language: "css",
          explanation: "CSS uses selectors to target HTML elements and apply styling rules."
        }
      }
    ],
    isFeatured: true,
    author: "JustCoding Team"
  }
];

async function seedTutorials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/justcoding', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing tutorials
    await Tutorial.deleteMany({});
    console.log('Cleared existing tutorials');

    // Insert new tutorials
    await Tutorial.insertMany(sampleTutorials);
    console.log(`Inserted ${sampleTutorials.length} tutorials`);

    console.log('Tutorial seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tutorials:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedTutorials();
}

module.exports = seedTutorials;