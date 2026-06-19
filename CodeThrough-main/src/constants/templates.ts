import type { AlgorithmTemplate } from '../types';

export const templates: AlgorithmTemplate[] = [
  {
    name: 'Bubble Sort',
    category: 'Sorting',
    description: 'Repeatedly swap adjacent elements if they are in the wrong order',
    code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

let nums = [5, 2, 8, 3, 1];
bubbleSort(nums);
`,
  },
  {
    name: 'Insertion Sort',
    category: 'Sorting',
    description: 'Build sorted array one element at a time by inserting into correct position',
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

let nums = [12, 11, 13, 5, 6];
insertionSort(nums);
`,
  },
  {
    name: 'Quick Sort',
    category: 'Sorting',
    description: 'Divide and conquer using a pivot element to partition the array',
    code: `function quickSort(arr, low, high) {
  if (low < high) {
    let pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    let pi = i + 1;
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

let nums = [10, 7, 8, 9, 1, 5];
quickSort(nums, 0, nums.length - 1);
`,
  },
  {
    name: 'Merge Sort',
    category: 'Sorting',
    description: 'Divide array in halves, sort each, then merge sorted halves',
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  let mid = Math.floor(arr.length / 2);
  let left = mergeSort(arr.slice(0, mid));
  let right = mergeSort(arr.slice(mid));
  let result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  while (i < left.length) {
    result.push(left[i]);
    i++;
  }
  while (j < right.length) {
    result.push(right[j]);
    j++;
  }
  return result;
}

let sorted = mergeSort([38, 27, 43, 3, 9, 82, 10]);
console.log(sorted);
`,
  },
  {
    name: 'Binary Search',
    category: 'Searching',
    description: 'Search a sorted array by repeatedly dividing the search interval in half',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      console.log("Found at index " + mid);
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  console.log("Not found");
  return -1;
}

let nums = [1, 3, 5, 7, 9, 11, 13, 15];
let result = binarySearch(nums, 7);
`,
  },
  {
    name: 'BFS (Binary Tree)',
    category: 'Trees',
    description: 'Level-order traversal of a binary tree using a queue',
    code: `let root = deserializeBinaryTree([1, 2, 3, 4, 5, null, 6]);

function bfs(root) {
  if (!root) return [];
  let queue = [root];
  let result = [];
  while (queue.length > 0) {
    let node = queue.shift();
    result.push(node.val);
    console.log("Visited: " + node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

let order = bfs(root);
`,
  },
  {
    name: 'DFS (Binary Tree)',
    category: 'Trees',
    description: 'Inorder depth-first traversal of a binary tree',
    code: `let root = deserializeBinaryTree([4, 2, 6, 1, 3, 5, 7]);

function dfs(node, result) {
  if (!node) return;
  dfs(node.left, result);
  result.push(node.val);
  console.log("Visited: " + node.val);
  dfs(node.right, result);
}

let order = [];
dfs(root, order);
`,
  },
  {
    name: 'Reverse Linked List',
    category: 'Linked List',
    description: 'Reverse a singly linked list by changing next pointers',
    code: `function createList(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) {
    head = { val: arr[i], next: head };
  }
  return head;
}

function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

let list = createList([1, 2, 3, 4, 5]);
let reversed = reverseList(list);
`,
  },
  {
    name: 'Fibonacci (DP)',
    category: 'Dynamic Programming',
    description: 'Compute Fibonacci numbers using bottom-up dynamic programming',
    code: `function fibonacci(n) {
  let dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    console.log("fib(" + i + ") = " + dp[i]);
  }
  return dp[n];
}

let result = fibonacci(10);
console.log("Result: " + result);
`,
  },
  {
    name: 'Coin Change (DP)',
    category: 'Dynamic Programming',
    description: 'Find minimum number of coins to make a given amount',
    code: `function coinChange(coins, amount) {
  let dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (let j = 0; j < coins.length; j++) {
      if (coins[j] <= i) {
        dp[i] = Math.min(dp[i], dp[i - coins[j]] + 1);
      }
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}

let coins = [1, 5, 10, 25];
let result = coinChange(coins, 30);
console.log("Min coins: " + result);
`,
  },
  {
    name: 'Valid Parentheses',
    category: 'Stack',
    description: 'Check if a string of parentheses is valid using a stack',
    code: `function isValid(s) {
  let stack = [];
  for (let i = 0; i < s.length; i++) {
    let c = s[i];
    if (c === '(' || c === '[' || c === '{') {
      stack.push(c);
    } else {
      if (stack.length === 0) return false;
      let top = stack.pop();
      if (c === ')' && top !== '(') return false;
      if (c === ']' && top !== '[') return false;
      if (c === '}' && top !== '{') return false;
    }
    console.log("Stack: [" + stack.join(", ") + "]");
  }
  return stack.length === 0;
}

let result = isValid("({[]})");
console.log("Valid: " + result);
`,
  },
  {
    name: 'Two Sum',
    category: 'Searching',
    description: 'Find two numbers that add up to a target using a hash map',
    code: `function twoSum(nums, target) {
  let map = {};
  for (let i = 0; i < nums.length; i++) {
    let complement = target - nums[i];
    if (map[complement] !== undefined) {
      console.log("Found: [" + map[complement] + ", " + i + "]");
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
  return [];
}

let nums = [2, 7, 11, 15];
let result = twoSum(nums, 9);
`,
  },
  {
    name: 'Selection Sort',
    category: 'Sorting',
    description: 'Find the minimum element and place it at the beginning repeatedly',
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }
    console.log("After pass " + i + ": " + arr);
  }
  return arr;
}

let nums = [29, 10, 14, 37, 13];
selectionSort(nums);
`,
  },
  {
    name: 'Linear Search',
    category: 'Searching',
    description: 'Search for an element by checking each item sequentially',
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    console.log("Checking index " + i + ": " + arr[i]);
    if (arr[i] === target) {
      console.log("Found " + target + " at index " + i);
      return i;
    }
  }
  console.log(target + " not found");
  return -1;
}

let nums = [4, 2, 7, 1, 9, 3];
let result = linearSearch(nums, 7);
`,
  },
];

export const DEFAULT_CODE = templates[0].code;
