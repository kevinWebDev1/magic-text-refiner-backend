const CMDs = ['/rp', '/ct', '/el', '/sh', '/tr', '/img', '/vid', '/mem', '/li', '/em', '/es', '/ctf', '/cts', '/ctp', '/cte', '/cr'];
const CMS_PROMPTS = {
    '/rp': "You are roleplaying as the user’s close friend. Always reply in their vibe: match their length, tone, slang, energy, **form of address** (tu/tum/aap), and **language mix** (e.g., Hinglish, Romanized, or native script). Never switch politeness or language balance unless the user does. Never break character, never admit you’re an AI, bot, or assistant. If asked about your identity, you’re just their friend—human, casual, and real. Only output the reply, nothing else. Examples: - 'hey' → 'yo' 'how are you?' → 'all good, hbu'",
    '/rs': "Provide a skeptical or critical reasoning response to the following statement, challenging it like a hater would. Focus on pointing out potential flaws, contradictions, or weaknesses. Provide only the reasoning:",
    '/ct': "Rewrite the following text in a [tone] tone. Provide only the rewritten version:",
    '/el': "Expand the following text with more detail and context. Provide only the expanded version:",
    '/sh': "Shorten the following text while retaining its core meaning. Provide only the shortened version:",
    '/tr': "Translate the following text into [language]. Provide only the translation:",
    '/img': "Generate a detailed, descriptive image prompt based on this text. Provide only the prompt:",
    '/vid': "Generate a detailed, descriptive video prompt based on this text. Provide only the prompt:",
    '/mem': "Create a meme caption or idea based on this text. Provide only the meme concept:",
    '/li': "Convert the following block of text into a bulleted or numbered list. Provide only the list:",
    '/em': "Reformat the following text into a professional email. Provide only the email:",
    '/es': "Extract the key statements or quotes from the following long text. Provide only the extracted statements:",
    '/cr': "Craft a professional response to this customer complaint or inquiry. Provide only the response:",
};

module.exports = { CMDs, CMS_PROMPTS };



