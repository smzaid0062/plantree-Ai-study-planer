import Resource from "../models/Resource.js";
import Topic from "../models/Topic.js";
import { generateAIResponse } from "../config/ai.js";

// POST /api/resources/suggest — AI suggestions for a topic
// export const suggestResources = async (req, res) => {
//   try {
//     const { topicTitle, subjectName, topicId, subjectId } = req.body;

//     if (!topicTitle) {
//       return res.status(400).json({
//         success: false,
//         message: "topicTitle is required",
//       });
//     }

//     const prompt = `You are an expert academic resource curator.

// Suggest exactly 6 high-quality learning resources for the topic: "${topicTitle}" from the subject: "${subjectName || "General"}".

// Return ONLY a valid JSON array. No markdown, no backticks, no explanation.

// Format:
// [
//   {
//     "title": "Resource title",
//     "url": "https://actual-url.com",
//     "type": "video",
//     "source": "YouTube"
//   }
// ]

// Rules:
// 1. Include 2 YouTube videos, 2 articles, 1 documentation, 1 book reference
// 2. Use REAL, working URLs from these trusted sources:
//    - YouTube: youtube.com/watch?v=...
//    - Articles: geeksforgeeks.org, programiz.com, javatpoint.com, tutorialspoint.com
//    - Docs: developer.mozilla.org, docs.python.org, cppreference.com
//    - Books: Use Google Books or archive.org links
// 3. type must be one of: video, article, documentation, book
// 4. source is the website name (YouTube, GeeksForGeeks, MDN, etc.)
// 5. Return ONLY the JSON array`;

//     const responseText = await generateAIResponse(prompt);

//     let resources;

//     // Parse attempts
//     try {
//       resources = JSON.parse(responseText);
//     } catch {
//       const match = responseText.match(/\[[\s\S]*\]/);
//       if (match) {
//         try { resources = JSON.parse(match[0]); }
//         catch { resources = null; }
//       }
//     }

//     if (!resources) {
//       try {
//         const cleaned = responseText
//           .replace(/```json/gi, "")
//           .replace(/```/g, "")
//           .trim();
//         resources = JSON.parse(cleaned);
//       } catch {
//         return res.status(500).json({
//           success: false,
//           message: "AI suggestion failed. Try again.",
//         });
//       }
//     }

//     // Add metadata
//     const enriched = resources.map((r) => ({
//       ...r,
//       topicId: topicId || null,
//       subjectId: subjectId || null,
//       isAISuggested: true,
//       isSaved: false,
//     }));

//     res.status(200).json({ success: true, data: enriched });
//   } catch (error) {
//     console.error("Suggest resources error:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const suggestResources = async (req, res) => {
  try {
    const { topicTitle, subjectName, topicId, subjectId } = req.body;

    if (!topicTitle) {
      return res.status(400).json({
        success: false,
        message: "topicTitle is required",
      });
    }

    // A tighter prompt to stop the AI from talking too much
    const prompt = `You are an academic resource curator.
I have performed a live web search and provided the results below. 
Your task is to select exactly 6 high-quality learning resources from the provided search results for the topic: "${topicTitle}" (Subject: "${subjectName || "General"}").

CRITICAL RULES:
1. You MUST only use URLs that appear in the web search results provided.
2. DO NOT generate or invent any new URLs.
3. Return ONLY a valid JSON array. No markdown, no backticks, no explanation.

Format:
[
  {
    "title": "Resource title",
    "url": "https://actual-url-from-search-results.com",
    "type": "video",
    "source": "DomainName"
  }
]

Include: 2 YouTube videos, 2 articles, 1 documentation, 1 book reference from the results (if available).
Type must be one of: video, article, documentation, book.
Source must be the domain name (e.g., youtube.com, geeksforgeeks.org).
Return ONLY the JSON array.`;
    
    // Call the AI (make sure this function passes temperature: 0.1 in your ai.service)
    const responseText = await generateAIResponse(prompt);
    console.log("✅ AI Responded. Length:", responseText.length);

    let resources = null;

    // Attempt 1: Direct Parse
    try {
      resources = JSON.parse(responseText);
    } catch (e) {
      // Attempt 2: Extract everything between the first [ and last ]
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          resources = JSON.parse(match[0]);
        } catch (innerError) {
          console.error("❌ Regex found brackets, but JSON was invalid:", innerError.message);
        }
      }
    }

    // Attempt 3: Sanity Check (Make sure it's actually an array)
    if (!Array.isArray(resources)) {
      console.error("❌ AI FAILED TO RETURN AN ARRAY. Raw text was:\n", responseText);
      return res.status(500).json({
        success: false,
        message: "AI returned an invalid format. Please try again.",
      });
    }

    // Add metadata to each resource
    const enriched = resources.map((r) => ({
      ...r,
      topicId: topicId || null,
      subjectId: subjectId || null,
      isAISuggested: true,
      isSaved: false,
    }));

    res.status(200).json({ success: true, data: enriched });

  } catch (error) {
    console.error("❌ Suggest resources CRASHED:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error while generating resources." 
    });
  }
};

// POST /api/resources/save — bookmark a resource
export const saveResource = async (req, res) => {
  try {
    const { title, url, type, source, topicId, subjectId, isAISuggested } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: "title and url are required",
      });
    }

    // Check duplicate
    const existing = await Resource.findOne({
      userId: req.user._id,
      url,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Resource already saved",
      });
    }

    const resource = await Resource.create({
      userId: req.user._id,
      title,
      url,
      type: type || "article",
      source: source || "",
      topicId: topicId || null,
      subjectId: subjectId || null,
      isAISuggested: isAISuggested || false,
      isSaved: true,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resources — all saved resources
export const getSavedResources = async (req, res) => {
  try {
    const { topicId, type } = req.query;

    const filter = { userId: req.user._id, isSaved: true };
    if (topicId) filter.topicId = topicId;
    if (type) filter.type = type;

    const resources = await Resource.find(filter)
      .populate("topicId", "title")
      .populate("subjectId", "name color")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/resources/:id — remove bookmark
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    res.status(200).json({ success: true, message: "Resource removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};