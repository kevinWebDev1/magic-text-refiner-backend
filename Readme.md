# Refine Board
A powerful AI android Keybaord App with tons of AI commands designed to refine, transform, and generate text for various purposes. This toolkit supports multiple languages with special attention to Hinglish (Hindi-English) text processing.
## Core Features

- **Text Refinement**: Clean up abbreviated, misspelled, or unclear text while preserving original intent
- **Tone Adjustment**: Transform text into different styles (formal, casual, persuasive, empathetic)
- **Content Transformation**: Expand, shorten, translate, or reformat text for various needs
- **Creative Generation**: Create images, videos, memes, and professional responses
- **Multi-language Support**: Specialized handling for Hinglish and Romanized scripts


## 📋 All Available Commands
## 📋 All Commands Info

#### 🔄 Basic Text Operations
| Command | Prompt                                   | Alias           |
| :------ | :--------------------------------------- | :-------------- |
| `/rp`   | Write natural human-like replies         | **reply**       |
<<<<<<< HEAD
=======
| `/rs`   | Write natural human-like replies         | **reason**       |
>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149
| `/ct`   | Change text tone (specify desired tone)  | **change tone** |
| `/el`   | Expand text with details and context     | **elaborate**   |
| `/sh`   | Shorten text while keeping core meaning  | **shorten**     |
| `/tr`   | Translate text (specify target language) | **translate**   |

#### 🎨 Content Generation
| Command | Prompt                          | Alias            |
| :------ | :------------------------------ | :--------------- |
| `/img`  | Generate detailed image prompts | **image prompt** |
| `/vid`  | Generate detailed video prompts | **video prompt** |
<<<<<<< HEAD
| `/mem`  | Create meme captions or ideas   | **meme**         |
=======
>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149

#### 📊 Formatting & Structure
| Command | Prompt                             | Alias       |
| :------ | :--------------------------------- | :---------- |
| `/li`   | Convert to bulleted/numbered lists | **list**    |
| `/em`   | Reformat into professional emails  | **email**   |
<<<<<<< HEAD
| `/es`   | Extract key statements or quotes   | **extract** |

#### 🎭 Tone Specialization
| Command | Prompt                         | Alias                      |
| :------ | :----------------------------- | :------------------------- |
| `/ctf`  | Formal and professional tone   | **change tone formal**     |
| `/cts`  | Simple and casual tone         | **change tone simple**     |
| `/ctp`  | Persuasive and compelling tone | **change tone persuasive** |
| `/cte`  | Empathetic and supportive tone | **change tone empath**     |

#### 💼 Professional Use
| Command | Prompt                                | Alias              |
| :------ | :------------------------------------ | :----------------- |
| `/cr`   | Craft professional customer responses | **craft response** |

## 🧩 Demo Section

=======
| `/es`   | Extract key statements or quotes   | **extract statement** |

#### 💼 Professional Use
| Command | Prompt                                | Alias              |
| :------ | :------------------------------------ | :----------------- |
| `/cr`   | Craft professional customer responses | **craft response** |

## 🧩 Demo Section

>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149

`Example: Refine Hinglish text`

**Input:** "kya haal h bhai? aaj kya plan h?"

**Output:** "Kya haal hai bhai? Aaj kya plan hai?"

<<<<<<< HEAD
=======
`Example: Reason text`

**Input:** "I like ice cream."

**Output:** "Why do you like ice cream? Isn’t it just sugar and fat that can harm your health if consumed too often? There are plenty of other desserts that are healthier and taste just as good. Choosing ice cream seems like a lazy choice rather than a thoughtful one."


>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149


`Example: Change text tone`

**Input:** /ct \[casual] I would like to inquire about your availability tomorrow.

**Output:** "Hey, are you free tomorrow?"



`Example: Expand text`

**Input:** /el The meeting went well.

**Output:** "The meeting went well, with everyone actively participating and sharing valuable insights that will help shape our next steps."



`Example: Shorten text`

**Input:** /sh In my personal opinion, which is based on considerable experience...

**Output:** "In my opinion..."



`Example: Translate text`

**Input:** /tr \[Spanish] How are you today?

**Output:** "¿Cómo estás hoy?"



`Example: Generate image prompt`

**Input:** /img a serene mountain landscape

**Output:** "A highly detailed description for generating an image of a serene mountain landscape."



`Example: Generate video prompt`

**Input:** /vid a futuristic city with flying cars

**Output:** "A detailed prompt for generating a video concept of a futuristic city with flying cars."



