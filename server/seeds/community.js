const { Post, Comment } = require('../models/Community');

const communitySeeds = [
  {
    title: "How to optimize React performance in large applications?",
    content: "I've been working on a React app that's getting quite large, and I'm noticing performance issues. What are the best practices for optimizing React performance? I've heard about memoization, code splitting, and virtualization. Can someone share their experiences and specific techniques that have worked well?",
    category: "help-request",
    tags: ["react", "performance", "optimization"],
    author: "dev_user_1",
    authorName: "Alex Chen",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    codeSnippets: [
      {
        language: "javascript",
        code: "const MemoizedComponent = React.memo(MyComponent);",
        description: "Using React.memo for component memoization"
      }
    ]
  },
  {
    title: "Showcase: My Full-Stack E-commerce Platform",
    content: "After 6 months of development, I'm excited to share my e-commerce platform built with the MERN stack! The project includes user authentication, product management, shopping cart, payment integration with Stripe, and an admin dashboard. I'd love to get feedback on the architecture and any suggestions for improvements.",
    category: "project-showcase",
    tags: ["mern", "ecommerce", "fullstack", "mongodb"],
    author: "dev_user_2",
    authorName: "Sarah Johnson",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    codeSnippets: [
      {
        language: "javascript",
        code: "const productSchema = new mongoose.Schema({\n  name: String,\n  price: Number,\n  category: String,\n  stock: Number\n});",
        description: "Product schema using Mongoose"
      }
    ]
  },
  {
    title: "Code Review: Authentication middleware implementation",
    content: "I've implemented authentication middleware for my Node.js API. Could someone review this code and suggest improvements? I'm particularly concerned about security best practices and error handling.",
    category: "code-review",
    tags: ["nodejs", "authentication", "security", "middleware"],
    author: "dev_user_3",
    authorName: "Mike Rodriguez",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    codeSnippets: [
      {
        language: "javascript",
        code: "const authenticateToken = (req, res, next) => {\n  const token = req.header('Authorization')?.replace('Bearer ', '');\n  \n  if (!token) {\n    return res.status(401).json({ error: 'Access denied' });\n  }\n  \n  try {\n    const verified = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = verified;\n    next();\n  } catch (error) {\n    res.status(400).json({ error: 'Invalid token' });\n  }\n};",
        description: "JWT authentication middleware"
      }
    ]
  },
  {
    title: "Career Advice: From Bootcamp to Senior Developer",
    content: "I graduated from a coding bootcamp 2 years ago and I'm now a mid-level developer. What should I focus on to reach senior level? Should I pursue certifications, build side projects, or focus on soft skills? Any advice from experienced developers would be greatly appreciated!",
    category: "career-advice",
    tags: ["career", "senior-developer", "growth", "advice"],
    author: "dev_user_4",
    authorName: "Emma Wilson",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma"
  },
  {
    title: "Learning Resources: Best courses for system design",
    content: "I'm preparing for system design interviews and looking for high-quality learning resources. I've already done some basic courses, but I want something more comprehensive. What would you recommend for someone with 3-4 years of experience?",
    category: "learning-resources",
    tags: ["system-design", "interview-prep", "courses", "architecture"],
    author: "dev_user_5",
    authorName: "David Kim",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=david"
  },
  {
    title: "Bug Report: Code execution timeout in piston API",
    content: "I've noticed that some code submissions are timing out when using the piston API for code execution. This seems to happen particularly with recursive functions or complex algorithms. Has anyone else experienced this issue? Is there a way to increase the timeout or optimize the code execution?",
    category: "bug-reports",
    tags: ["bug", "piston-api", "timeout", "code-execution"],
    author: "dev_user_6",
    authorName: "Lisa Zhang",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa"
  },
  {
    title: "Feature Request: Dark mode for code editor",
    content: "It would be great to have a dark mode option for the code editor. Many developers prefer dark themes as they reduce eye strain during long coding sessions. This would make the platform more accessible and user-friendly.",
    category: "feature-requests",
    tags: ["dark-mode", "ui", "accessibility", "code-editor"],
    author: "dev_user_7",
    authorName: "Tom Anderson",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom"
  },
  {
    title: "General Discussion: The future of JavaScript frameworks",
    content: "With the rise of new frameworks and the evolution of React, Vue, and Angular, what do you think the JavaScript ecosystem will look like in 5 years? Will we see more consolidation or continued fragmentation? How do you see server-side rendering and static site generation evolving?",
    category: "general-discussion",
    tags: ["javascript", "frameworks", "future", "ecosystem"],
    author: "dev_user_8",
    authorName: "Rachel Green",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=rachel"
  },
  {
    title: "Announcements: New contest categories coming soon!",
    content: "We're excited to announce that we'll be adding new contest categories in the coming weeks! This includes specialized categories for different programming languages, difficulty levels, and themes. We'll also be introducing team-based contests and hackathon-style events. Stay tuned for more details!",
    category: "announcements",
    tags: ["announcement", "contests", "new-features", "updates"],
    author: "admin",
    authorName: "JustCoding Team",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    isPinned: true
  },
  {
    title: "Off Topic: Favorite coding memes",
    content: "Let's take a break from serious coding discussions and share some of our favorite coding memes! What's the funniest coding-related meme you've seen recently? Bonus points for original content!",
    category: "off-topic",
    tags: ["memes", "fun", "humor", "community"],
    author: "dev_user_9",
    authorName: "Chris Taylor",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=chris"
  }
];

