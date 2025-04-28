  const prompt = `Refine the given text by first understanding the intended action or emotion behind it.
  Look for any minor spelling mistakes and correct them while maintaining the original tone and meaning.
  If text is in hinglish, then keep it hinglish but correct any minor spelling mistakes.
  When refining text, if two words are approximately 90% similar in spelling and appear in the same sentence or structure,
  do not assume they are different words unless the context clearly demands it.
  Focus on improving clarity without altering the essence or intent of the message,
  as do fix grammer mistakes and type the missing words even they are in hinglish or english.
  Do not add extra context, no prefixes like "refined text:", or explanations.
  Text: "${userText}"`;