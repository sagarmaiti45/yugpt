/**
 * Summary Preset Prompts for YuGPT
 * Each preset defines a specific way to analyze and summarize video content
 */

export const SUMMARY_PRESETS = {
  'extract-quotes': {
    id: 'extract-quotes',
    name: '💬 Extract Quotes',
    category: 'students',
    description: 'Extract memorable quotes with exact timestamps',
    prompt: `Analyze this video transcript and extract the most memorable and impactful quotes.

For each quote:
- Include the exact quote in blockquote format
- Note the speaker (if identifiable from context)
- Add the timestamp
- Identify the theme or topic
- Explain why it's significant

Format your response with clear sections:
1. Most Impactful Quotes (top 5-7)
2. Quotes by Theme
3. Quotes for Social Media (short, shareable)

Transcript: {transcript}`
  },

  'how-to-steps': {
    id: 'how-to-steps',
    name: '📚 How-To Steps',
    category: 'students',
    description: 'Convert tutorials into step-by-step instructions',
    prompt: `Convert this tutorial/instructional video into clear, actionable step-by-step instructions.

Include:
- Prerequisites (tools, knowledge, setup needed)
- Numbered steps with detailed instructions
- Tips and best practices for each step
- Common mistakes to avoid
- Expected outcomes
- Quick reference guide at the end
- Troubleshooting section

Transcript: {transcript}`
  },

  'facts-statistics': {
    id: 'facts-statistics',
    name: '📊 Facts & Statistics',
    category: 'students',
    description: 'Extract all data points, stats, and verifiable info',
    prompt: `Extract and organize all factual information, data points, and statistics from this video.

Categorize by:
- **Statistics & Numbers**: Percentages, measurements, quantities
- **Scientific Facts**: Research findings, studies mentioned
- **Historical Facts**: Dates, events, historical context
- **Technical Specifications**: Technical details, specifications
- **Sources**: Any sources or citations mentioned

For each fact, include:
- The fact itself
- Timestamp
- Context
- Source (if mentioned)

Transcript: {transcript}`
  },

  'arguments-positions': {
    id: 'arguments-positions',
    name: '⚖️ Arguments & Positions',
    category: 'professionals',
    description: 'Analyze debates and extract different viewpoints',
    prompt: `Analyze this video for different viewpoints, arguments, and positions presented.

Structure:
1. **Main Topic/Question**
2. **Position A**:
   - Main argument
   - Supporting points (with timestamps)
   - Evidence presented
3. **Position B** (if applicable):
   - Main argument
   - Supporting points (with timestamps)
   - Evidence presented
4. **Counterarguments**: Points raised against each position
5. **Consensus Points**: Areas of agreement
6. **Unresolved Issues**: Questions left open

Transcript: {transcript}`
  },

  'qa-extraction': {
    id: 'qa-extraction',
    name: '❓ Q&A Extraction',
    category: 'students',
    description: 'Extract all questions and answers',
    prompt: `Extract all questions and answers from this video, organizing them for easy reference.

Format:
1. **Q&A by Topic**: Group related Q&As together
2. **Most Insightful Exchanges**: Highlight particularly valuable Q&As
3. **Unanswered Questions**: Note any questions raised but not fully answered
4. **Quick FAQ**: Top 10 most important Q&As

For each Q&A include:
- Question (with timestamp)
- Answer summary
- Key takeaways

Transcript: {transcript}`
  },

  'action-items': {
    id: 'action-items',
    name: '✅ Action Items',
    category: 'professionals',
    description: 'Extract actionable advice and to-dos',
    prompt: `Extract all actionable advice, recommendations, and to-dos from this video.

Organize as:
1. **Immediate Actions**: Things to do right now
2. **Short-term Actions**: Within days/weeks
3. **Long-term Actions**: Ongoing or future

For each action:
- Clear action item
- Why it matters
- How to do it (if explained)
- Timestamp
- Required resources
- Expected outcome

Also include:
- Priority ranking
- Estimated time/effort
- Dependencies

Transcript: {transcript}`
  },

  'key-moments': {
    id: 'key-moments',
    name: '🎬 Key Moments',
    category: 'creators',
    description: 'Identify most important/impactful moments',
    prompt: `Identify the most important and impactful moments in this video.

Provide:
1. **Top 5-7 Key Moments**:
   - Timestamp
   - What happens
   - Why it's important
   - Screenshot-worthy moment description

2. **Video Timeline**:
   - Introduction: [timestamp] - Brief summary
   - Main sections with key moments
   - Conclusion: [timestamp] - Key takeaways

3. **The ONE Thing**: If viewer could only watch ONE moment, which would it be and why?

4. **Highlight Reel**: 30-second to 2-minute highlight reel timestamps

Transcript: {transcript}`
  },

  'code-commands': {
    id: 'code-commands',
    name: '💻 Code & Commands',
    category: 'professionals',
    description: 'Extract code snippets, terminal commands, configs',
    prompt: `Extract all code snippets, terminal commands, configuration, and technical implementation details.

Format:
1. **Code Snippets**:
   - Language
   - Code block with syntax
   - Explanation
   - Timestamp

2. **Terminal Commands**:
   - Command
   - What it does
   - When to use it
   - Timestamp

3. **Configuration**:
   - Config files
   - Settings
   - Parameters

4. **Dependencies & Requirements**:
   - Libraries/packages mentioned
   - Versions (if specified)

5. **API Endpoints**: Any APIs mentioned

6. **File Structure**: Project structure if discussed

Transcript: {transcript}`
  },

  'story-examples': {
    id: 'story-examples',
    name: '📖 Story & Examples',
    category: 'professionals',
    description: 'Extract stories, case studies, analogies',
    prompt: `Extract all stories, case studies, examples, and analogies used in this video.

For each story/example:
1. **Story Summary**:
   - Setup/Context
   - What happened
   - Outcome
   - Lesson/Moral
   - Timestamp

2. **Case Studies**:
   | Company/Person | Problem | Solution | Result | Timestamp |
   |---------------|---------|----------|--------|-----------|

3. **Analogies & Metaphors**: How complex concepts were explained simply

4. **Real-world Examples**: Practical applications mentioned

5. **Anecdotes**: Personal stories shared

Transcript: {transcript}`
  },

  'chapter-breakdown': {
    id: 'chapter-breakdown',
    name: '📑 Chapter Breakdown',
    category: 'students',
    description: 'Create detailed chapter markers and sections',
    prompt: `Create a detailed chapter breakdown of this video with comprehensive markers.

Provide:
1. **Table of Contents**:
   - Chapter number and title
   - Timestamp
   - Duration
   - Brief description

2. **Detailed Chapter Summaries**:
   For each chapter:
   - Key topics covered
   - Main points (bullet list)
   - Important timestamps within chapter
   - Transitions to next chapter

3. **Quick Navigation Guide**:
   "If you want to learn about X, jump to Chapter Y at [timestamp]"

4. **Chapter Highlights**: Most important moment in each chapter

Transcript: {transcript}`
  },

  'short-form-content': {
    id: 'short-form-content',
    name: '📱 Short-Form Content',
    category: 'creators',
    description: 'Generate viral Reels/Shorts/TikTok ideas',
    prompt: `Analyze this video and generate 7-10 viral short-form content ideas (Reels/Shorts/TikTok).

For each idea:
1. **Hook Script** (0-3 seconds):
   - Attention-grabbing opener
   - Text overlay suggestion

2. **Full Script** (30-60 seconds):
   - Beginning
   - Middle
   - End/CTA

3. **Visual Suggestions**:
   - Key scenes to show
   - B-roll ideas
   - Transitions

4. **Music/Audio**:
   - Trending audio suggestions
   - Voiceover style

5. **Hashtags**: 5-10 relevant hashtags

6. **Source Timestamps**: Where to find content in original video

7. **Viral Potential**: Why this would perform well

Transcript: {transcript}`
  },

  'content-repurpose': {
    id: 'content-repurpose',
    name: '♻️ Content Repurpose',
    category: 'creators',
    description: 'Transform video into multiple content formats',
    prompt: `Transform this video content into multiple ready-to-use formats for different platforms.

Create:
1. **Email Newsletter** (300-400 words):
   - Catchy subject line
   - Opening hook
   - Main points
   - CTA

2. **Twitter/X Thread** (8-12 tweets):
   - Hook tweet
   - Main points (1 per tweet)
   - Conclusion with CTA

3. **LinkedIn Post** (150-200 words):
   - Professional angle
   - Key insights
   - Discussion prompt

4. **Blog Post Outline**:
   - SEO title
   - H2/H3 structure
   - Key sections
   - Word count estimates

5. **Instagram Carousel** (8-10 slides):
   - Slide topics
   - Text for each slide
   - Design notes

6. **Podcast Talking Points**:
   - Episode title
   - Intro script
   - Main discussion points
   - Questions to explore

7. **Pinterest Pins** (3-5 pin ideas):
   - Pin title
   - Description
   - Visual concept

Transcript: {transcript}`
  }
};

// Export categories for frontend
export const PRESET_CATEGORIES = {
  students: {
    name: 'For Students/Researchers',
    presets: ['facts-statistics', 'how-to-steps', 'qa-extraction', 'chapter-breakdown']
  },
  creators: {
    name: 'For Content Creators',
    presets: ['extract-quotes', 'short-form-content', 'content-repurpose', 'key-moments']
  },
  professionals: {
    name: 'For Professionals',
    presets: ['action-items', 'arguments-positions', 'story-examples', 'code-commands']
  }
};