const commentSeeds = [
  {
    postId: null, // Will be set after posts are created
    content: "Great question! For React performance, I recommend starting with React.memo for component memoization, useMemo and useCallback for expensive computations, and code splitting with React.lazy. Also, consider using virtualization libraries like react-window for large lists.",
    author: "dev_user_10",
    authorName: "Jessica Martinez",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica"
  },
  {
    postId: null,
    content: "Your e-commerce project looks impressive! The architecture seems solid. One suggestion: consider implementing Redis for session management and caching frequently accessed products to improve performance.",
    author: "dev_user_11",
    authorName: "Robert Lee",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert"
  },
  {
    postId: null,
    content: "Your auth middleware looks good, but I noticed you're not handling token expiration properly. Consider adding a refresh token mechanism for better security.",
    author: "dev_user_12",
    authorName: "Anna Davis",
    authorPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=anna"
  }
];

async function seedCommunity() {
  try {
    console.log('🌱 Seeding community data...');

    // Clear existing data
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // Insert posts
    const insertedPosts = await Post.insertMany(communitySeeds);
    console.log(`✅ Inserted ${insertedPosts.length} posts`);

    // Add some sample comments to the first few posts
    const sampleComments = commentSeeds.map((comment, index) => ({
      ...comment,
      postId: insertedPosts[index % insertedPosts.length]._id
    }));

    const insertedComments = await Comment.insertMany(sampleComments);
    console.log(`✅ Inserted ${insertedComments.length} comments`);

    // Update post comment counts
    for (const post of insertedPosts) {
      const commentCount = await Comment.countDocuments({ postId: post._id });
      await Post.findByIdAndUpdate(post._id, { commentCount });
    }

    // Add some upvotes to make posts more realistic
    const postsToUpvote = insertedPosts.slice(0, 5);
    for (const post of postsToUpvote) {
      const upvotes = Math.floor(Math.random() * 20) + 1;
      await Post.findByIdAndUpdate(post._id, {
        upvotes,
        score: upvotes - Math.floor(Math.random() * 5)
      });
    }

    console.log('🎉 Community seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding community data:', error);
  }
}

module.exports = seedCommunity;

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/database');

  connectDB().then(() => {
    seedCommunity().then(() => {
      process.exit(0);
    });
  });
}