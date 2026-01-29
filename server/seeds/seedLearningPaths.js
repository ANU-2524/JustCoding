const mongoose = require('mongoose');
const { Tutorial } = require('../models/Tutorial');
require('dotenv').config();

const seedDemoTutorials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/justcoding');
    
    // Clear existing tutorials
    await Tutorial.deleteMany({});
    console.log('Cleared existing tutorials');

    const demoTutorials = [
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
          "Create and use functions"
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Introduction to JavaScript",
            content: "JavaScript is a versatile programming language that runs in web browsers and servers.",
            codeExample: {
              code: `console.log("Hello, World!");
let message = "Welcome to JavaScript";
console.log(message);`,
              language: "javascript",
              explanation: "This demonstrates basic JavaScript syntax for output and variables."
            }
          },
          {
            stepNumber: 2,
            title: "Variables and Data Types",
            content: "Learn about different types of data you can store in JavaScript.",
            codeExample: {
              code: `let age = 25;
let name = "Alice";
let isActive = true;
let colors = ["red", "green", "blue"];`,
              language: "javascript",
              explanation: "JavaScript supports numbers, strings, booleans, arrays, and objects."
            }
          },
          {
            stepNumber: 3,
            title: "Functions",
            content: "Functions are reusable blocks of code that perform specific tasks.",
            codeExample: {
              code: `function greet(name) {
  return "Hello, " + name;
}

console.log(greet("World"));`,
              language: "javascript",
              explanation: "Functions help organize and reuse code."
            }
          }
        ],
        author: "JustCoding Team",
        completionCount: 245,
        rating: 4.8,
        ratingCount: 89,
        isPublished: true,
        isFeatured: true
      },
      {
        title: "Python Basics",
        slug: "python-basics",
        description: "Learn Python programming from the ground up. Perfect for beginners looking to start their coding journey.",
        shortDescription: "Start learning Python programming",
        difficulty: "beginner",
        category: "fundamentals",
        language: "python",
        tags: ["python", "basics", "variables", "functions"],
        estimatedDuration: 150,
        prerequisites: [],
        learningObjectives: [
          "Understand Python syntax",
          "Work with data types and structures",
          "Write simple Python programs"
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Getting Started with Python",
            content: "Python is known for its simple and readable syntax. Let's write your first Python program.",
            codeExample: {
              code: `print("Hello, Python!")
name = "Alice"
print(f"Welcome, {name}!")`,
              language: "python",
              explanation: "Python makes it easy to print output and work with strings."
            }
          },
          {
            stepNumber: 2,
            title: "Lists and Dictionaries",
            content: "Python provides powerful data structures for organizing data.",
            codeExample: {
              code: `# Lists
colors = ["red", "green", "blue"]
print(colors[0])

# Dictionaries
person = {"name": "Bob", "age": 30}
print(person["name"])`,
              language: "python",
              explanation: "Lists and dictionaries are fundamental Python data structures."
            }
          },
          {
            stepNumber: 3,
            title: "Loops and Conditions",
            content: "Control flow is essential for writing dynamic programs.",
            codeExample: {
              code: `for i in range(5):
    print(i)

if age >= 18:
    print("You are an adult")
else:
    print("You are a minor")`,
              language: "python",
              explanation: "Loops and conditions let you create flexible programs."
            }
          }
        ],
        author: "JustCoding Team",
        completionCount: 198,
        rating: 4.7,
        ratingCount: 72,
        isPublished: true,
        isFeatured: true
      },
      {
        title: "React Essentials",
        slug: "react-essentials",
        description: "Learn React, the popular JavaScript library for building interactive user interfaces with components.",
        shortDescription: "Master React component development",
        difficulty: "intermediate",
        category: "frontend",
        language: "react",
        tags: ["react", "components", "hooks", "jsx"],
        estimatedDuration: 180,
        prerequisites: [],
        learningObjectives: [
          "Build React components",
          "Understand JSX syntax",
          "Work with React Hooks",
          "Manage component state"
        ],
        steps: [
          {
            stepNumber: 1,
            title: "React Components",
            content: "Components are the building blocks of React applications.",
            codeExample: {
              code: `function Welcome() {
  return <h1>Hello, React!</h1>;
}

export default Welcome;`,
              language: "javascript",
              explanation: "Functional components are simple and powerful."
            }
          },
          {
            stepNumber: 2,
            title: "Using Hooks",
            content: "Hooks let you use state and other React features in functional components.",
            codeExample: {
              code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
              language: "javascript",
              explanation: "useState is the most common React hook."
            }
          },
          {
            stepNumber: 3,
            title: "Component Props",
            content: "Props allow you to pass data between components.",
            codeExample: {
              code: `function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

<Greeting name="Alice" />`,
              language: "javascript",
              explanation: "Props make components reusable and flexible."
            }
          }
        ],
        author: "JustCoding Team",
        completionCount: 312,
        rating: 4.9,
        ratingCount: 156,
        isPublished: true,
        isFeatured: true
      },
      {
        title: "Web Development Fundamentals",
        slug: "web-development-fundamentals",
        description: "Comprehensive guide to HTML, CSS, and JavaScript for building modern websites.",
        shortDescription: "Learn HTML, CSS, and JavaScript",
        difficulty: "beginner",
        category: "web-development",
        language: "general",
        tags: ["html", "css", "web", "frontend"],
        estimatedDuration: 200,
        prerequisites: [],
        learningObjectives: [
          "Build HTML pages",
          "Style with CSS",
          "Add interactivity with JavaScript"
        ],
        steps: [
          {
            stepNumber: 1,
            title: "HTML Structure",
            content: "HTML provides the structure for web pages.",
            codeExample: {
              code: `<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>This is my first webpage</p>
  </body>
</html>`,
              language: "html",
              explanation: "Every HTML page has this basic structure."
            }
          }
        ],
        author: "JustCoding Team",
        completionCount: 156,
        rating: 4.6,
        ratingCount: 64,
        isPublished: true,
        isFeatured: false
      },
      {
        title: "Data Structures Essentials",
        slug: "data-structures-essentials",
        description: "Master fundamental data structures like arrays, linked lists, stacks, and queues.",
        shortDescription: "Learn essential data structures",
        difficulty: "intermediate",
        category: "data-structures",
        language: "python",
        tags: ["data-structures", "arrays", "linked-lists", "algorithms"],
        estimatedDuration: 240,
        prerequisites: [],
        learningObjectives: [
          "Understand arrays and lists",
          "Work with stacks and queues",
          "Implement linked lists",
          "Analyze time complexity"
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Introduction to Data Structures",
            content: "Data structures organize data efficiently for different operations.",
            codeExample: {
              code: `# Arrays and Lists
arr = [1, 2, 3, 4, 5]
arr.append(6)
print(arr)`,
              language: "python",
              explanation: "Lists are the most basic data structure."
            }
          }
        ],
        author: "JustCoding Team",
        completionCount: 89,
        rating: 4.7,
        ratingCount: 41,
        isPublished: true,
        isFeatured: false
      }
    ];

    // Insert tutorials
    const insertedTutorials = await Tutorial.insertMany(demoTutorials);
    console.log(`✅ Seeded ${insertedTutorials.length} demo tutorials`);

    // Add nextTutorials references (create learning paths)
    const tutorialsMap = {};
    insertedTutorials.forEach(t => {
      tutorialsMap[t.slug] = t._id;
    });

    // Update tutorials to create paths
    await Tutorial.findByIdAndUpdate(
      tutorialsMap['javascript-fundamentals'],
      { nextTutorials: [tutorialsMap['react-essentials']] }
    );

    await Tutorial.findByIdAndUpdate(
      tutorialsMap['python-basics'],
      { nextTutorials: [tutorialsMap['data-structures-essentials']] }
    );

    console.log('✅ Created learning paths');
    console.log('\nDemo tutorials have been seeded successfully!');
    console.log('Learning Paths:');
    console.log('1. JavaScript → React');
    console.log('2. Python → Data Structures');
    console.log('3. Web Development (Standalone)');
    console.log('4. Data Structures (Standalone)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tutorials:', error);
    process.exit(1);
  }
};

seedDemoTutorials();
