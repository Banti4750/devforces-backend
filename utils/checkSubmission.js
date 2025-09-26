import fetch from "node-fetch";
import { prisma } from "../config/db.js";

// Using Groq's free API (get key from https://console.groq.com/keys)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const checkSubmission = async (problemId, code, language = "javascript") => {
    try {
        console.log("GROQ_API_KEY:", GROQ_API_KEY ? "✅ Present" : "❌ Missing");

        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY not configured. Get one free at https://console.groq.com/keys");
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

        // Format test cases for better AI understanding
        const testCasesText = problem.testCases
            .map(tc => `Input: ${tc.input}\nExpected: ${tc.expectedOutput}\nExplanation: ${tc.explanation || 'N/A'}`)
            .join('\n---\n');

        // Enhanced AI analysis prompt with strict relevance check
        const prompt = `You are a coding judge for DevForces platform that evaluates software development solutions.

Problem: ${problem.title}
Description: ${problem.description}
Difficulty: ${problem.difficulty}
Language: ${language}
Technologies: ${problem.technologies?.join(', ') || 'Not specified'}

Test Cases:
${testCasesText}

Submission Code:
\`\`\`${language}
${code}
\`\`\`

CRITICAL: First check if the submission is related to the problem requirements. If the code is:
- Completely unrelated to the problem
- Just random text, comments, or placeholder code
- Not attempting to solve the given problem
- Empty or contains only basic examples unrelated to requirements

Then give aiScore: 0

Otherwise, evaluate based on:
1. Correctness - Does it solve the problem requirements?
2. Code quality - Clean, readable, maintainable code
3. Best practices - Follows language/framework conventions
4. Test case coverage - Addresses the given test scenarios
5. Schema design (if applicable) - Proper relationships, constraints, normalization

Return ONLY valid JSON (no markdown, no extra text):
{
    "syntaxErrors": "string describing syntax issues or null",
    "logicIssues": "string describing logic problems or null",
    "styleSuggestions": "string with code style improvements or null",
    "aiScore": number_between_0_and_${maxRange},
    "isRelevant": true_or_false
}

If isRelevant is false, aiScore must be 0.`;

        // Try multiple models in case one doesn't work
        const models = [
            "llama-3.1-8b-instant",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
            "gemma-7b-it"
        ];

        let response;
        let lastError;

        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);

                response = await fetch(GROQ_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        temperature: 0.1,
                        max_tokens: 1000
                    }),
                });

                if (response.ok) {
                    console.log(`✅ Successfully connected with model: ${model}`);
                    break;
                } else {
                    const errorText = await response.text();
                    console.log(`❌ Failed with ${model}:`, response.status);
                    lastError = `${response.status} ${response.statusText} - ${errorText}`;
                }
            } catch (err) {
                console.log(`❌ Network error with ${model}:`, err.message);
                lastError = err.message;
                continue;
            }
        }

        if (!response || !response.ok) {
            throw new Error(`All Groq models failed. Last error: ${lastError}`);
        }

        const data = await response.json();
        console.log("✅ Successfully got response from Groq");

        // Extract and parse the AI response
        const aiResponseText = data.choices?.[0]?.message?.content;

        if (!aiResponseText) {
            throw new Error("No response from Groq AI");
        }

        // Clean the response (remove markdown code blocks if present)
        const cleanedResponse = aiResponseText
            .replace(/```json\s*/, '')
            .replace(/```\s*$/, '')
            .trim();

        let aiResult;
        try {
            aiResult = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error("Failed to parse AI response:", cleanedResponse);
            // Fallback scoring if AI response is malformed
            aiResult = {
                syntaxErrors: "Unable to parse AI response",
                logicIssues: null,
                styleSuggestions: null,
                aiScore: Math.floor(maxRange * 0.3) // 30% fallback score
            };
        }

        // Validate score is within expected range
        const score = Math.max(0, Math.min(maxRange, aiResult.aiScore || 0));

        return {
            success: true,
            score: score,
            feedback: {
                syntaxErrors: aiResult.syntaxErrors,
                logicIssues: aiResult.logicIssues,
                styleSuggestions: aiResult.styleSuggestions,
                isRelevant: aiResult.isRelevant
            },
            maxScore: maxRange,
            problem: {
                title: problem.title,
                difficulty: problem.difficulty
            }
        };

    } catch (error) {
        console.error("Error in checkSubmission:", error);
        return {
            success: false,
            score: 0,
            error: error.message
        };
    }
};