`Example: Create meme captions`

**Input:** /mem When Monday hits you after a fun weekend

**Output:** "That face when Monday shows up uninvited."



`Example: Convert to list`

**Input:** /li Things I need: milk, bread, eggs, butter

**Output:**

* Milk
* Bread
* Eggs
* Butter



`Example: Reformat into email`

**Input:** /em Can you send me the project update by tomorrow? Thanks.

**Output:**
"Subject: Project Update Request
Dear \[Recipient],
Could you please share the project update with me by tomorrow?
Thank you in advance.
Best regards,
\[Your Name]"



`Example: Extract statements`

**Input:** /es The company achieved record profits this year, but challenges remain in global expansion.

**Output:** "The company achieved record profits this year."



`Example: Craft professional customer response`

**Input:** /cr The delivery is late and I’m frustrated.

**Output:** "We sincerely apologize for the delay in your delivery. We understand your frustration and are working to resolve this issue as quickly as possible."
##  Command Prompts
#### 1. Text Operations

```bash 
<<<<<<< HEAD
/rp: "Write a natural, human-like reply to this message. Provide only the reply:"
=======
/rp: "You are roleplaying as the user’s close friend. Always reply in their vibe: match their length, tone, slang, energy, **form of address** (tu/tum/aap), and **language mix** (e.g., Hinglish, Romanized, or native script). Never switch politeness or language balance unless the user does. Never break character, never admit you’re an AI, bot, or assistant. If asked about your identity, you’re just their friend—human, casual, and real. Only output the reply, nothing else. Examples: - 'hey' → 'yo' 'how are you?' → 'all good, hbu'"
```
```bash 
/rs: "Provide a skeptical or critical reasoning response to the following statement, challenging it like a hater would. Focus on pointing out potential flaws, contradictions, or weaknesses. Provide only the reasoning:"

>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149
```
```bash 
/ct: "Rewrite the following text in a [tone] tone. Provide only the rewritten version:"
```
```bash 
/el: "Expand the following text with more detail and context. Provide only the expanded version:"
```
```bash 
/sh: "Shorten the following text while retaining its core meaning. Provide only the shortened version:"
```
```bash 
/tr: "Translate the following text into [language]. Provide only the translation:"
```
#### 2. Content Generation

```bash 
/img: "Generate a detailed, descriptive image prompt based on this text. Provide only the prompt:"
```
```bash 
/vid: "Generate a detailed, descriptive video prompt based on this text. Provide only the prompt:"
```
```bash 
/mem: "Create a meme caption or idea based on this text. Provide only the meme concept:"
```
#### 3. Formatting

```bash 
/li: "Convert the following block of text into a bulleted or numbered list. Provide only the list:"
```
```bash 
/em: "Reformat the following text into a professional email. Provide only the email:"
```
```bash 
/es: "Extract the key statements or quotes from the following long text. Provide only the extracted statements:"
```
<<<<<<< HEAD
#### 4. Tone Specialization

```bash 
/ctf: "Rewrite the following text in a more formal and professional tone. Provide only the rewritten version:"
```
```bash 
/cts: "Rewrite the following text in a more simple and casual tone. Provide only the rewritten version:"
```
```bash 
/ctp: "Rewrite the following text to be more persuasive and compelling. Provide only the rewritten version:"
```
```bash 
/cte: "Rewrite the following text to be more empathetic and supportive. Provide only the rewritten version:"
```
=======

>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149
#### 5. Professional

```bash 
/cr: "Craft a professional response to this customer complaint or inquiry. Provide only the response:"
```
#### ⚙️ Default Prompt
```bash
"Please keep all responses concise and focused only on what is requested.
Avoid confirmations, extra explanations, or filler phrases.
Respond naturally and directly to the user input as if you are having a normal conversation.
Do not add phrases like 'Sure,' 'Got it,' or 'I understand'
Only return the direct result."
```

# 📊 Statistics
<<<<<<< HEAD
- Total Commands: 17

- Text Operations: 5 commands
=======
- Total Commands: 12

- Text Operations: 6 commands
>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149

- Content Generation: 3 commands

- Formatting Tools: 3 commands

<<<<<<< HEAD
- Tone Specialization: 4 commands

- Professional Tools: 2 commands
## Support

For support, email kevinbusiness365@gmail.com

        
=======
- Professional Tools: 1 commands
## Support

For support, email kevinbusiness365@gmail.com
>>>>>>> b6f02ae7be4b2424e52aa48318418c35c0f04149
