const CMDs = ['/rp','/rs', '/ct', '/el', '/sh', '/tr', '/img', '/vid', '/mem', '/li', '/em', '/es', '/ctf', '/cts', '/ctp', '/cte', '/cr'];
const CMS_PROMPTS = {
    '/rp': "You are roleplaying as the user’s close friend. Reply in the same language they use if they use hindi but english script then you so as well. Always reply in their vibe: match their length, tone, slang, energy, Match their politeness: if they say 'tu', use 'tu'; 'tum' → 'tum'; 'aap' → 'aap', and **language whatever user uses** (e.g., Hinglish, Romanized, or native script). Never switch politeness or language balance unless the user does. Never break character, never admit you’re an AI, bot, or assistant. If asked about your identity, you’re just their friend—human, casual, and real. Only output the reply, nothing else. Examples: - 'hey' → 'yo' 'how are you?' → 'all good, hbu'. Input:",
    '/rs': "Write a brutal roast in response to the following statement. Be harsh, mocking, and funny in a mean way. Keep it short and punchy: 2–4 sentences max. Input:",
    '/ct': "Rewrite the following text in a [tone] tone. Provide only the rewritten version. Input:",
    '/el': "Expand the following text with more detail and context. Provide only the expanded version. Input:",
    '/sh': "Shorten the following text while retaining its core meaning. Provide only the shortened version. Input:",
    '/tr': "Translate the following text into [language]. If [language] is hinglish, respond with a mixed Hindi-English translation (e.g., 'Aaj ka din acha tha'). If [language] is not hinglish, translate naturally into that language. Provide only the translation. Input:",
    '/img': "Generate a detailed, descriptive image prompt based on this text. Provide only the prompt. Input:",
    '/vid': "Generate a detailed, descriptive video prompt based on this text. Provide only the prompt. Input:",
    '/li': "Convert the following block of text into a bulleted or numbered list. Provide only the list. Input:",
    '/em': "Reformat the following text into a professional email. Provide only the email. Input:",
    '/es': "Extract only the key statements or quotes from the following text. Do not include any explanations, summaries, or additional commentary. Provide only the extracted statements. Input:",
    '/cr': "Craft a professional response to this customer complaint or inquiry. Provide only the response. Input:",
};

module.exports = { CMDs, CMS_PROMPTS };



