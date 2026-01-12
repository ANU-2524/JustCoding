const mongoose = require('mongoose');
require('dotenv').config();

const Challenge = require('../models/Challenge');

const sampleChallenges = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'easy',
    category: 'arrays',
    points: 100,
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, timeLimit: 2000 },
      { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false, timeLimit: 2000 },
      { input: '3 3\n6', expectedOutput: '0 1', isHidden: true, timeLimit: 2000 },
      { input: '1 5 3 7 2\n9', expectedOutput: '1 3', isHidden: true, timeLimit: 2000 }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Your code here
  // Return array of two indices
}

// Read input
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', line => lines.push(line));
rl.on('close', () => {
  const nums = lines[0].split(' ').map(Number);
  const target = parseInt(lines[1]);
  const result = twoSum(nums, target);
  console.log(result.join(' '));
});`,
      python: `def two_sum(nums, target):
    # Your code here
    # Return list of two indices
    pass

# Read input
nums = list(map(int, input().split()))
target = int(input())
result = two_sum(nums, target)
print(' '.join(map(str, result)))`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{0, 0};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] numsStr = sc.nextLine().split(" ");
        int[] nums = new int[numsStr.length];
        for (int i = 0; i < numsStr.length; i++) {
            nums[i] = Integer.parseInt(numsStr[i]);
        }
        int target = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {0, 0};
}

int main() {
    string line;
    getline(cin, line);
    stringstream ss(line);
    vector<int> nums;
    int n;
    while (ss >> n) nums.push_back(n);
    
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`
    },
    hints: [
      'Think about using a hash map to store values you\'ve seen',
      'For each number, check if target - number exists in the map'
    ],
    editorial: `## Solution

Use a hash map to store each number and its index as you iterate through the array.

For each number, check if \`target - num\` exists in the map. If it does, you've found your pair!

**Time Complexity:** O(n)
**Space Complexity:** O(n)

\`\`\`javascript
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}
\`\`\``,
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    examples: [
      { input: '2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: '3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' }
    ],
    tags: ['array', 'hash-table']
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    description: `Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: 'easy',
    category: 'strings',
    points: 100,
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isHidden: false, timeLimit: 2000 },
      { input: 'Hannah', expectedOutput: 'hannaH', isHidden: false, timeLimit: 2000 },
      { input: 'a', expectedOutput: 'a', isHidden: true, timeLimit: 2000 },
      { input: 'abcdefghij', expectedOutput: 'jihgfedcba', isHidden: true, timeLimit: 2000 }
    ],
    starterCode: {
      javascript: `function reverseString(s) {
  // Your code here - modify s in place
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', line => {
  const s = line.split('');
  reverseString(s);
  console.log(s.join(''));
  rl.close();
});`,
      python: `def reverse_string(s):
    # Your code here - modify s in place
    pass

s = list(input())
reverse_string(s)
print(''.join(s))`,
      java: `import java.util.*;

public class Main {
    public static void reverseString(char[] s) {
        // Your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        char[] s = sc.nextLine().toCharArray();
        reverseString(s);
        System.out.println(new String(s));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void reverseString(vector<char>& s) {
    // Your code here
}

int main() {
    string input;
    cin >> input;
    vector<char> s(input.begin(), input.end());
    reverseString(s);
    for (char c : s) cout << c;
    cout << endl;
    return 0;
}`
    },
    hints: ['Use two pointers - one at start, one at end', 'Swap characters and move pointers towards center'],
    editorial: `## Solution

Use two pointers approach - swap characters from both ends moving towards the center.

**Time Complexity:** O(n)
**Space Complexity:** O(1)`,
    constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character',
    examples: [
      { input: 'hello', output: 'olleh', explanation: 'Reverse of "hello" is "olleh"' }
    ],
    tags: ['string', 'two-pointers']
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'easy',
    category: 'strings',
    points: 100,
    testCases: [
      { input: '()', expectedOutput: 'true', isHidden: false, timeLimit: 2000 },
      { input: '()[]{}', expectedOutput: 'true', isHidden: false, timeLimit: 2000 },
      { input: '(]', expectedOutput: 'false', isHidden: false, timeLimit: 2000 },
      { input: '([)]', expectedOutput: 'false', isHidden: true, timeLimit: 2000 },
      { input: '{[]}', expectedOutput: 'true', isHidden: true, timeLimit: 2000 }
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Your code here
  // Return true or false
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', line => {
  console.log(isValid(line) ? 'true' : 'false');
  rl.close();
});`,
      python: `def is_valid(s):
    # Your code here
    pass

s = input()
print('true' if is_valid(s) else 'false')`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(isValid(s) ? "true" : "false");
    }
}`,
      cpp: `#include <iostream>
#include <stack>
using namespace std;

bool isValid(string s) {
    // Your code here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}`
    },
    hints: ['Use a stack data structure', 'Push opening brackets, pop for closing brackets'],
    editorial: `## Solution

Use a stack to track opening brackets. When you see a closing bracket, check if it matches the top of the stack.`,
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only',
    examples: [
      { input: '()', output: 'true', explanation: 'Single pair of matching parentheses' },
      { input: '([)]', output: 'false', explanation: 'Brackets are not closed in correct order' }
    ],
    tags: ['string', 'stack']
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    difficulty: 'medium',
    category: 'arrays',
    points: 200,
    testCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false, timeLimit: 2000 },
      { input: '1', expectedOutput: '1', isHidden: false, timeLimit: 2000 },
      { input: '5 4 -1 7 8', expectedOutput: '23', isHidden: true, timeLimit: 2000 },
      { input: '-1 -2 -3 -4', expectedOutput: '-1', isHidden: true, timeLimit: 2000 }
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  // Your code here
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', line => {
  const nums = line.split(' ').map(Number);
  console.log(maxSubArray(nums));
  rl.close();
});`,
      python: `def max_sub_array(nums):
    # Your code here
    pass

