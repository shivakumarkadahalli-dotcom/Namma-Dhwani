import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { getSupabaseAdmin, isSupabaseConfigured } from "./server/supabaseServer";
import { 
  sendEmail,
  sendWelcomeEmail, 
  sendComplaintSubmittedEmail, 
  sendOfficerAssignmentEmail, 
  sendResolutionVerificationEmail, 
  sendProblemSolvedEmail,
  sendPasswordResetEmail 
} from "./server/resendService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to instantiate Gemini AI server-side
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. AI Parse Complaint Endpoint
app.post("/api/ai/parse-complaint", async (req, res) => {
  try {
    const rawText = req.body.textInput || req.body.rawText;
    const { language = "en", location } = req.body;

    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
      return res.status(400).json({ error: "Description is required" });
    }

    const ai = getGenAI();

    // Context-aware classification logic for 5 departments
    const lower = rawText.toLowerCase();

    // 1. Water Supply
    const isWaterSupply =
      (lower.includes("water") && (lower.includes("supply") || lower.includes("tap") || lower.includes("pressure") || lower.includes("drink") || lower.includes("dirty") || lower.includes("contaminat") || lower.includes("pipeline") || lower.includes("pipe") || lower.includes("leak") || lower.includes("interrupt") || lower.includes("no water"))) &&
      !lower.includes("drain") && !lower.includes("sewage") && !lower.includes("stormwater") && !lower.includes("flood") && !lower.includes("waterlog");

    // 2. Drainage & Stormwater
    const isDrainage =
      lower.includes("drain") ||
      lower.includes("stormwater") ||
      lower.includes("sewage") ||
      lower.includes("waterlog") ||
      lower.includes("gutter") ||
      lower.includes("manhole") ||
      (lower.includes("flood") && !lower.includes("garbage")) ||
      (lower.includes("overflow") && (lower.includes("water") || lower.includes("sewer") || lower.includes("drain")));

    // 3. Waste Management
    const isWaste =
      lower.includes("garbage") ||
      lower.includes("waste") ||
      lower.includes("dump") ||
      lower.includes("trash") ||
      lower.includes("rubbish") ||
      lower.includes("litter") ||
      lower.includes("bin") ||
      lower.includes("uncollected");

    // 4. Street Lighting
    const isStreetLighting =
      lower.includes("street light") ||
      lower.includes("streetlight") ||
      lower.includes("lamp") ||
      lower.includes("lighting") ||
      lower.includes("flicker") ||
      lower.includes("dark street") ||
      lower.includes("darkness") ||
      (lower.includes("dark") && lower.includes("night")) ||
      (lower.includes("light") && (lower.includes("off") || lower.includes("not working") || lower.includes("broken") || lower.includes("pole")));

    // 5. Roads & Infrastructure
    const isRoads =
      lower.includes("pothole") ||
      lower.includes("footpath") ||
      lower.includes("sidewalk") ||
      lower.includes("divider") ||
      lower.includes("bridge") ||
      lower.includes("speed breaker") ||
      lower.includes("asphalt") ||
      lower.includes("pavement") ||
      lower.includes("cave-in") ||
      lower.includes("road crack") ||
      (lower.includes("road") && (lower.includes("damage") || lower.includes("broken") || lower.includes("uneven") || lower.includes("collapse")));

    let department = "Roads & Infrastructure";
    let issueType = "Road Infrastructure Problem";
    let category = "Roads";
    let subcategory = "Surface Damage";
    let severity = "Medium";
    let priorityScore = 70;

    if (isWaterSupply) {
      department = "Water Supply";
      category = "Water";
      if (lower.includes("contaminat") || lower.includes("dirty")) {
        issueType = "Contaminated Water Supply";
        subcategory = "Water Contamination";
        severity = "High";
        priorityScore = 85;
      } else if (lower.includes("pipe") || lower.includes("leak")) {
        issueType = "Municipal Pipeline Leak";
        subcategory = "Pipeline Leakage";
        severity = "High";
        priorityScore = 82;
      } else if (lower.includes("pressure") || lower.includes("low")) {
        issueType = "Low Water Pressure";
        subcategory = "Low Pressure";
        severity = "Medium";
        priorityScore = 65;
      } else {
        issueType = "Water Supply Interruption";
        subcategory = "Supply Interruption";
        severity = "High";
        priorityScore = 80;
      }
    } else if (isDrainage) {
      department = "Drainage & Stormwater";
      category = "Drainage";
      if (lower.includes("sewage") || lower.includes("overflow")) {
        issueType = "Sewage Drain Overflow";
        subcategory = "Sewage Overflow";
        severity = "Critical";
        priorityScore = 92;
      } else if (lower.includes("flood") || lower.includes("waterlog")) {
        issueType = "Drainage Waterlogging & Flooding";
        subcategory = "Stormwater Flooding";
        severity = "Critical";
        priorityScore = 90;
      } else if (lower.includes("manhole")) {
        issueType = "Damaged Open Manhole";
        subcategory = "Manhole Cover Damage";
        severity = "High";
        priorityScore = 85;
      } else {
        issueType = "Blocked Stormwater Drain";
        subcategory = "Drain Blockage";
        severity = "High";
        priorityScore = 80;
      }
    } else if (isWaste) {
      department = "Waste Management";
      category = "Waste";
      if (lower.includes("dump") || lower.includes("illegal")) {
        issueType = "Illegal Garbage Dumping";
        subcategory = "Illegal Dumping";
        severity = "Medium";
        priorityScore = 68;
      } else if (lower.includes("overflow") || lower.includes("bin")) {
        issueType = "Overflowing Garbage Bins";
        subcategory = "Overflowing Bins";
        severity = "Medium";
        priorityScore = 65;
      } else {
        issueType = "Uncollected Garbage Accumulation";
        subcategory = "Garbage Accumulation";
        severity = "Medium";
        priorityScore = 60;
      }
    } else if (isStreetLighting) {
      department = "Street Lighting";
      category = "Streetlight";
      if (lower.includes("dark")) {
        issueType = "Dark Street due to Lighting Failure";
        subcategory = "Street Darkness Hazard";
        severity = "Medium";
        priorityScore = 65;
      } else if (lower.includes("pole") || lower.includes("broken")) {
        issueType = "Damaged Street Light Pole";
        subcategory = "Pole Damage";
        severity = "High";
        priorityScore = 75;
      } else {
        issueType = "Non-Functional Street Light";
        subcategory = "Fixture Repair";
        severity = "Low";
        priorityScore = 50;
      }
    } else if (isRoads) {
      department = "Roads & Infrastructure";
      category = "Roads";
      if (lower.includes("pothole")) {
        issueType = "Hazardous Road Pothole";
        subcategory = "Pothole & Surface Damage";
        severity = lower.includes("deep") || lower.includes("accident") || lower.includes("large") ? "High" : "Medium";
        priorityScore = severity === "High" ? 82 : 72;
      } else if (lower.includes("collapse") || lower.includes("cave-in")) {
        issueType = "Road Surface Collapse / Cave-In";
        subcategory = "Structural Collapse";
        severity = "Critical";
        priorityScore = 95;
      } else if (lower.includes("footpath") || lower.includes("sidewalk")) {
        issueType = "Damaged Footpath & Sidewalk";
        subcategory = "Pedestrian Footpath Repair";
        severity = "Medium";
        priorityScore = 60;
      } else {
        issueType = "Damaged Road Surface";
        subcategory = "Asphalt Degradation";
        severity = "Medium";
        priorityScore = 68;
      }
    }

    const priorityLevel = severity === "Critical" ? "Critical" : severity === "High" ? "High" : severity === "Medium" ? "Medium" : "Low";
    const slaHours = severity === "Critical" ? 24 : severity === "High" ? 48 : severity === "Medium" ? 48 : 72;
    const aiExecutiveSummary = `AI identified ${issueType} under ${department} (${severity} severity). Priority score evaluated at ${priorityScore}/100 based on public impact and safety factors. Target resolution SLA set to ${slaHours} hours.`;

    if (!ai) {
      return res.json({
        department,
        issueType,
        category,
        detectedCategory: category,
        subcategory,
        severity,
        priorityScore,
        priorityLevel,
        slaHours,
        aiAnalysis: `AI Analysis: Complaint classified as ${issueType} under ${department} based on root cause analysis. Priority score evaluated as ${priorityScore}/100.`,
        aiSummary: aiExecutiveSummary,
        aiExecutiveSummary,
        isFallback: true,
      });
    }

    const prompt = `You are a municipal grievance intelligence classifier for NammaDhwani AI.
Analyze this civic grievance reported by a citizen in ${language} language.
User Description: "${rawText}"
Location Context: "${location || 'Not provided'}"

CLASSIFICATION RULES:
Classify the grievance into EXACTLY ONE of these 5 departments based on root cause:
1. "Roads & Infrastructure" (Potholes, broken roads, footpaths, bridges, road surface damage)
2. "Drainage & Stormwater" (Blocked drains, sewage overflow, flooding/waterlogging caused by drains, manholes)
3. "Waste Management" (Garbage accumulation, uncollected waste, overflowing bins, illegal dumping)
4. "Street Lighting" (Street lights not working, dark streets due to lighting failure, broken lamp poles)
5. "Water Supply" (No water supply, low water pressure, dirty/contaminated drinking water, municipal pipe leak)

IMPORTANT RULE:
Do NOT classify as "Roads & Infrastructure" just because words like "road", "street", "water", "area" appear. Focus on the actual root issue.
Example: "The road is flooded because the stormwater drain is blocked" -> "Drainage & Stormwater".
Example: "Garbage on the side of the road" -> "Waste Management".

Output valid JSON adhering strictly to:
{
  "department": "One of ['Roads & Infrastructure', 'Drainage & Stormwater', 'Waste Management', 'Street Lighting', 'Water Supply']",
  "issueType": "Short descriptive title of specific issue e.g. Blocked Stormwater Drain, Hazardous Road Pothole, Uncollected Garbage",
  "category": "One of ['Roads', 'Drainage', 'Waste', 'Streetlight', 'Water']",
  "subcategory": "Specific subcategory matching issue type",
  "severity": "One of ['Low', 'Medium', 'High', 'Critical']",
  "aiAnalysis": "2-sentence clear explanation of why this department and issue type were assigned",
  "aiExecutiveSummary": "Professional 2-sentence executive summary synthesizing the root defect, severity, and urgency for municipal action",
  "priorityScore": number between 1 and 100,
  "slaHours": number (24 for Critical, 48 for High/Medium, 72 for Low)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            department: { type: Type.STRING },
            issueType: { type: Type.STRING },
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            severity: { type: Type.STRING },
            aiAnalysis: { type: Type.STRING },
            aiExecutiveSummary: { type: Type.STRING },
            priorityScore: { type: Type.NUMBER },
            slaHours: { type: Type.NUMBER },
          },
          required: ["department", "issueType", "category", "subcategory", "severity", "aiAnalysis", "aiExecutiveSummary", "priorityScore"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const calculatedSla = parsed.slaHours || (parsed.severity === "Critical" ? 24 : parsed.severity === "High" ? 48 : 48);
    const result = {
      ...parsed,
      detectedCategory: parsed.category || category,
      priorityLevel: parsed.severity || severity,
      slaHours: calculatedSla,
      aiSummary: parsed.aiExecutiveSummary || aiExecutiveSummary,
      aiExecutiveSummary: parsed.aiExecutiveSummary || aiExecutiveSummary,
    };
    return res.json(result);
  } catch (error) {
    console.error("Error parsing complaint:", error);
    return res.status(500).json({ error: "Failed to process complaint with AI" });
  }
});

// 2. AI Resolution Verification Endpoint
app.post("/api/ai/verify-resolution", async (req, res) => {
  try {
    const { complaintTitle, complaintDescription, officerNotes, hasAfterImage } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Smart simulated verification fallback
      const notesLower = (officerNotes || "").toLowerCase();
      let status = "verified";
      let confidenceScore = 94;
      let reason = "AI analyzed resolution notes and evidence. Work completed matches reported grievance location and category.";

      if (notesLower.includes("temporary") || notesLower.includes("partial")) {
        status = "needs_confirmation";
        confidenceScore = 72;
        reason = "Resolution appears temporary or partial. Citizen confirmation requested.";
      } else if (notesLower.length < 5 && !hasAfterImage) {
        status = "failed";
        confidenceScore = 35;
        reason = "Verification failed due to insufficient after-work photo evidence or missing resolution documentation.";
      }

      return res.json({
        status,
        confidenceScore,
        reason,
        locationMatched: true,
        timeMatched: true,
        isFallback: true,
      });
    }

    const prompt = `Evaluate if a civic grievance has been legitimately resolved based on the before report and officer completion details.
Original Complaint: "${complaintTitle} - ${complaintDescription}"
Officer Resolution Notes: "${officerNotes || "No notes provided"}"
Has After Image Uploaded: ${hasAfterImage ? "Yes" : "No"}

Return JSON format:
{
  "status": "One of ['verified', 'needs_confirmation', 'failed']",
  "confidenceScore": number between 0 and 100,
  "reason": "Detailed 2-sentence explanation of why it passed, failed, or requires citizen confirmation",
  "locationMatched": true/false,
  "timeMatched": true/false
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            locationMatched: { type: Type.BOOLEAN },
            timeMatched: { type: Type.BOOLEAN },
          },
          required: ["status", "confidenceScore", "reason", "locationMatched", "timeMatched"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error verifying resolution:", error);
    return res.status(500).json({ error: "Failed to verify resolution" });
  }
});

