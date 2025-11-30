import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Fetch menu items to give context to the AI
        const products = await Product.find().select('title price category description imgUrl');
        const menuContext = products.map(p => JSON.stringify({
            _id: p._id,
            title: p.title,
            price: p.price,
            category: p.category,
            description: p.description,
            imgUrl: p.imgUrl
        })).join('\n');

        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const systemPrompt = `
        You are the AI Assistant for "Foodie", a food delivery app.
        Your goal is to help users find food they love from our menu.
        
        Here is our Menu (JSON format):
        ${menuContext}
        
        Rules:
        1. Only recommend items from the menu above.
        2. Be friendly, concise, and helpful.
        3. If asked about delivery times, say "Usually 30-45 minutes".
        4. If asked about something not on the menu, politely say we don't serve that.
        5. Use emojis! 🍕🍔
        
        IMPORTANT: You must return your response in valid JSON format with the following structure:
        {
            "text": "Your friendly response text here...",
            "products": [
                {
                    "_id": "product_id",
                    "title": "Product Title",
                    "price": 100,
                    "imgUrl": "url_to_image"
                }
            ]
        }
        
        If you are not recommending any specific products, the "products" array should be empty [].
        Do NOT wrap the JSON in markdown code blocks (like \`\`\`json). Just return the raw JSON string.
        
        User Query: ${message}
        `;

        const result = await chat.sendMessage(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up response if it contains markdown code blocks
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            res.status(200).json(jsonResponse);
        } catch (e) {
            console.error("Failed to parse AI JSON response:", text);
            // Fallback for plain text response
            res.status(200).json({ text: text, products: [] });
        }
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ message: "Failed to get AI response", error: error.message });
    }
};