nums = list(map(int, input().split()))
print(max_sub_array(nums))`,
      java: `import java.util.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().split(" ");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i]);
        }
        System.out.println(maxSubArray(nums));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your code here
    return 0;
}

int main() {
    string line;
    getline(cin, line);
    stringstream ss(line);
    vector<int> nums;
    int n;
    while (ss >> n) nums.push_back(n);
    cout << maxSubArray(nums) << endl;
    return 0;
}`
    },
    hints: ['Think about Kadane\'s algorithm', 'Track current sum and max sum as you iterate'],
    editorial: `## Solution - Kadane's Algorithm

Keep track of the maximum sum ending at each position. Reset to current element if sum becomes negative.`,
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    examples: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6' }
    ],
    tags: ['array', 'dynamic-programming', 'divide-and-conquer']
  },
  {
    title: 'Fibonacci Number',
    slug: 'fibonacci-number',
    description: `The Fibonacci numbers form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1.

Given n, calculate F(n).`,
    difficulty: 'easy',
    category: 'dp',
    points: 100,
    testCases: [
      { input: '2', expectedOutput: '1', isHidden: false, timeLimit: 2000 },
      { input: '3', expectedOutput: '2', isHidden: false, timeLimit: 2000 },
      { input: '4', expectedOutput: '3', isHidden: false, timeLimit: 2000 },
      { input: '10', expectedOutput: '55', isHidden: true, timeLimit: 2000 },
      { input: '20', expectedOutput: '6765', isHidden: true, timeLimit: 2000 }
    ],
    starterCode: {
      javascript: `function fib(n) {
  // Your code here
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', line => {
  console.log(fib(parseInt(line)));
  rl.close();
});`,
      python: `def fib(n):
    # Your code here
    pass

n = int(input())
print(fib(n))`,
      java: `import java.util.*;

public class Main {
    public static int fib(int n) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(fib(n));
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int fib(int n) {
    // Your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << fib(n) << endl;
    return 0;
}`
    },
    hints: ['Can be solved with recursion, but DP is more efficient', 'Only need to track last two values'],
    editorial: `## Solution

Use iterative approach with O(1) space by only tracking the last two Fibonacci numbers.`,
    constraints: '0 <= n <= 30',
    examples: [
      { input: '4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3' }
    ],
    tags: ['math', 'dynamic-programming', 'recursion']
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-sorted-lists',
    description: `You are given two sorted arrays nums1 and nums2. Merge them into a single sorted array and return it.`,
    difficulty: 'easy',
    category: 'sorting',
    points: 100,
    testCases: [
      { input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4', isHidden: false, timeLimit: 2000 },
      { input: '\n0', expectedOutput: '0', isHidden: false, timeLimit: 2000 },
      { input: '1\n', expectedOutput: '1', isHidden: true, timeLimit: 2000 },
      { input: '1 3 5 7\n2 4 6 8', expectedOutput: '1 2 3 4 5 6 7 8', isHidden: true, timeLimit: 2000 }
    ],
    starterCode: {
      javascript: `function mergeSorted(nums1, nums2) {
  // Your code here
  // Return merged sorted array
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', line => lines.push(line));
rl.on('close', () => {
  const nums1 = lines[0] ? lines[0].split(' ').map(Number) : [];
  const nums2 = lines[1] ? lines[1].split(' ').map(Number) : [];
  const result = mergeSorted(nums1, nums2);
  console.log(result.join(' '));
});`,
      python: `def merge_sorted(nums1, nums2):
    # Your code here
    pass

nums1 = list(map(int, input().split())) if input else []
nums2 = list(map(int, input().split())) if input else []
result = merge_sorted(nums1, nums2)
print(' '.join(map(str, result)))`,
      java: `import java.util.*;

public class Main {
    public static int[] mergeSorted(int[] nums1, int[] nums2) {
        // Your code here
        return new int[0];
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line1 = sc.nextLine();
        String line2 = sc.nextLine();
        
        int[] nums1 = line1.isEmpty() ? new int[0] : Arrays.stream(line1.split(" ")).mapToInt(Integer::parseInt).toArray();
        int[] nums2 = line2.isEmpty() ? new int[0] : Arrays.stream(line2.split(" ")).mapToInt(Integer::parseInt).toArray();
        
        int[] result = mergeSorted(nums1, nums2);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb);
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> mergeSorted(vector<int>& nums1, vector<int>& nums2) {
    // Your code here
    return {};
}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    
    vector<int> nums1, nums2;
    stringstream ss1(line1), ss2(line2);
    int n;
    while (ss1 >> n) nums1.push_back(n);
    while (ss2 >> n) nums2.push_back(n);
    
    vector<int> result = mergeSorted(nums1, nums2);
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
    },
    hints: ['Use two pointers, one for each array', 'Compare elements and add smaller one to result'],
    editorial: `## Solution

Use two pointers to compare elements from both arrays and build the merged result.`,
    constraints: '0 <= nums1.length, nums2.length <= 50\n-100 <= nums1[i], nums2[i] <= 100',
    examples: [
      { input: '1 2 4\n1 3 4', output: '1 1 2 3 4 4', explanation: 'Merge two sorted arrays' }
    ],
    tags: ['array', 'two-pointers', 'sorting']
  }
];

async function seedChallenges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/justcoding');
    console.log('Connected to MongoDB');

    // Clear existing challenges
    await Challenge.deleteMany({});
    console.log('Cleared existing challenges');

    // Insert sample challenges
    await Challenge.insertMany(sampleChallenges);
    console.log(`Inserted ${sampleChallenges.length} challenges`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedChallenges();
