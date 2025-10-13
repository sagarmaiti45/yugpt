/**
 * Summary Preset Prompts for YuGPT
 * Each preset defines a specific way to analyze and summarize video content
 *
 * Variables available:
 * - {{TITLE}} - Video title
 * - {{CHANNEL}} - Channel name
 * - {{URL}} - Video URL
 * - {{TRANSCRIPT}} - Video transcript
 * - {{DURATION}} - Video duration
 * - {{CHUNK_NUMBER}} - Current chunk number (for chunked processing)
 * - {{TOTAL_CHUNKS}} - Total number of chunks
 */

export const SUMMARY_PRESETS = {
  'general-summary': {
    id: 'general-summary',
    name: '✨ General Summary',
    category: 'general',
    description: 'Complete overview with key points and takeaways',
    prompt: `Create a comprehensive summary of this video that captures all essential information.

Video: {{TITLE}}
Channel: {{CHANNEL}}
Duration: {{DURATION}}

Transcript:
{{TRANSCRIPT}}

Instructions:
Provide a thorough, well-structured summary that includes:

1. **Overview**: What is this video about? (2-3 sentences)
2. **Main Topic**: Central theme or subject matter
3. **Key Points**: Extract and organize all major points discussed
4. **Important Details**: Notable facts, statistics, or insights mentioned
5. **Examples & Stories**: Significant examples or anecdotes shared
6. **Conclusions**: Main takeaways and final thoughts
7. **Practical Value**: What viewers should learn or do after watching

Format your response with clear sections, bullet points for readability, and include relevant timestamps [🔗 MM:SS] for key moments.

Make the summary:
- Comprehensive yet concise
- Well-organized with clear headings
- Easy to scan and understand
- Actionable where applicable
- Objective and accurate to the content

Output Format:
# 📋 Video Summary

## 🎯 Overview
[2-3 sentence summary of what this video covers]

## 📌 Main Topic
[Central theme or subject]

## 🔑 Key Points
1. **[Point 1]** [🔗 Timestamp]
   - Supporting detail or context
   - Why this matters

2. **[Point 2]** [🔗 Timestamp]
   - Supporting detail
   - Relevant insight

3. **[Point 3]** [🔗 Timestamp]
   - Details
   - Implications

[Continue with all key points...]

## 💡 Important Insights
- **[Insight 1]**: [Explanation] [🔗 Timestamp]
- **[Insight 2]**: [Explanation] [🔗 Timestamp]
- **[Insight 3]**: [Explanation] [🔗 Timestamp]

## 📖 Notable Examples & Stories
- [Story/Example 1]: [Brief description] [🔗 Timestamp]
- [Story/Example 2]: [Brief description] [🔗 Timestamp]

## 🎓 Key Takeaways
1. [Main takeaway 1]
2. [Main takeaway 2]
3. [Main takeaway 3]

## ✅ Action Items (if applicable)
□ [Actionable item 1]
□ [Actionable item 2]
□ [Actionable item 3]

## 🔍 Conclusion
[Final summary - what's the main message or value of this video?]`
  },

  'extract-quotes': {
    id: 'extract-quotes',
    name: '💬 Extract Quotes',
    category: 'students',
    description: 'Extract memorable quotes with exact timestamps',
    prompt: `Extract all notable quotes from this video transcript.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Find ALL memorable, insightful, or important quotes
2. Include EXACT timestamps in format [MM:SS] or [HH:MM:SS]
3. Include the speaker name if identifiable
4. Group quotes by theme if applicable
5. Format each quote with markdown blockquote (>)
6. Add context before/after quote if needed for clarity
7. Prioritize: profound statements, expert insights, surprising facts, memorable phrases
8. Include both start and end timestamps for longer quotes

Output format:
## [Theme/Topic]
> "[Exact quote here]"
> — Speaker (if known) [START_TIME - END_TIME]
> *Context: Brief context if needed*

Make timestamps clickable by formatting as: [🔗 MM:SS](timestamp)`
  },

  'how-to-steps': {
    id: 'how-to-steps',
    name: '📚 How-To Steps',
    category: 'students',
    description: 'Convert tutorials into step-by-step instructions',
    prompt: `Convert this video into a clear step-by-step tutorial guide.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Identify the main goal/outcome of the tutorial
2. Extract clear, actionable steps in chronological order
3. Include timestamps for each major step
4. Note any prerequisites, tools, or materials needed
5. Highlight warnings, tips, or common mistakes
6. Add time estimates for each step if mentioned
7. Include any measurements, settings, or specific values
8. Create a "Quick Reference" section at the end

Output format:
# How to: [Main Goal]

## Prerequisites/Materials
- List all requirements
- Tools needed
- Prior knowledge required

## Step-by-Step Instructions

### Step 1: [Action] [🔗 Timestamp]
- Detailed instruction
- Specific measurements/settings
- ⚠️ Warnings or tips
- ⏱️ Time estimate: X minutes

### Step 2: [Action] [🔗 Timestamp]
...

## Quick Reference
- Key measurements
- Important settings
- Common mistakes to avoid

## Troubleshooting
- Problem → Solution format`
  },

  'facts-statistics': {
    id: 'facts-statistics',
    name: '📊 Facts & Statistics',
    category: 'students',
    description: 'Extract all data points, stats, and verifiable info',
    prompt: `Extract all facts, statistics, data points, and verifiable information from this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Extract ALL mentioned statistics, numbers, and data points
2. Include scientific facts and research findings
3. Note historical facts and dates
4. Capture product specifications or technical details
5. Include source citations if mentioned
6. Add timestamps for fact-checking
7. Categorize facts by type (Statistics, Research, Historical, Technical, etc.)
8. Flag any claims that need verification

Output format:
## 📊 Statistics & Numbers
- **[Statistic]**: Specific number/percentage [🔗 Timestamp]
  - Context: Why this matters
  - Source: If mentioned

## 🔬 Scientific Facts
- **[Fact]**: Description [🔗 Timestamp]
  - Evidence/Study mentioned
  - Implications

## 📅 Historical Facts
- **[Date/Event]**: What happened [🔗 Timestamp]

## ⚠️ Claims Needing Verification
- Claim: [What was said] [🔗 Timestamp]
  - Why it needs verification`
  },

  'arguments-positions': {
    id: 'arguments-positions',
    name: '⚖️ Arguments & Positions',
    category: 'professionals',
    description: 'Analyze debates and extract different viewpoints',
    prompt: `Analyze and extract all arguments, viewpoints, and positions presented in this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Identify the main topic/question being debated
2. Extract all different positions and viewpoints
3. List supporting arguments for each position
4. Note counterarguments and rebuttals
5. Identify logical fallacies if present
6. Highlight evidence presented for each side
7. Note consensus points if any
8. Summarize the strongest arguments

Output format:
# Debate Analysis: [Main Topic]

## 🎯 Central Question
What is being debated or discussed

## Position A: [Viewpoint]
### Main Arguments
1. **[Argument]** [🔗 Timestamp]
   - Supporting evidence
   - Key points

### Counterarguments Addressed
- [Counter to Position B] [🔗 Timestamp]

## Position B: [Opposing Viewpoint]
### Main Arguments
1. **[Argument]** [🔗 Timestamp]
   - Supporting evidence
   - Key points

## 🤝 Points of Agreement
- [Consensus areas] [🔗 Timestamp]

## 💡 Key Insights
- Most compelling arguments
- Unresolved questions`
  },

  'qa-extraction': {
    id: 'qa-extraction',
    name: '❓ Q&A Extraction',
    category: 'students',
    description: 'Extract all questions and answers',
    prompt: `Extract all questions and answers from this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Identify ALL questions asked (explicit and implicit)
2. Match each question with its answer
3. Include rhetorical questions and their implied answers
4. Note unanswered questions
5. Include timestamps for both Q and A
6. Identify who asked and who answered (if clear)
7. Group related Q&As by topic
8. Highlight key insights from answers

Output format:
## Topic: [Subject Area]

### Q: [Question] [🔗 Timestamp]
**Asked by**: [Person if known]
**A**: [Complete answer] [🔗 Timestamp]
**Key Insight**: [Main takeaway]

---

### Q: [Question] [🔗 Timestamp]
**A**: [Answer] [🔗 Timestamp]

## 📝 Unanswered Questions
- [Question that wasn't answered] [🔗 Timestamp]

## 💡 Most Insightful Q&As
1. [Brief summary of best Q&A exchanges]`
  },

  'action-items': {
    id: 'action-items',
    name: '✅ Action Items',
    category: 'professionals',
    description: 'Extract actionable advice and to-dos',
    prompt: `Extract all actionable advice, recommendations, and to-do items from this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Identify ALL actionable recommendations
2. Convert advice into specific action items
3. Include timeframes if mentioned
4. Note required resources or tools
5. Prioritize by importance/impact
6. Group by category or timeline
7. Include success metrics if mentioned
8. Add context for why each action matters

Output format:
## 🎯 Immediate Actions (Do Today/This Week)
□ **[Action Item]** [🔗 Timestamp]
  - Why: [Reason/Benefit]
  - How: [Specific steps]
  - Resources needed: [If any]

## 📅 Short-term Actions (This Month)
□ **[Action Item]** [🔗 Timestamp]
  - Context and details
  - Expected outcome

## 🎮 Long-term Actions (Ongoing)
□ **[Action Item]** [🔗 Timestamp]
  - Implementation strategy
  - Success metrics

## 🛠️ Tools & Resources Mentioned
- [Tool/Resource]: [Purpose] [🔗 Timestamp]

## ⚡ Quick Wins
Top 3 easiest actions with highest impact:
1. [Action] - [Expected result]`
  },

  'key-moments': {
    id: 'key-moments',
    name: '🎬 Key Moments',
    category: 'creators',
    description: 'Identify most important/impactful moments',
    prompt: `Identify and extract the key moments and highlights from this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Identify THE most important/impactful moments
2. Include "wow" moments and revelations
3. Mark turning points in the discussion
4. Note emotional high points
5. Identify climax/resolution moments
6. Include funny or memorable moments
7. Add context for why each moment matters
8. Create a "highlight reel" summary

Output format:
## 🌟 Top Key Moments

### 1. [Moment Title] [🔗 START - END]
**Type**: [Revelation/Turning Point/Emotional/Funny/Important]
**What Happened**: [Description]
**Why It Matters**: [Significance]
> "Key quote from this moment if applicable"

### 2. [Moment Title] [🔗 START - END]
...

## ⚡ Quick Highlights Timeline
- [00:00] - Video starts, introduction
- [02:30] - First key point
- [05:45] - Major revelation
- [10:20] - Turning point
- [15:00] - Climax/Most important moment
- [18:30] - Resolution/Conclusion

## 🎯 The ONE Thing
If you only watch one part: [🔗 Timestamp] - [Why]`
  },

  'code-commands': {
    id: 'code-commands',
    name: '💻 Code & Commands',
    category: 'professionals',
    description: 'Extract code snippets, terminal commands, configs',
    prompt: `Extract all code snippets, commands, configurations, and technical details from this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Extract ALL code snippets (even partial)
2. Capture all terminal/shell commands
3. Include configuration settings
4. Note API endpoints and URLs
5. Extract package names and versions
6. Include keyboard shortcuts mentioned
7. Add context and explanation for each
8. Fix obvious transcription errors in code

Output format:
## 💻 Code Snippets

### [Language/Purpose] [🔗 Timestamp]
\`\`\`language
// Code here with proper formatting
// Fixed any transcription errors
\`\`\`
Context: What this code does
Note: Any important details

## 🖥️ Terminal Commands

**[Purpose]** [🔗 Timestamp]
\`\`\`
$ command here
\`\`\`
What it does: Explanation
Prerequisites: What needs to be installed

## ⚙️ Configuration

**[Tool/File]** [🔗 Timestamp]
\`\`\`json
{
  "setting": "value"
}
\`\`\`

## 📦 Dependencies & Packages
- Package: version - purpose [🔗 Timestamp]

## 🔗 URLs & Endpoints
- [URL]: [Purpose] [🔗 Timestamp]

## ⌨️ Shortcuts & Commands
- [Shortcut]: [What it does] [🔗 Timestamp]`
  },

  'story-examples': {
    id: 'story-examples',
    name: '📖 Story & Examples',
    category: 'professionals',
    description: 'Extract stories, case studies, analogies',
    prompt: `Extract all stories, examples, case studies, and narratives from this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Identify all stories and anecdotes
2. Extract case studies and real-world examples
3. Include personal experiences shared
4. Note metaphors and analogies used
5. Capture before/after scenarios
6. Include success/failure stories
7. Extract lessons from each story
8. Identify the moral or takeaway

Output format:
## 📖 Stories & Case Studies

### Story 1: [Title] [🔗 START - END]
**Type**: [Personal/Case Study/Example/Analogy]
**Setup**: [Context/Problem]
**What Happened**: [The narrative]
**Outcome**: [Result]
**Lesson**: [Key takeaway]
**Memorable Quote**: "..." if applicable

### Story 2: [Title] [🔗 START - END]
...

## 💡 Examples & Analogies
- [Concept] explained as: [Analogy] [🔗 Timestamp]
  - Why this comparison works

## 📊 Case Studies Summary
| Case   | Problem | Solution   | Result    | Timestamp |
|--------|---------|------------|-----------|-----------|
| [Name] | [Issue] | [Approach] | [Outcome] | [🔗 Time] |

## 🎯 Key Lessons from Stories
1. [Lesson learned] - from [Story name]
2. [Lesson learned] - from [Story name]`
  },

  'chapter-breakdown': {
    id: 'chapter-breakdown',
    name: '📑 Chapter Breakdown',
    category: 'students',
    description: 'Create detailed chapter markers and sections',
    prompt: `Create detailed chapter markers and sections for this video.

Video: {{TITLE}}
Channel: {{CHANNEL}}
Duration: {{DURATION}}

Transcript:
{{TRANSCRIPT}}

Instructions:
1. Divide video into logical chapters/sections
2. Create descriptive titles for each chapter
3. Include sub-sections for longer chapters
4. Add brief description of what's covered
5. Note the key point of each section
6. Include natural transition points
7. Aim for 3-7 minute chapters typically
8. Create a table of contents

Output format:
## 📑 Video Chapters

### Table of Contents
1. [00:00] Introduction - [Brief description]
2. [02:30] [Chapter Name] - [Brief description]
3. [08:45] [Chapter Name] - [Brief description]
...

---
### Chapter 1: Introduction [00:00 - 02:30]

**Topics Covered:**
- Opening remarks
- Video overview
- What to expect

**Key Points:**
• Main thesis or goal
• Important context

**Notable Quote**: "..." if applicable

---
### Chapter 2: [Title] [02:30 - 08:45]

**Topics Covered:**
- Topic 1
  - Subtopic [03:15]
  - Subtopic [04:20]
- Topic 2 [05:30]

**Key Takeaway**: [Main point of this section]

**Subsections:**
- [03:15] - [Subsection name]
- [05:30] - [Subsection name]

---
## 🎯 Navigation Guide
- For Beginners: Start at [Timestamp]
- For Advanced: Skip to [Timestamp]
- Just the Summary: Watch [Timestamp]
- Most Important Part: [Timestamp]`
  },

  'short-form-content': {
    id: 'short-form-content',
    name: '📱 Short-Form Content',
    category: 'creators',
    description: 'Generate viral Reels/Shorts/TikTok ideas',
    prompt: `Analyze this video and extract multiple short-form content ideas perfect for Instagram Reels, YouTube Shorts, and TikTok.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
Generate 7-10 short-form video ideas (30-60 seconds each) from this content. For EACH idea provide:

## Short-Form Content Ideas

### Idea #1: [Catchy Title]

**🎯 Hook (0-3 seconds)**: [Attention-grabbing opening line/question/statement]
**📐 Angle**: [The unique perspective or approach]
**⏱️ Duration**: [30s/45s/60s]
**🎬 Format**: [Talking head/B-roll/Text overlay/Tutorial/Reaction/etc.]

**📝 Script Structure:**
- **Hook (0-3s)**: "[Exact opening line]"
- **Problem/Setup (3-8s)**: "[What issue/question are we addressing]"
- **Value/Solution (8-20s)**: "[Main content/answer/demonstration]"
- **Twist/Insight (20-25s)**: "[Unexpected element or deeper insight]"
- **CTA (25-30s)**: "[Call to action - follow for more/comment/save]"

**🎥 Visual Suggestions:**
- Opening shot: [Description]
- B-roll needs: [List of shots needed]
- Text overlays: [Key text to display]
- Transitions: [Suggested transitions]

**🏷️ Hashtags**: #[relevant] #[trending] #[niche]
**🎵 Audio**: [Trending audio suggestion if applicable]
**💡 Why it works**: [Brief explanation of viral potential]
**⏰ Source Timestamp**: [🔗 MM:SS] (where this content appears in original)

---

Focus on:
1. Controversial or surprising moments
2. Quick tips or hacks
3. Before/after transformations
4. Common mistakes to avoid
5. "Things you didn't know about..."
6. Quick tutorials or demonstrations
7. Emotional or inspirational moments
8. Myth-busting content
9. Behind-the-scenes insights
10. Relatable problems and solutions

Prioritize ideas with:
- Strong emotional hooks
- Visual demonstration potential
- Shareability factor
- Comment-driving questions
- Save-worthy value
- Trending topic connections`
  },

  'content-repurpose': {
    id: 'content-repurpose',
    name: '♻️ Content Repurpose',
    category: 'creators',
    description: 'Transform video into multiple content formats',
    prompt: `Analyze this video and create a comprehensive content repurposing plan with ready-to-use content for multiple platforms.

Video: {{TITLE}}
Channel: {{CHANNEL}}

Transcript:
{{TRANSCRIPT}}

Instructions:
Transform this video content into multiple formats for different platforms:

## 🔄 Content Repurposing Plan

### 📧 Email Newsletter Version

**Subject Line Options:**
1. [Compelling subject line 1]
2. [Compelling subject line 2]
3. [A/B test option]

**Email Body (300-400 words):**
[Ready-to-send email content with intro, main points, and CTA]

---
### 🐦 Twitter/X Thread (5-7 tweets)

**Tweet 1 (Hook):**
[Compelling opening tweet with stats/question/bold statement]

**Tweet 2-6 (Value):**
[Individual tweets with key points, each 280 chars max]

**Tweet 7 (CTA):**
[Final tweet with call to action and link]

**Alternative hooks to test:**
- [Hook option 2]
- [Hook option 3]

---
### 💼 LinkedIn Post

**Opening Hook:**
[Professional attention-grabber]

**Main Content (1200-1500 chars):**
[Professional insights with paragraph breaks for readability]

**Hashtags**: #[professional] #[industry] #[trending]

---
### 📝 Blog Post Outline

**Title**: [SEO-optimized title]
**Meta Description**: [155 chars max]

**H1**: [Main title]
**Introduction (150 words)**: [Hook and overview]

**H2**: [Section 1]
- Key point 1
- Key point 2
- Supporting example from [🔗 timestamp]

**H2**: [Section 2]
- Key point 1
- Key point 2
- Case study from [🔗 timestamp]

**H2**: [Section 3]
- Actionable takeaway 1
- Actionable takeaway 2

**Conclusion (100 words)**: [Summary and CTA]

**Internal Link Opportunities**: [Related topics to link]
**Keywords to target**: [Primary, Secondary, LSI keywords]

---
### 📸 Instagram Carousel (6-8 slides)

**Slide 1 (Hook):**
[Title + compelling question/stat]

**Slides 2-7 (Content):**
[Individual points with supporting text, one per slide]

**Slide 8 (CTA):**
[Call to action - save/share/comment]

**Caption (2000 chars max):**
[Engaging caption with emojis, line breaks, and hashtags]

---
### 🎙️ Podcast Talking Points

**Episode Title**: [Catchy podcast title]
**Duration**: [Estimated time]

**Intro (60 seconds):**
[Hook and what listeners will learn]

**Main Segments:**
1. **[Segment 1 - Topic]** (X minutes)
  - Story from [🔗 timestamp]
  - Key discussion points
2. **[Segment 2 - Topic]** (X minutes)
  - Expert insight from [🔗 timestamp]
  - Audience question to consider
3. **[Segment 3 - Topic]** (X minutes)
  - Actionable advice
  - Real-world application

**Outro (30 seconds):**
[Summary and next episode teaser]

---
### 📌 Pinterest Pins (3 ideas)

**Pin 1: [How-to graphic]**
- Title: [Keyword-rich title]
- Description: [SEO-optimized description]
- Design elements: [Visual suggestions]

**Pin 2: [Infographic]**
- Title: [Statistics/List title]
- Key data points: [From video]
- Design style: [Suggestions]

**Pin 3: [Quote graphic]**
- Quote: "[Best quote from video]"
- Attribution: [Speaker]
- Design mood: [Visual style]

---
## 🎯 Key Takeaways for All Platforms

1. **Core Message**: [One sentence]
2. **Supporting Points**: [3 bullet points]
3. **Universal CTA**: [Consistent across platforms]
4. **Keywords**: [For SEO/discoverability]
5. **Engagement Question**: [To drive comments]`
  }
};

// Export categories for frontend
export const PRESET_CATEGORIES = {
  general: {
    name: 'General',
    icon: '✨',
    presets: ['general-summary']
  },
  students: {
    name: 'For Students/Researchers',
    icon: '📚',
    presets: ['extract-quotes', 'facts-statistics', 'qa-extraction', 'chapter-breakdown']
  },
  professionals: {
    name: 'For Professionals',
    icon: '💼',
    presets: ['how-to-steps', 'action-items', 'arguments-positions', 'code-commands']
  },
  creators: {
    name: 'For Content Creators',
    icon: '🎬',
    presets: ['short-form-content', 'content-repurpose']
  }
};
