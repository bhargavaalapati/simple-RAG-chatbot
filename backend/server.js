// backend/server.js
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first'); // Fix for WSL connectivity

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Schema
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: String
});
faqSchema.index({ question: 'text', answer: 'text' });
const FAQ = mongoose.model('FAQ', faqSchema);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Routes ---

app.post('/api/seed', async (req, res) => {
  const massiveData = [
    // --- General ---
    { category: "General", question: "What are your hours of operation?", answer: "We are open Monday to Friday, 9:00 AM to 6:00 PM EST. We are closed on weekends and major public holidays." },
    { category: "General", question: "Where are you located?", answer: "Our headquarters is located at 123 Tech Park, Silicon Valley, CA 94000." },
    { category: "General", question: "How can I contact support?", answer: "You can email us at support@smartchatbot.com or call +1-800-555-0199." },
    { category: "General", question: "Is there a mobile app?", answer: "Yes, our mobile app is available for download on both iOS App Store and Google Play Store." },
    { category: "General", question: "Do you have a physical store?", answer: "No, we are currently an online-only retailer." },
    
    // --- Account Management ---
    { category: "Account", question: "How do I reset my password?", answer: "Go to the login page and click 'Forgot Password'. A reset link will be sent to your email." },
    { category: "Account", question: "Can I change my username?", answer: "Usernames are permanent once created. However, you can change your display name in Settings > Profile." },
    { category: "Account", question: "How do I delete my account?", answer: "To delete your account, please submit a request via the 'Privacy' tab in your account settings. It takes 48 hours to process." },
    { category: "Account", question: "Where can I update my email address?", answer: "Navigate to Settings > Account Security to update your registered email address." },
    { category: "Account", question: "Why is my account locked?", answer: "Accounts are locked after 5 failed login attempts. Please wait 30 minutes or reset your password to unlock it." },
    { category: "Account", question: "Can I merge two accounts?", answer: "Unfortunately, we do not support merging accounts at this time." },
    
    // --- Billing & Payments ---
    { category: "Billing", question: "What payment methods do you accept?", answer: "We accept Visa, MasterCard, American Express, PayPal, and Apple Pay." },
    { category: "Billing", question: "How do I request a refund?", answer: "You can request a refund within 30 days of purchase by going to 'Order History' and clicking 'Return Item'." },
    { category: "Billing", question: "Where can I find my invoice?", answer: "Invoices are emailed to you after every purchase. You can also download them from the 'Billing' section of your dashboard." },
    { category: "Billing", question: "Do you offer student discounts?", answer: "Yes! Students get 15% off. Please verify your student status using ID.me at checkout." },
    { category: "Billing", question: "Why was my credit card declined?", answer: "Check that your billing address matches the card, or contact your bank to ensure they aren't blocking the transaction." },
    { category: "Billing", question: "Can I pay in crypto?", answer: "We currently do not accept cryptocurrency payments." },
    { category: "Billing", question: "Is my payment information secure?", answer: "Yes, we use Stripe for payment processing and do not store your credit card details on our servers." },

    // --- Shipping & Delivery ---
    { category: "Shipping", question: "Do you ship internationally?", answer: "Yes, we ship to over 100 countries including Canada, UK, Australia, and most of Europe." },
    { category: "Shipping", question: "How long does shipping take?", answer: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days." },
    { category: "Shipping", question: "How can I track my order?", answer: "Once your order ships, you will receive an email with a tracking number and a link to the carrier's website." },
    { category: "Shipping", question: "My package is missing, what do I do?", answer: "If your tracking says delivered but you don't have it, please wait 24 hours. Then, contact our support team." },
    { category: "Shipping", question: "Can I change my shipping address?", answer: "You can change the address within 1 hour of placing the order. After that, we cannot guarantee the change." },
    { category: "Shipping", question: "Do you ship to PO Boxes?", answer: "Yes, we ship to PO Boxes via USPS only." },

    // --- Returns & Warranty ---
    { category: "Returns", question: "What is your return policy?", answer: "We offer a 30-day return policy for unused items in original packaging. Return shipping is free." },
    { category: "Returns", question: "How long do refunds take?", answer: "Refunds typically appear on your bank statement within 5-10 business days after we receive your return." },
    { category: "Returns", question: "Do you offer exchanges?", answer: "Yes, you can exchange an item for a different size or color via our Returns portal." },
    { category: "Returns", question: "Is there a warranty on products?", answer: "All electronics come with a 1-year limited manufacturer warranty." },
    
    // --- Technical Support ---
    { category: "Technical", question: "The app keeps crashing, what should I do?", answer: "Please ensure you have the latest version installed. Try clearing the app cache or reinstalling the application." },
    { category: "Technical", question: "Which browsers are supported?", answer: "We support the latest versions of Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported." },
    { category: "Technical", question: "How do I clear my cache?", answer: "In Chrome, press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac) and select 'Cached images and files'." },
    { category: "Technical", question: "Can I use the API?", answer: "Yes, we offer a public API for developers. Check our documentation at /docs/api." },
    { category: "Technical", question: "Why am I not receiving emails?", answer: "Check your spam folder. If they aren't there, whitelist our domain 'smartchatbot.com' in your email settings." },
    
    // --- Subscription ---
    { category: "Subscription", question: "How do I cancel my subscription?", answer: "Go to Account > Subscription and click 'Cancel Plan'. You will retain access until the end of your billing cycle." },
    { category: "Subscription", question: "Can I upgrade my plan later?", answer: "Yes, you can upgrade at any time. The price difference will be prorated for the remainder of the month." },
    { category: "Subscription", question: "Do you offer a free trial?", answer: "We offer a 14-day free trial for our Pro plan. No credit card required." },
    { category: "Subscription", question: "What happens if my payment fails?", answer: "We will retry 3 times over 5 days. If it fails, your subscription will be paused." },

    // --- Fun/Misc ---
    { category: "Misc", question: "Are you a robot?", answer: "Yes, I am an AI-powered assistant designed to help you!" },
    { category: "Misc", question: "Who made you?", answer: "I was built by the Smart Chatbot engineering team." },
    { category: "Misc", question: "What is the meaning of life?", answer: "42. But also, to provide excellent customer support." },
  ];

  try {
    await FAQ.deleteMany({});
    await FAQ.insertMany(massiveData);
    res.json({ message: `Database seeded successfully with ${massiveData.length} entries!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    // 1. Retrieval (Always happens first)
    const contextDocs = await FAQ.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } }).limit(4);

    const contextText = contextDocs.map(d => `Q: ${d.question}\nA: ${d.answer}`).join("\n\n");

    // 2. Try Real AI Generation
    try {
      // If USE_MOCK_AI is explicitly true in .env, throw error to skip to catch block
      if (process.env.USE_MOCK_AI === 'true') throw new Error("Mock Mode Enabled");

      const prompt = `
        You are a friendly customer support AI. 
        Use the context below to answer the user.
        If the answer is not in the context, say "I don't have that info."
        
        CONTEXT:
        ${contextText}
        
        USER: ${query}
      `;

      // Try the Experimental Model (Most likely to be free)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // ✅ SUCCESS: Send Real AI Response
      res.json({ botResponse: response.text(), contextUsed: contextDocs });

    } catch (aiError) {
      // 3. Fallback Logic (Mock AI)
      console.warn("⚠️ AI Generation failed (or Mock Mode). Falling back to Database match.");
      console.warn("Error details:", aiError.message);

      // Create a "Smart" Mock response based on the search results
      let fallbackResponse;
      
      if (contextDocs.length > 0) {
        // We found a match in DB, so return that answer directly
        fallbackResponse = `(Offline Mode): I couldn't connect to the AI brain, but here is what I found in the database:\n\n**${contextDocs[0].answer}**`;
      } else {
        // No match in DB either
        fallbackResponse = `(Offline Mode): I'm sorry, I couldn't find relevant information in our database, and my AI connection is currently down.`;
      }

      // ✅ SUCCESS (Fallback): Send Database Response
      res.json({ botResponse: fallbackResponse, contextUsed: contextDocs });
    }

  } catch (dbError) {
    console.error("Critical Database Error:", dbError);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));