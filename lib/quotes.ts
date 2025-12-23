// ============================================
// LOADING SCREEN QUOTES (General Wisdom)
// ============================================
export const loadingQuotes = [
  { text: "There is only one good, knowledge, and one evil, ignorance.", author: "Socrates" },
  { text: "Misunderstandings occasion more mischief in the world than malice.", author: "Goethe" },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
  { text: "Conflict is the result of a lack of shared reality.", author: "Unknown" },
  { text: "Ignorance is the night of the mind, but a night without moon and star.", author: "Confucius" },
  { text: "Compassion is the realization that we are all walking each other home.", author: "Ram Dass" },
  { text: "A man is not his mistakes.", author: "Unknown" },
  { text: "Evil is just a lack of light.", author: "St. Augustine" },
  { text: "To understand all is to forgive all.", author: "French Proverb" },
];

// ============================================
// INBOX QUOTES (Reading Messages)
// ============================================
export const inboxQuotes = [
  { text: "The trick to viewing feedback as a gift is to be more worried about having blind spots than hearing about them.", author: "James Clear" },
  { text: "Growth is the only evidence of life.", author: "John Henry Newman" },
  { text: "Awareness is the first step toward healing.", author: "Dean Ornish" },
];

// ============================================
// FEEDBACK QUOTES (For sending/writing feedback)
// ============================================
export const feedbackQuotes = [
  { text: "Feedback is the breakfast of champions.", author: "Ken Blanchard" },
  { text: "The misuse of language infects the soul with evil.", author: "Socrates" },
  { text: "A friend is someone who tells you the truth even when it's hard to hear.", author: "Unknown" },
  { text: "He who fears being told his faults will never learn to do better.", author: "Unknown" },
  { text: "The truth will set you free, but first it will piss you off.", author: "Gloria Steinem" },
  { text: "A blind spot is only dangerous as long as it remains unseen.", author: "Unknown" },
  { text: "Constructive criticism is the most sincere form of respect.", author: "Unknown" },
  { text: "To avoid criticism, say nothing, do nothing, be nothing.", author: "Aristotle" },
  { text: "Growth is the only evidence of life.", author: "John Henry Newman" },
  { text: "Awareness is the first step toward healing.", author: "Dean Ornish" },
];

// ============================================
// SPIRIT/PRAISE QUOTES (Encouraging kindness & gratitude)
// ============================================
export const spiritQuotes = [
  { text: "Feeling gratitude and not expressing it is like wrapping a present and not giving it.", author: "William Arthur Ward" },
  { text: "There are two things people want more than sex and money: recognition and praise.", author: "Mary Kay Ash" },
  { text: "Correction does much, but encouragement does more.", author: "Johann Wolfgang von Goethe" },
  { text: "Kindness is the truest wisdom.", author: "Charles Dickens" },
  { text: "The smallest act of kindness is worth more than the grandest intention.", author: "Oscar Wilde" },
  { text: "The greatest gift you can give another is not just sharing your riches, but revealing to him his own.", author: "Benjamin Disraeli" },
  { text: "Kind words can be short and easy to speak, but their echoes are truly endless.", author: "Mother Teresa" },
  { text: "Encouragement is the oxygen of the soul.", author: "George M. Adams" },
  { text: "The deep root of failure in our lives is to be found in the lack of appreciation.", author: "William James" },
  { text: "The roots of all goodness lie in the soil of appreciation.", author: "Dalai Lama" },
  { text: "Don't wait until people die to give them flowers.", author: "Unknown" },
  { text: "Unexpected kindness is the most powerful, least costly, and most underrated agent of human change.", author: "Bob Kerrey" },
];

// ============================================
// BRANDING ONE-LINERS (For empty states, footers, taglines)
// ============================================
export const brandingQuotes = [
  { text: "Turn friction into fuel.", author: "TereStats" },
  { text: "Bridge the gap between intention and impact.", author: "TereStats" },
  { text: "Helping humanity see what it's missing.", author: "TereStats" },
  { text: "The world is better when we know better.", author: "TereStats" },
  { text: "Your awareness is someone else's breakthrough.", author: "TereStats" },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get a random quote from an array
export function getRandomQuote(quotes: { text: string; author: string }[]) {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Get quote based on index (for consistent display during render)
export function getQuoteByIndex(quotes: { text: string; author: string }[], index: number) {
  return quotes[index % quotes.length];
}

// Get multiple random quotes (non-repeating)
export function getRandomQuotes(quotes: { text: string; author: string }[], count: number) {
  const shuffled = [...quotes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, quotes.length));
}