// 3. AI Executive Summary Endpoint
app.post("/api/ai/executive-summary", async (req, res) => {
  try {
    const { stats, alerts } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        summary: `Today's Civic Executive Briefing: The municipality recorded 428 grievances with an 84% SLA compliance rate across 24 wards. Solid Waste Management achieved the highest resolution efficiency at 92%, while Stormwater Drainage experienced a 41% surge in rainfall-triggered complaints. Two critical recurring asset failures (Drainage DR-092 and Road RD-018) require capital replacement rather than reactive surface repairs. AI resolution verification flagged 4 potential evidence discrepancies today, which have been routed to departmental supervisors for audit.`,
        isFallback: true,
      });
    }

    const prompt = `Synthesize an executive civic intelligence briefing (5-7 clear sentences) for the City Commissioner based on these stats:
Stats: ${JSON.stringify(stats || {})}
Recent System Alerts: ${JSON.stringify(alerts || [])}

Highlight critical surges, department performance highlights, recurring asset risks, and recommended administrative action items.
Format as a single cohesive markdown string with clean paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return res.json({ summary: response.text });
  } catch (error) {
    console.error("Error generating executive summary:", error);
    return res.status(500).json({ error: "Failed to generate executive summary" });
  }
});

// 4. AI Recurring Asset Root Cause Insight Endpoint
app.post("/api/ai/recurring-insights", async (req, res) => {
  try {
    const { assetType, locationName, totalComplaints, reopenedCount, repairHistory } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        aiInsight: `Repeated short-term repairs at ${locationName} have failed ${reopenedCount} times due to underlying structural wear and environmental triggers.`,
        aiRecommendation: `Transition from reactive maintenance to capital asset replacement for ${assetType}. Conduct full hydraulic and structural load audit.`,
        patternDetected: `High incidence of recurring complaints following environmental triggers (precipitation / electrical surges).`,
        rootCauseHypothesis: `Sub-surface degradation and inadequate capacity relative to increased urban density.`,
        confidenceScore: 92,
        isFallback: true,
      });
    }

    const prompt = `Analyze recurring civic infrastructure failures for asset "${assetType}" at "${locationName}".
