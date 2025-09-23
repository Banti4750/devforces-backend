import fetch from "node-fetch";
import { prisma } from "../../config/db.js";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// --- Helper: Run code locally (⚠️ sandbox for prod!) ---
async function runCode(language, code, input) {
    if (language === "javascript") {
        const fs = await import("fs");
        const file = "submission.js";
        fs.writeFileSync(file, code);

        try {
            // Pass input as env or stdin if needed
            const { stdout } = await execAsync(`node ${file}`);
            return stdout.trim();
        } catch (err) {
            return `Runtime Error: ${err.message}`;
        }
    }

    return "Language not supported in local runner";
}

/**
 * Check submission: run test cases + AI evaluation
 */
export const checkSubmission = async (problemId, code, language = "javascript") => {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured");
    }

    // 1. Fetch problem with testCases
    const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { testCases: true },
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // Map difficulty → max points
    const maxRange = {
        EASY: 20,
        MEDIUM: 60,
        HARD: 100,
    }[problem.difficulty.toUpperCase()] || 20;

    // 2. Run test cases
    let passed = 0;
    const results = [];

    for (const tc of problem.testCases) {
        const output = await runCode(language, code, tc.input);
        const success = output === tc.expectedOutput;

        if (success) passed++;
        results.push({
            input: tc.input,
            expected: tc.expectedOutput,
            got: output,
            success,
        });
    }

    const testScore = Math.round((passed / problem.testCases.length) * maxRange);

    // 3. Gemini analysis
    const prompt = `
You are a coding judge.

Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Language: ${language}

Submission:
\`\`\`${language}
${code}
\`\`\`

The submission ran ${problem.testCases.length} test cases.
Passed: ${passed}, Failed: ${problem.testCases.length - passed}

Return ONLY valid JSON:
{
  "syntaxErrors": string|null,
  "logicIssues": string|null,
  "styleSuggestions": string|null,
  "aiScore": number (0-${maxRange})
}
`;

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
        }),
    });

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let aiEval = {};
    try {
        aiEval = JSON.parse(output);
    } catch {
        aiEval = { aiScore: Math.round(testScore / 2), feedback: output };
    }

    // Clamp AI score
    aiEval.aiScore = Math.max(0, Math.min(maxRange, aiEval.aiScore || 0));

    // 4. Final score (70% testcases + 30% AI feedback)
    const finalScore = Math.round(testScore * 0.7 + aiEval.aiScore * 0.3);

    return {
        success: true,
        problem: {
            id: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
        },
        results, // detailed per-testcase
        scores: {
            testScore,
            aiScore: aiEval.aiScore,
            finalScore,
            maxRange,
        },
        feedback: {
            syntaxErrors: aiEval.syntaxErrors || null,
            logicIssues: aiEval.logicIssues || null,
            styleSuggestions: aiEval.styleSuggestions || null,
        },
    };
};


// Mocked contest problems (your format, trimmed for clarity)
const problems = [
    {
        id: "68c606a897acece2a12e68ae",
        title: "REST API for Task Management",
        difficulty: "MEDIUM",
        starterCode: "// Scaffold with Express router",
        solution: "// Complete CRUD with pagination",
        testCases: [
            { input: "POST /tasks {title:'Test'}", expectedOutput: "201 Created" },
            { input: "GET /tasks", expectedOutput: "200 OK with list" },
            { input: "GET /tasks?page=2", expectedOutput: "Paginated list" }
        ]
    },
    {
        id: "68c62ab5e55c102adff93a7c",
        title: "Setup JWT Authentication in Express",
        difficulty: "MEDIUM",
        starterCode: "app.post('/login', async (req, res) => { /* TODO */ })",
        solution: "Use bcrypt for password hashing and jsonwebtoken for signing tokens.",
        testCases: [
            { input: "POST /signup {email, password}", expectedOutput: "201 Created" },
            { input: "POST /login {email, password}", expectedOutput: "200 OK + JWT" },
            { input: "GET /protected with token", expectedOutput: "200 OK" }
        ]
    },
    {
        id: "68c62ad3e55c102adff93a80",
        title: "Design a Blog API",
        difficulty: "EASY",
        starterCode: "router.get('/posts', async (req, res) => { /* TODO */ })",
        solution: "Implement GET/POST/PUT/DELETE routes.",
        testCases: [
            { input: "POST /posts {title,content}", expectedOutput: "201 Created" },
            { input: "GET /posts", expectedOutput: "200 OK with list" }
        ]
    },
    {
        id: "68c62aebe55c102adff93a84",
        title: "E-Commerce Checkout System",
        difficulty: "HARD",
        starterCode: "const orderSchema = new mongoose.Schema({ /* TODO */ })",
        solution: "Schemas for users/products/orders + Stripe Checkout.",
        testCases: [
            { input: "POST /checkout {cart}", expectedOutput: "Stripe session created" },
            { input: "POST /order {cart}", expectedOutput: "Order saved" },
            { input: "GET /orders", expectedOutput: "List of orders" }
        ]
    }
];

// scoring ranges
const scoreRanges = {
    EASY: 20,
    MEDIUM: 60,
    HARD: 100
};



// Example run
const userCode = "Use bcrypt for password hashing and jsonwebtoken for signing tokens.";
console.log(checkSubmission("68c62ab5e55c102adff93a7c", userCode));
