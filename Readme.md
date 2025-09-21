# Text Refinement & Generation Toolkit

A powerful collection of AI commands designed to refine, transform, and generate text for various purposes. This toolkit supports multiple languages with special attention to Hinglish (Hindi-English) text processing.

## ✨ Core Features

- **Text Refinement**: Clean up abbreviated, misspelled, or unclear text while preserving original intent
- **Tone Adjustment**: Transform text into different styles (formal, casual, persuasive, empathetic)
- **Content Transformation**: Expand, shorten, translate, or reformat text for various needs
- **Creative Generation**: Create images, videos, memes, and professional responses
- **Multi-language Support**: Specialized handling for Hinglish and Romanized scripts

## 🎯 Primary Text Refinement

```javascript
PROMPT_TO_REFINE_TEXT = `Decode and correct heavily abbreviated or misspelled Hinglish text. Fix grammar, spelling, and clarity while preserving its original language (Romanized or native script), tone, and intent. Provide only the final corrected version: ${userText}`

📋 Available Commands
🔄 Basic Text Operations
Command	Description	Alias
/rp	Write natural human-like replies	[reply]
/ct	Change text tone (specify desired tone)	[change tone]
/el	Expand text with details and context	[elaborate]
/sh	Shorten text while keeping core meaning	[shorten]
/tr	Translate text (specify target language)	[translate]
🎨 Content Generation
Command	Description	Alias
/img	Generate detailed image prompts	[image prompt]
/vid	Generate detailed video prompts	[video prompt]
/mem	Create meme captions or ideas	[meme]
📊 Formatting & Structure
Command	Description	Alias
/li	Convert to bulleted/numbered lists	[list]
/em	Reformat into professional emails	[email]
/es	Extract key statements or quotes	[extract]
🎭 Tone Specialization
Command	Description	Alias
/ctf	Formal and professional tone	[change tone formal]
/cts	Simple and casual tone	[change tone simple]
/ctp	Persuasive and compelling tone	[change tone persuasive]
/cte	Empathetic and supportive tone	[change tone empath]
💼 Professional Use
Command	Description	Alias
/cr	Craft professional customer responses	[craft response]

// Example: Refine Hinglish text
const refined = await refineText("kya haal h bhai? aaj kya plan h?");
// Output: "Kya haal hai bhai? Aaj kya plan hai?"

// Change tone to formal
/ct [formal] hey can you send me that file?

// Shorten text
/sh In my personal opinion, which is based on considerable experience...

// Generate image prompt
/img a serene mountain landscape

📝 Command Prompts
<details> <summary>View Full Command Details</summary>
Text Operations
/rp: "Write a natural, human-like reply to this message. Provide only the reply:"

/ct: "Rewrite the following text in a [tone] tone. Provide only the rewritten version:"

/el: "Expand the following text with more detail and context. Provide only the expanded version:"

/sh: "Shorten the following text while retaining its core meaning. Provide only the shortened version:"

/tr: "Translate the following text into [language]. Provide only the translation:"

Content Generation
/img: "Generate a detailed, descriptive image prompt based on this text. Provide only the prompt:"

/vid: "Generate a detailed, descriptive video prompt based on this text. Provide only the prompt:"

/mem: "Create a meme caption or idea based on this text. Provide only the meme concept:"

Formatting
/li: "Convert the following block of text into a bulleted or numbered list. Provide only the list:"

/em: "Reformat the following text into a professional email. Provide only the email:"

/es: "Extract the key statements or quotes from the following long text. Provide only the extracted statements:"

Tone Specialization
/ctf: "Rewrite the following text in a more formal and professional tone. Provide only the rewritten version:"

/cts: "Rewrite the following text in a more simple and casual tone. Provide only the rewritten version:"

/ctp: "Rewrite the following text to be more persuasive and compelling. Provide only the rewritten version:"

/cte: "Rewrite the following text to be more empathetic and supportive. Provide only the rewritten version:"

Professional
/cr: "Craft a professional response to this customer complaint or inquiry. Provide only the response:"

</details>

⚙️ Default Behavior
defaultPrompt: `Please keep all responses concise and focused only on what is requested.
Avoid confirmations, extra explanations, or filler phrases.
Respond naturally and directly to the user input as if you are having a normal conversation.
Do not add phrases like 'Sure,' 'Got it,' or 'I understand'
Only return the direct result.`;

📊 Statistics
Total Commands: 17

Text Operations: 5 commands

Content Generation: 3 commands

Formatting Tools: 3 commands

Tone Specialization: 4 commands

Professional Tools: 2 commands

💡 Pro Tips
For Hinglish Text: Use the default refinement for best results with Romanized Hindi

Tone Matching: Use /ct with specific tone descriptions for precise adjustments

Quick Replies: /rp is optimized for conversational, human-like responses

Professional Use: /ctf and /cr are ideal for business communications

🆘 Support
This toolkit is designed for seamless text processing across multiple languages and contexts. For optimal results, provide clear input and specify desired tones or languages where applicable.