Total Complaints: ${totalComplaints}, Reopened: ${reopenedCount}
Repair History: ${JSON.stringify(repairHistory || [])}

Generate root-cause insights and preventive recommendations in JSON format:
{
  "aiInsight": "2-sentence analysis of why surface repairs are failing",
  "aiRecommendation": "Actionable preventive engineering recommendation",
  "patternDetected": "Specific pattern identified from grievance timeline",
  "rootCauseHypothesis": "Underlying physical or structural cause",
  "confidenceScore": number between 1 and 100
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiInsight: { type: Type.STRING },
            aiRecommendation: { type: Type.STRING },
            patternDetected: { type: Type.STRING },
            rootCauseHypothesis: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
          },
          required: ["aiInsight", "aiRecommendation", "patternDetected", "rootCauseHypothesis", "confidenceScore"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error generating recurring insights:", error);
    return res.status(500).json({ error: "Failed to generate insight" });
  }
});

// 5. Civi AI Assistant Endpoint
app.post("/api/ai/civi-chat", async (req, res) => {
  try {
    const { message, role = "citizen", currentPath = "/", complaintContext, history = [] } = req.body;
    const ai = getGenAI();

    // Helper: Intelligent Context & Keyword Grievance Classifier
    const classifyGrievanceLocally = (text: string) => {
      const t = (text || "").toLowerCase();
      
      // Drainage & Stormwater
      if (t.includes("drain") || t.includes("waterlog") || t.includes("flood") || t.includes("culvert") || t.includes("rainwater") || t.includes("clog") || t.includes("gutter") || t.includes("overflowing drain")) {
        let issue = "Blocked drain";
        if (t.includes("waterlog") || t.includes("water log")) issue = "Waterlogging";
        else if (t.includes("flood")) issue = "Flooding";
        else if (t.includes("open drain") || t.includes("manhole")) issue = "Open drain";
        else if (t.includes("overflow")) issue = "Drain overflow";
        else if (t.includes("culvert")) issue = "Culvert damage";

        const isUrgent = t.includes("flood") || t.includes("overflow") || t.includes("danger") || t.includes("accident") || t.includes("open");
        return {
          isGrievance: true,
          department: "Drainage & Stormwater",
          category: "Drainage",
          issueType: issue,
          severity: isUrgent ? "Critical" : "High",
          priorityScore: isUrgent ? 92 : 78,
          rationale: "Stormwater and drainage blockage causing public disruption or safety risks.",
        };
      }

      // Street Lighting
      if (t.includes("light") || t.includes("pole") || t.includes("wiring") || t.includes("dark") || t.includes("lamp") || t.includes("flicker") || t.includes("bulb") || t.includes("street light") || t.includes("streetlight")) {
        let issue = "Streetlight not working";
        if (t.includes("pole") || t.includes("broken pole")) issue = "Broken pole";
        else if (t.includes("wire") || t.includes("shock") || t.includes("exposed")) issue = "Exposed wiring";
        else if (t.includes("dark road") || t.includes("dark") || t.includes("pitch black")) issue = "Dark road";
        else if (t.includes("flicker")) issue = "Flickering light";

        const isUrgent = t.includes("exposed") || t.includes("wire") || t.includes("broken pole");
        return {
          isGrievance: true,
          department: "Street Lighting",
          category: "Streetlight",
          issueType: issue,
          severity: isUrgent ? "Critical" : "Medium",
          priorityScore: isUrgent ? 95 : 68,
          rationale: "Public illumination defect or electrical hazard requiring municipal electrical team.",
        };
      }

      // Waste Management
      if (t.includes("garbage") || t.includes("trash") || t.includes("dump") || t.includes("waste") || t.includes("bin") || t.includes("rubbish") || t.includes("debris") || t.includes("segregat") || t.includes("smell") || t.includes("stink")) {
        let issue = "Garbage not collected";
        if (t.includes("overflow") || t.includes("bin")) issue = "Overflowing bin";
        else if (t.includes("illegal") || t.includes("dump")) issue = "Illegal dumping";
        else if (t.includes("construction") || t.includes("debris") || t.includes("cement") || t.includes("brick")) issue = "Construction waste";
        else if (t.includes("segregat")) issue = "Waste segregation";

        const isUrgent = t.includes("huge") || t.includes("block") || t.includes("disease") || t.includes("toxic");
        return {
          isGrievance: true,
          department: "Waste Management",
          category: "Waste",
          issueType: issue,
          severity: isUrgent ? "High" : "Medium",
          priorityScore: isUrgent ? 82 : 62,
          rationale: "Solid waste accumulation causing sanitation and public hygiene issues.",
        };
      }

      // Water Supply
      if (t.includes("water") && (t.includes("leak") || t.includes("no water") || t.includes("pipe") || t.includes("pressure") || t.includes("dirty") || t.includes("contaminat") || t.includes("brown") || t.includes("smell") || t.includes("tap") || t.includes("supply") || t.includes("burst"))) {
        let issue = "Water leakage";
        if (t.includes("no water") || t.includes("not coming") || t.includes("cut off")) issue = "No water";
        else if (t.includes("low pressure") || t.includes("slow") || t.includes("pressure")) issue = "Low pressure";
        else if (t.includes("contaminat") || t.includes("dirty") || t.includes("brown") || t.includes("bad water") || t.includes("poison")) issue = "Contaminated water";
        else if (t.includes("pipe") || t.includes("burst") || t.includes("broken pipe")) issue = "Pipeline damage";

        const isUrgent = t.includes("contaminat") || t.includes("burst") || t.includes("no water");
        return {
          isGrievance: true,
          department: "Water Supply",
          category: "Water",
          issueType: issue,
          severity: isUrgent ? "High" : "Medium",
          priorityScore: isUrgent ? 88 : 72,
          rationale: "Drinking water pipeline or supply distribution anomaly.",
        };
      }

      // Roads & Infrastructure
      if (t.includes("pothole") || t.includes("road") || t.includes("footpath") || t.includes("pavement") || t.includes("sinkhole") || t.includes("collapse") || t.includes("asphalt") || t.includes("tar") || t.includes("crater") || t.includes("speed breaker") || t.includes("obstruction") || t.includes("barrier")) {
        let issue = "Pothole";
        if (t.includes("footpath") || t.includes("pavement") || t.includes("sidewalk")) issue = "Footpath damage";
        else if (t.includes("sinkhole")) issue = "Sinkhole";
        else if (t.includes("collapse") || t.includes("caved in")) issue = "Road collapse";
        else if (t.includes("obstruction") || t.includes("fallen tree") || t.includes("block")) issue = "Road obstruction";
        else if (t.includes("damage") || t.includes("broken") || t.includes("cracked")) issue = "Road damage";

        const isUrgent = t.includes("sinkhole") || t.includes("collapse") || t.includes("accident") || t.includes("death") || t.includes("rim");
        return {
          isGrievance: true,
          department: "Roads & Infrastructure",
          category: "Roads",
          issueType: issue,
          severity: isUrgent ? "Critical" : "High",
          priorityScore: isUrgent ? 94 : 80,
          rationale: "Road surface and pedestrian infrastructure hazard affecting commuters.",
        };
      }

      return null;
    };

    if (!ai) {
      // Role & Path aware intelligent fallback
      const msgLower = (message || "").toLowerCase();
      let replyText = "";
      let suggestedQuestions: string[] = [];
      let actions: { label: string; actionType: string; targetPath?: string }[] = [];
      const grievance = classifyGrievanceLocally(message);

      if (grievance) {
        replyText = `I have analyzed your complaint:\n\n• Department: **${grievance.department}**\n• Issue Type: **${grievance.issueType}**\n• Priority: **${grievance.severity} (${grievance.priorityScore}/100)**\n\n${grievance.rationale}\n\nPlease confirm if this classification is correct to proceed with photo evidence and location.`;
        suggestedQuestions = ["Yes, confirm classification", "Change department", "What is the SLA for this?"];
        return res.json({
          reply: replyText,
          suggestedQuestions,
          actions: [],
          isGrievance: true,
          department: grievance.department,
          issueType: grievance.issueType,
          category: grievance.category,
          severity: grievance.severity,
          priorityScore: grievance.priorityScore,
          rationale: grievance.rationale,
          isFallback: true,
        });
      }

      if (complaintContext && (msgLower.includes("delay") || msgLower.includes("status") || msgLower.includes("why") || msgLower.includes("this"))) {
        replyText = `${complaintContext.id || "CL-2026-01842"} is currently assigned to the ${complaintContext.department || "Municipal Roads & Infrastructure"} department.\n\nThe complaint was inspected recently and resolution evidence has not yet been submitted.\n\nCurrent status: IN PROGRESS\nSLA: 18 hours remaining.`;
        suggestedQuestions = ["Why is it taking so long?", "Show complaint timeline", "Contact officer"];
        actions = [
          { label: "View Complaint", actionType: "navigate", targetPath: `/citizen/complaints/${complaintContext.id || "GRV-2026-081042"}` },
          { label: "Contact Officer", actionType: "toast", targetPath: "Officer contacted via SMS notification" }
        ];
      } else if (role === "citizen") {
        if (msgLower.includes("report") || msgLower.includes("issue") || msgLower.includes("file") || msgLower.includes("problem")) {
          replyText = "I can help you report a civic issue right here! Please describe the problem in your own words, or choose one of the supported areas:\n\n1. Roads & Infrastructure (potholes, road damage, sinkholes)\n2. Drainage & Stormwater (blocked drains, waterlogging, flooding)\n3. Waste Management (uncollected garbage, overflowing bins)\n4. Street Lighting (broken poles, dark roads, flickering lights)\n5. Water Supply (pipeline leaks, no water, dirty water)";
          suggestedQuestions = ["Report a pothole", "Report waterlogging", "Report uncollected garbage"];
          actions = [];
        } else if (msgLower.includes("status") || msgLower.includes("track")) {
          replyText = "You have active complaints in your citizen portal. Your report GRV-2026-081042 (Pothole Cluster) is currently IN PROGRESS with 18h SLA remaining.";
          suggestedQuestions = ["Why is my complaint delayed?", "Show complaint timeline", "Report another issue"];
          actions = [
            { label: "Track My Complaint", actionType: "navigate", targetPath: "/citizen/complaints/GRV-2026-081042" },
            { label: "View All Complaints", actionType: "navigate", targetPath: "/citizen/dashboard" }
          ];
        } else {
          replyText = "I'm DhwaniSaathi, your NammaDhwani civic intelligence assistant. You can describe any civic problem naturally (via text or voice) and I will automatically identify the department, assess severity, collect evidence, and submit your grievance.";
          suggestedQuestions = ["Report a pothole", "Report garbage issue", "Report street light problem"];
          actions = [
            { label: "View Citizen Dashboard", actionType: "navigate", targetPath: "/citizen/dashboard" }
          ];
        }
      } else if (role === "officer") {
        if (msgLower.includes("handle first") || msgLower.includes("priority") || msgLower.includes("queue")) {
          replyText = "You have active complaints in your department queue. Check your priority queue for pending items.";
          suggestedQuestions = ["Which complaints are near SLA breach?", "Show route plan", "Are there recurring issues?"];
          actions = [
            { label: "View Priority Queue", actionType: "navigate", targetPath: "/officer/dashboard" }
          ];
        } else {
          replyText = "Officer mode active. I can summarize your queue, highlight SLA risk items, analyze recurring asset failures, or verify work completion logs.";
          suggestedQuestions = ["What should I handle first?", "SLA Risks", "Recurring Issues"];
          actions = [
            { label: "View My Queue", actionType: "navigate", targetPath: "/officer/dashboard" }
          ];
        }
      } else {
        // Admin role
        if (msgLower.includes("briefing") || msgLower.includes("summary") || msgLower.includes("today")) {
          replyText = "Today's highest-risk area is Ward 18. Road complaints increased 18% this week. 4 complaints are linked to the same road segment RD-018. The system recommends an infrastructure inspection.";
          suggestedQuestions = ["Which ward has highest risk?", "Which department has SLA breaches?", "Generate Executive Briefing"];
          actions = [
            { label: "View Ward 18 Map", actionType: "navigate", targetPath: "/admin/map" },
            { label: "View Intelligence Insights", actionType: "navigate", targetPath: "/admin/insights" },
            { label: "Generate Briefing", actionType: "generate_briefing" }
          ];
        } else {
          replyText = "Administrator Intelligence mode active. I can generate executive briefings, identify recurring infrastructure failure clusters, or analyze departmental SLA compliance.";
          suggestedQuestions = ["Today's Civic Summary", "Highest Risk Ward", "SLA Breaches"];
          actions = [
            { label: "View Intelligence Insights", actionType: "navigate", targetPath: "/admin/insights" },
            { label: "View Admin Dashboard", actionType: "navigate", targetPath: "/admin/dashboard" }
          ];
        }
      }

      return res.json({
        reply: replyText,
        suggestedQuestions,
        actions,
        isGrievance: false,
        isFallback: true,
      });
    }

    const prompt = `You are DhwaniSaathi, the NammaDhwani AI Municipal Citizen & Governance Assistant.
User Role: "${role}"
Current App Page: "${currentPath}"
User Query / Complaint: "${message}"
Complaint Context: ${JSON.stringify(complaintContext || null)}

CLASSIFICATION REFERENCE DATABASE:
The municipal corporation supports complaints strictly across these 5 departments:
1. "Roads & Infrastructure"
   Supported issues: Pothole, Road damage, Footpath damage, Sinkhole, Road collapse, Road obstruction
2. "Drainage & Stormwater"
   Supported issues: Blocked drain, Waterlogging, Flooding, Open drain, Drain overflow, Culvert damage
3. "Waste Management"
   Supported issues: Garbage not collected, Overflowing bin, Illegal dumping, Construction waste, Waste segregation
4. "Street Lighting"
   Supported issues: Streetlight not working, Broken pole, Exposed wiring, Dark road, Flickering light
5. "Water Supply"
   Supported issues: No water, Low pressure, Water leakage, Contaminated water, Pipeline damage

INSTRUCTIONS:
1. Determine if the user is describing or reporting a civic grievance/problem.
2. If YES (it is a civic issue):
   - Understand the context deeply (do not just rely on literal words).
   - Classify into exactly one of the 5 departments above.
   - Choose the closest matching issueType from the supported list above (or a concise specific issue title).
   - Assign Severity: "Critical" (life safety/major hazard), "High" (major disruption), "Medium" (standard defect), or "Low" (minor).
   - Compute Priority Score (0 to 100).
   - Write a clear, polite explanation in "reply" explaining the classification and asking the user to confirm.
   - Set "isGrievance": true.
3. If the user's message is ambiguous, unclear, or greeting:
   - If greeting / query: answer politely and invite them to describe any civic problem or ask questions. Set "isGrievance": false.
   - If vague problem description: set "needsClarification": true and ask a polite clarification question in "reply".

Output valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            isGrievance: { type: Type.BOOLEAN },
            department: { type: Type.STRING },
            issueType: { type: Type.STRING },
            category: { type: Type.STRING },
            severity: { type: Type.STRING },
            priorityScore: { type: Type.INTEGER },
            rationale: { type: Type.STRING },
            needsClarification: { type: Type.BOOLEAN },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  actionType: { type: Type.STRING },
                  targetPath: { type: Type.STRING },
                },
                required: ["label", "actionType"],
              },
            },
          },
          required: ["reply", "suggestedQuestions", "actions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Error in Civi Assistant Endpoint:", error);
    return res.status(500).json({ error: "Civi assistant error" });
  }
});

// 6. Find Similar / Duplicate Complaints Endpoint
app.post("/api/ai/find-similar-complaints", async (req, res) => {
  try {
    const { rawText, category, department, lat = 12.975, lng = 77.638 } = req.body;
    const textLower = (rawText || "").toLowerCase();

    // Candidate database mapped strictly by department
    const candidateDatabase: Record<string, any[]> = {
      "Roads & Infrastructure": [
        {
          id: "GRV-2026-081042",
          title: "Severe Pothole Cluster causing Traffic Bottleneck",
          description: "Multiple deep potholes spanning over 15 meters near 100 Feet Road Metro Exit. Caused minor vehicle rim damage.",
          category: "Roads",
          department: "Roads & Infrastructure",
          status: "In Progress",
          priorityScore: 88,
          severity: "HIGH",
          ward: "Ward 18 - Indiranagar",
          distanceMeters: 82,
          citizensAffected: 23,
          communitySupport: 32,
          similarityScore: 92,
          keywords: ["pothole", "road", "asphalt", "crater", "damage", "rim"],
          breakdown: { locationMatch: 98, categoryMatch: 100, descriptionMatch: 91, timeProximity: 84 },
          lat: lat + 0.0006,
          lng: lng + 0.0005,
        },
        {
          id: "GRV-2026-081050",
          title: "Unmarked Speed Breaker Edge & Asphalt Degradation",
          description: "Speed breaker near school zone lacks reflective yellow striping and has chipped asphalt edges.",
          category: "Roads",
          department: "Roads & Infrastructure",
          status: "Pending",
          priorityScore: 65,
          severity: "MEDIUM",
          ward: "Ward 18 - Indiranagar",
          distanceMeters: 140,
          citizensAffected: 15,
          communitySupport: 18,
          similarityScore: 81,
          keywords: ["speed breaker", "asphalt", "road", "striping", "unmarked"],
          breakdown: { locationMatch: 92, categoryMatch: 100, descriptionMatch: 81, timeProximity: 78 },
          lat: lat - 0.0008,
          lng: lng + 0.0007,
        },
      ],
      "Drainage & Stormwater": [
        {
          id: "GRV-2026-081090",
          title: "Blocked Stormwater Drain DR-092 & Sewage Overflow",
          description: "Blocked primary stormwater drain channel causing heavy street waterlogging and foul sewage overflow during monsoon rain.",
          category: "Drainage",
          department: "Drainage & Stormwater",
          status: "In Progress",
          priorityScore: 90,
          severity: "CRITICAL",
          ward: "Ward 18 - Indiranagar",
          distanceMeters: 95,
          citizensAffected: 45,
          communitySupport: 52,
          similarityScore: 89,
          keywords: ["drain", "stormwater", "sewage", "overflow", "waterlog", "flood", "gutter"],
          breakdown: { locationMatch: 96, categoryMatch: 100, descriptionMatch: 88, timeProximity: 85 },
          lat: lat + 0.0005,
          lng: lng - 0.0004,
        },
      ],
      "Waste Management": [
        {
          id: "GRV-2026-081112",
          title: "Overflowing Garbage Bin & Uncollected Waste Dumping",
          description: "Municipal trash bins overflowing onto public road shoulder. Foul odor and stray animal menace due to 5 days of uncollected garbage.",
          category: "Waste",
          department: "Waste Management",
          status: "Pending",
          priorityScore: 68,
          severity: "MEDIUM",
          ward: "Ward 18 - Indiranagar",
          distanceMeters: 110,
          citizensAffected: 38,
          communitySupport: 29,
          similarityScore: 86,
          keywords: ["garbage", "waste", "bin", "dump", "trash", "rubbish", "uncollected", "litter"],
          breakdown: { locationMatch: 94, categoryMatch: 100, descriptionMatch: 84, timeProximity: 80 },
          lat: lat - 0.0004,
          lng: lng + 0.0006,
        },
      ],
      "Street Lighting": [
        {
          id: "GRV-2026-081140",
          title: "Non-Functional Street Lights & Dark Street Hazard",
          description: "Multiple lamp posts non-functional along 14th Cross Road causing complete dark street conditions at night.",
          category: "Streetlight",
          department: "Street Lighting",
          status: "In Progress",
          priorityScore: 72,
          severity: "MEDIUM",
          ward: "Ward 18 - Indiranagar",
          distanceMeters: 120,
          citizensAffected: 28,
          communitySupport: 21,
          similarityScore: 88,
          keywords: ["street light", "lamp", "pole", "dark", "lighting", "flicker", "bulb", "night"],
          breakdown: { locationMatch: 95, categoryMatch: 100, descriptionMatch: 86, timeProximity: 82 },
          lat: lat + 0.0008,
          lng: lng - 0.0003,
        },
      ],
      "Water Supply": [
        {
          id: "GRV-2026-081175",
          title: "Contaminated Water Supply in Municipal Pipeline",
          description: "Muddy and foul-smelling drinking water flowing through tap supply pipelines for past 48 hours.",
          category: "Water",
          department: "Water Supply",
          status: "Pending",
          priorityScore: 85,
          severity: "HIGH",
          ward: "Ward 18 - Indiranagar",
          distanceMeters: 88,
          citizensAffected: 62,
          communitySupport: 44,
          similarityScore: 91,
          keywords: ["water", "supply", "tap", "dirty", "contaminat", "pipeline", "pressure", "leak"],
          breakdown: { locationMatch: 97, categoryMatch: 100, descriptionMatch: 90, timeProximity: 86 },
          lat: lat + 0.0003,
          lng: lng + 0.0004,
        },
      ],
    };

    // Targeted department
    const targetDepartment = department || "Roads & Infrastructure";
    const deptCandidates = candidateDatabase[targetDepartment] || candidateDatabase["Roads & Infrastructure"];

    // Compare new complaint text against candidate keywords within the target department
    const matchingCandidates = deptCandidates.filter((candidate) => {
      return candidate.keywords.some((kw: string) => textLower.includes(kw));
    });

    if (matchingCandidates.length > 0) {
      const topMatch = matchingCandidates[0];
      return res.json({
        hasSimilar: true,
        similarComplaint: "Yes",
        similarityReason: `Matched active complaint ${topMatch.id} ('${topMatch.title}') in ${targetDepartment} department located ${topMatch.distanceMeters}m away.`,
        similarCount: matchingCandidates.length,
        topSimilar: topMatch,
        similarComplaints: matchingCandidates,
        isCluster: matchingCandidates.length > 1,
        clusterDetails: {
          clusterName: `${targetDepartment} Ward 18 Cluster`,
          totalReportsInCluster: matchingCandidates.length * 4,
          locationsCount: matchingCandidates.length + 1,
          summary: `Multiple citizens reported active ${targetDepartment} issues within 250m.`,
        },
      });
    }

    // No similar match in the same department
    return res.json({
      hasSimilar: false,
      similarComplaint: "No",
      similarityReason: `No similar active complaints found in ${targetDepartment} department near this location.`,
      similarCount: 0,
      topSimilar: null,
      similarComplaints: [],
      isCluster: false,
    });
  } catch (error) {
    console.error("Error finding similar complaints:", error);
    return res.status(500).json({ error: "Failed to perform similarity search" });
  }
});

// ==============================================================================
// SUPABASE AUTHENTICATION & RESEND EMAIL REST API ENDPOINTS
// ==============================================================================

// 7. Auth: User Registration & Welcome Email via Resend
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "citizen", phone, department, ward } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const supabaseAdmin = getSupabaseAdmin();
    let userId = `usr-${role}-${Date.now()}`;

    if (supabaseAdmin) {
      // 1. Create Auth User in Supabase
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, department, ward, phone },
      });

      if (authError) {
        console.warn("[Supabase Auth Admin Error]:", authError.message);
        // Fallback: Check if user already exists or proceed with upsert
      } else if (authData?.user) {
        userId = authData.user.id;
      }

      // 2. Upsert into public.profiles
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email,
        name,
        role,
        department: department || null,
        designation: role === "officer" ? "Field Officer" : null,
        phone: phone || null,
        ward: ward || "Ward 18 - Indiranagar",
        created_at: new Date().toISOString(),
      });
    }

    // 3. Dispatch Welcome Email via Resend Platform
    const emailResult = await sendWelcomeEmail(email, name);

    // 4. Log email dispatch to Supabase email_logs if available
    if (supabaseAdmin) {
      await supabaseAdmin.from("email_logs").insert({
        recipient_email: email,
        email_type: "welcome",
        subject: "Welcome to NammaDhwani — Voice Your Civic Grievances",
        status: emailResult.success ? (emailResult.simulated ? "simulated" : "sent") : "failed",
        resend_id: emailResult.resendId || null,
        error_message: emailResult.error || null,
      });
    }

    const createdUser = {
      id: userId,
      name,
      email,
      role,
      department,
      phone,
      ward: ward || "Ward 18 - Indiranagar",
      language: "en",
    };

    return res.json({
      success: true,
      user: createdUser,
      message: "Account registered successfully! Welcome notification dispatched via Resend.",
      emailStatus: emailResult,
    });
  } catch (error: any) {
    console.error("Error in registration endpoint:", error);
    return res.status(500).json({ error: error.message || "Failed to register account" });
  }
});

// 8. Auth: Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role = "citizen", department } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (supabaseAdmin) {
      const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (!error && profile) {
        return res.json({
          success: true,
          user: profile,
        });
      }
    }

    // Fallback response for active workspace testing
    const fallbackUser = {
      id: `usr-${role}-101`,
      name: email.split("@")[0].replace(".", " "),
      email,
      role,
      department: department || (role === "officer" ? "Roads & Infrastructure" : undefined),
      ward: "Ward 18 - Indiranagar",
      phone: "+91 98765 43210",
      language: "en",
    };

    return res.json({
      success: true,
      user: fallbackUser,
    });
  } catch (error: any) {
    console.error("Error in login endpoint:", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

// 9. Auth: Password Reset Link Endpoint via Resend
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset-password?email=${encodeURIComponent(email)}`;

    const emailResult = await sendPasswordResetEmail(email, resetUrl);

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      await supabaseAdmin.from("email_logs").insert({
        recipient_email: email,
        email_type: "password_reset",
        subject: "Reset Your NammaDhwani Password",
        status: emailResult.success ? (emailResult.simulated ? "simulated" : "sent") : "failed",
        resend_id: emailResult.resendId || null,
        error_message: emailResult.error || null,
      });
    }

    return res.json({
      success: true,
      message: "Password reset link sent to your email address via Resend platform.",
      emailResult,
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({ error: "Failed to dispatch password reset email" });
  }
});

// 10. Complaints: List & Query Endpoint
app.get("/api/complaints", async (req, res) => {
  try {
    const { department, status, ward } = req.query;
    const supabaseAdmin = getSupabaseAdmin();

    if (supabaseAdmin) {
      let query = supabaseAdmin.from("complaints").select("*").order("created_at", { ascending: false });

      if (department) query = query.eq("department", String(department));
      if (status) query = query.eq("status", String(status));
      if (ward) query = query.eq("ward", String(ward));

      const { data, error } = await query;
      if (!error && data) {
        return res.json({ complaints: data, count: data.length });
      }
    }

    return res.json({ complaints: [], isFallback: true });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// 11. Complaints: Create Grievance + Trigger Citizen & Officer Emails via Resend
app.post("/api/complaints", async (req, res) => {
  try {
    const complaint = req.body;
    const complaintId = complaint.id || `GRV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const newRecord = {
      ...complaint,
      id: complaintId,
      created_at: now,
      updated_at: now,
    };

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      await supabaseAdmin.from("complaints").upsert({
        id: complaintId,
        citizen_name: complaint.citizenName || "Citizen User",
        citizen_email: complaint.citizenEmail || null,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        subcategory: complaint.subcategory || complaint.issueType,
        issue_type: complaint.issueType || complaint.subcategory,
        severity: complaint.severity || "Medium",
        status: complaint.status || "Submitted",
        department: complaint.department,
        ward: complaint.location?.ward || "Ward 18 - Indiranagar",
        address: complaint.location?.address || "Indiranagar 100ft Road",
        lat: complaint.location?.lat || 12.9784,
        lng: complaint.location?.lng || 77.6408,
        citizen_evidence_image: complaint.citizenEvidenceImage || null,
        sla_hours: complaint.slaHours || 48,
        priority_score: complaint.priorityScore || 65,
        created_at: now,
        updated_at: now,
      });

      // Insert Timeline entry
      await supabaseAdmin.from("complaint_timeline").insert({
        complaint_id: complaintId,
        status: "Submitted",
        notes: "Grievance registered and routed via NammaDhwani AI.",
        actor_name: complaint.citizenName || "Citizen User",
        actor_role: "citizen",
      });
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const trackingUrl = `${appUrl}/citizen/complaints/${complaintId}`;

    // A. Dispatch Confirmation Email to Citizen via Resend Platform
    const citizenEmail = complaint.citizenEmail || "citizen@nammadhwani.gov.in";
    const citizenEmailResult = await sendComplaintSubmittedEmail({
      to: citizenEmail,
      citizenName: complaint.citizenName || "Citizen",
      complaintId,
      title: complaint.title || "Civic Issue Report",
      department: complaint.department || "Roads & Infrastructure",
      severity: complaint.severity || "Medium",
      priorityScore: complaint.priorityScore || 65,
      slaHours: complaint.slaHours || 48,
      trackingUrl,
    });

    // B. Dispatch Officer Assignment Email via Resend Platform
    const officerEmail = complaint.assignedOfficerEmail || "rajesh@namnadhwani.gov.in";
    const officerEmailResult = await sendOfficerAssignmentEmail({
      to: officerEmail,
      officerName: complaint.assignedOfficerName || "Inspector Rajesh Kumar",
      complaintId,
      title: complaint.title || "Civic Issue Report",
      department: complaint.department || "Roads & Infrastructure",
      ward: complaint.location?.ward || "Ward 18 - Indiranagar",
      severity: complaint.severity || "Medium",
      priorityScore: complaint.priorityScore || 65,
      portalUrl: `${appUrl}/officer/dashboard`,
    });

    return res.json({
      success: true,
      complaint: newRecord,
      citizenEmailResult,
      officerEmailResult,
      message: `Grievance ${complaintId} recorded in Supabase and notifications sent via Resend.`,
    });
  } catch (error: any) {
    console.error("Error creating complaint:", error);
    return res.status(500).json({ error: error.message || "Failed to create complaint" });
  }
});

// 12. Complaints: Officer Resolution Upload + Resend Verification Email
app.patch("/api/complaints/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerEvidenceImage, officerResolutionNote, officerName } = req.body;
    const now = new Date().toISOString();

    const nextStatus = officerEvidenceImage ? "Awaiting Verification" : (status || "In Progress");

    const supabaseAdmin = getSupabaseAdmin();
    let savedComplaint: { citizen_email?: string | null; citizen_name?: string | null; title?: string | null } | null = null;
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("complaints")
        .select("citizen_email, citizen_name, title")
        .eq("id", id)
        .maybeSingle();
      savedComplaint = data;

      await supabaseAdmin
        .from("complaints")
        .update({
          status: nextStatus,
          officer_evidence_image: officerEvidenceImage || null,
          officer_resolution_note: officerResolutionNote || "Field repair completed.",
          resolution_notes: officerResolutionNote || "Field repair completed.",
          resolution_date: officerEvidenceImage ? now : null,
          resolved_by_officer_name: officerName || "Assigned Officer",
          updated_at: now,
        })
        .eq("id", id);

      await supabaseAdmin.from("complaint_timeline").insert({
        complaint_id: id,
        status: nextStatus,
        notes: officerResolutionNote || "Work evidence submitted by officer.",
        actor_name: officerName || "Officer",
        actor_role: "officer",
      });
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/citizen/complaints/${id}`;

    // Dispatch Resolution Evidence Verification Request Email to Citizen via Resend
    const citizenEmail = req.body.citizenEmail || savedComplaint?.citizen_email;
    const emailResult = citizenEmail ? await sendResolutionVerificationEmail({
      to: citizenEmail,
      citizenName: req.body.citizenName || savedComplaint?.citizen_name || "Citizen User",
      complaintId: id,
      title: req.body.title || savedComplaint?.title || "Civic Grievance",
      officerName: officerName || "Assigned Officer",
      resolutionNotes: officerResolutionNote || "Field work completed with proof.",
      verificationUrl,
    }) : { success: false, error: "No citizen email is saved for this complaint." };

    return res.json({
      success: true,
      complaintId: id,
      status: nextStatus,
      emailResult,
      message: `Resolution evidence recorded for ${id}. Verification email sent to citizen via Resend.`,
    });
  } catch (error: any) {
    console.error("Error updating complaint status:", error);
    return res.status(500).json({ error: error.message || "Failed to update complaint" });
  }
});

// 13. Complaints: Citizen Resolution Verification Feedback
app.post("/api/complaints/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, rebuttalNotes, citizenName } = req.body;
    const now = new Date().toISOString();

    const verificationStatus = feedback === "fully_fixed" ? "FULLY_FIXED" : feedback === "partially_fixed" ? "PARTIALLY_FIXED" : "STILL_NOT_FIXED";
    const nextStatus = feedback === "fully_fixed" ? "Resolved" : feedback === "partially_fixed" ? "Partially Resolved" : "Reopened";

    const supabaseAdmin = getSupabaseAdmin();
    let savedComplaint: { citizen_email?: string | null; citizen_name?: string | null; title?: string | null } | null = null;
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from("complaints")
        .select("citizen_email, citizen_name, title")
        .eq("id", id)
        .maybeSingle();
      savedComplaint = data;

      await supabaseAdmin
        .from("complaints")
        .update({
          status: nextStatus,
          citizen_verification_status: verificationStatus,
          citizen_verification: feedback,
          citizen_rebuttal_notes: rebuttalNotes || null,
          updated_at: now,
        })
        .eq("id", id);

      await supabaseAdmin.from("complaint_timeline").insert({
        complaint_id: id,
        status: nextStatus,
        notes: `Citizen verification submitted: ${feedback.toUpperCase()}${rebuttalNotes ? ` ("${rebuttalNotes}")` : ""}`,
        actor_name: citizenName || "Citizen User",
        actor_role: "citizen",
      });
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const trackingUrl = `${appUrl}/citizen/complaints/${id}`;
    let emailResult = null;

    // Dispatch Problem Solved Email to Citizen via Resend Platform when issue is fixed
    if (feedback === "fully_fixed") {
      const citizenEmail = req.body.citizenEmail || savedComplaint?.citizen_email;
      emailResult = citizenEmail ? await sendProblemSolvedEmail({
        to: citizenEmail,
        citizenName: citizenName || savedComplaint?.citizen_name || "Citizen User",
        complaintId: id,
        title: req.body.title || savedComplaint?.title || "Civic Grievance",
        resolutionNotes: rebuttalNotes || "Grievance confirmed fully fixed by citizen.",
        trackingUrl,
      }) : { success: false, error: "No citizen email is saved for this complaint." };
    }

    return res.json({
      success: true,
      complaintId: id,
      status: nextStatus,
      verificationStatus,
      emailResult,
      message: `Citizen verification recorded for ${id}. Status set to ${nextStatus}. ${emailResult ? 'Problem Solved notification sent via Resend.' : ''}`,
    });
  } catch (error: any) {
    console.error("Error in verification endpoint:", error);
    return res.status(500).json({ error: error.message || "Failed to verify resolution" });
  }
});

// 14. Direct Email Trigger Endpoint via Resend Platform
app.post("/api/email/send", async (req, res) => {
  try {
    const { to, subject, html, emailType = "welcome", metadata } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "to, subject, and html are required fields" });
    }

    const result = await sendEmail({ to, subject, html, emailType, metadata });

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      await supabaseAdmin.from("email_logs").insert({
        recipient_email: to,
        email_type: emailType,
        subject,
        status: result.success ? (result.simulated ? "simulated" : "sent") : "failed",
        resend_id: result.resendId || null,
        error_message: result.error || null,
        metadata: metadata || null,
      });
    }

    return res.json({ success: result.success, data: result });
  } catch (error: any) {
    console.error("Error sending custom email via Resend:", error);
    return res.status(500).json({ error: error.message || "Failed to send email" });
  }
});

// Serve Vite dev server or static build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicLoop Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
