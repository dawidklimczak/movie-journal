import OpenAI from 'openai';
import { config, hasOpenAi } from '../config.js';
import { CATEGORIES, categoryLabel } from '../domain/categories.js';

/**
 * Ile pytań może zadać AI, zanim wymusimy domknięcie rozmowy.
 * Model sam z siebie rzadko uznaje, że ma dość materiału — bez tego limitu
 * wywiad ciągnąłby się w nieskończoność.
 */
const MAX_AI_QUESTIONS = 5;

class LlmError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

let client = null;
function getClient() {
  if (!hasOpenAi()) {
    throw new LlmError('Brak OPENAI_API_KEY — rozmowa z AI jest niedostępna.', 503);
  }
  if (!client) client = new OpenAI({ apiKey: config.openaiApiKey });
  return client;
}

/**
 * Rodziny gpt-5 / o-* nie przyjmują `temperature` i używają `max_completion_tokens`.
 * Dzięki temu OPENAI_MODEL można podmienić bez ruszania kodu.
 */
function isReasoningStyleModel(model) {
  return /^(gpt-5|o[1-9])/.test(model);
}

async function complete({ messages, maxTokens, temperature, json = false }) {
  const model = config.openaiModel;
  const payload = {
    model,
    messages,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  };

  if (isReasoningStyleModel(model)) {
    payload.max_completion_tokens = maxTokens;
  } else {
    payload.max_tokens = maxTokens;
    payload.temperature = temperature;
  }

  let response;
  try {
    response = await getClient().chat.completions.create(payload);
  } catch (err) {
    if (err instanceof LlmError) throw err;
    const status = err?.status === 401 ? 502 : 502;
    throw new LlmError(`OpenAI odrzuciło zapytanie: ${err?.message || 'nieznany błąd'}`, status);
  }

  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) throw new LlmError('OpenAI zwróciło pustą odpowiedź.');
  return text;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new LlmError('OpenAI zwróciło odpowiedź, której nie da się sparsować jako JSON.');
  }
}

function ratingsBlock(overallRating, detailedRatings) {
  const lines = CATEGORIES.filter((c) => detailedRatings?.[c.id] != null).map(
    (c) => `- ${c.label}: ${detailedRatings[c.id]}/10`
  );
  return [`Ocena ogólna: ${overallRating}/10`, ...lines].join('\n');
}

function movieBlock(movie) {
  const parts = [`Tytuł: ${movie.title}`];
  if (movie.year) parts.push(`Rok: ${movie.year}`);
  if (movie.director) parts.push(`Reżyseria: ${movie.director}`);
  if (movie.genre) parts.push(`Gatunek: ${movie.genre}`);
  return parts.join('\n');
}

/**
 * Fakty z TMDB, o które AI może zaczepić pytanie. Bez tego mały model pyta
 * generycznie ("czy jest scena, która zapadła Ci w pamięć?") albo zmyśla fabułę.
 */
function contextBlock(context) {
  if (!context) return '';

  const parts = [];
  if (context.overview) parts.push(`Streszczenie: ${context.overview}`);
  if (context.runtime) parts.push(`Długość: ${context.runtime} min`);
  if (context.genres?.length) parts.push(`Gatunki: ${context.genres.join(', ')}`);
  if (context.cast?.length) {
    const cast = context.cast
      .map((p) => (p.character ? `${p.name} (${p.character})` : p.name))
      .join(', ');
    parts.push(`Obsada: ${cast}`);
  }
  if (context.keywords?.length) parts.push(`Tagi tematyczne: ${context.keywords.join(', ')}`);

  if (!parts.length) return '';

  return [
    'KONTEKST O FILMIE (z bazy TMDB — użytkownik go NIE widzi):',
    ...parts,
    '',
    'Jak z niego korzystać:',
    '- KAŻDE Twoje pytanie ma być zaczepione o konkret z tej sekcji: imię bohatera,',
    '  nazwisko aktora, miejsce, wątek albo temat. To jest najważniejsza zasada.',
    '- ŹLE: "Czy jakaś scena szczególnie zapadła Ci w pamięć?" — to pytanie o niczym.',
    '  ŹLE: "Co sądzisz o postaciach?" — zbyt ogólne.',
    '  DOBRZE: "Jak wypadła dla Ciebie <bohater z sekcji wyżej> w relacji z <inny bohater>?"',
    '  DOBRZE: "<miejsce albo wątek z sekcji wyżej> — kupiłeś to, czy zostało tylko tłem?"',
    '  W nawiasach ostrych są miejsca do podstawienia — wstaw tam nazwy z sekcji wyżej,',
    '  nigdy nie przepisuj samych nawiasów ani przykładów dosłownie.',
    '- To materiał na pytania, a NIE treść do opowiedzenia. Użytkownik widział film, Ty nie.',
    '  Nie streszczaj mu fabuły i nie informuj go o niczym z tej sekcji.',
    '- Trzymaj się wyłącznie tego, co tu napisano. Nie wymyślaj scen, dialogów ani postaci,',
    '  których tu nie ma — użytkownik od razu wyłapie, że zmyślasz.',
  ].join('\n');
}

/**
 * Znajduje kategorie wyraźnie odstające od oceny ogólnej — to najlepszy materiał
 * na pytania, bo tam użytkownik ma realnie coś do powiedzenia.
 */
function outliers(overallRating, detailedRatings) {
  return CATEGORIES.filter((c) => detailedRatings?.[c.id] != null)
    .map((c) => ({ label: c.label, diff: detailedRatings[c.id] - overallRating }))
    .filter((c) => Math.abs(c.diff) >= 2)
    .map((c) => `${c.label} (${c.diff > 0 ? '+' : ''}${c.diff} wzgl. oceny ogólnej)`);
}

const INTERVIEWER_RULES = `Jesteś wnikliwym rozmówcą-kinofilem prowadzącym krótki wywiad z użytkownikiem tuż po seansie.
Twoje zadanie: wydobyć z niego konkretne wrażenia, których sam by nie zapisał.

Zasady:
- Piszesz WYŁĄCZNIE po polsku, zwracasz się na "Ty", ciepło i bez patosu.
- Zadajesz DOKŁADNIE JEDNO pytanie naraz. Maksymalnie 2-3 zdania.
- Nawiązujesz do tego, co użytkownik właśnie napisał — nie zadajesz pytań z listy w oderwaniu od rozmowy.
- Drążysz konkret: sceny, decyzje bohaterów, emocje, momenty w których coś zgrzytało.
- Nie oceniasz filmu za użytkownika i nie streszczasz fabuły.
- Nie zadajesz pytań, na które użytkownik już odpowiedział.
- Bez emoji, bez markdownu, bez list.

Odpowiadasz zawsze obiektem JSON o polach:
{"message": "treść pytania lub domknięcia", "isFinal": false}
Pole "isFinal" ustaw na true dopiero wtedy, gdy zebrałeś dość materiału na recenzję —
wtedy "message" ma podziękować i zapytać, czy użytkownik chce coś jeszcze dodać.`;

/**
 * Zwraca kolejną wypowiedź prowadzącego rozmowę.
 * @param {{movie: object, overallRating: number, detailedRatings: object, messages: Array<{role: string, text: string}>}} input
 * @returns {Promise<{message: string, isFinal: boolean}>}
 */
export async function nextInterviewMessage({ movie, overallRating, detailedRatings, messages, context }) {
  const askedCount = messages.filter((m) => m.role === 'ai').length;
  const answeredCount = messages.filter((m) => m.role === 'user').length;
  const mustClose = askedCount >= MAX_AI_QUESTIONS - 1;

  const odd = outliers(overallRating, detailedRatings);

  const prompt = [
    'FILM:',
    movieBlock(movie),
    '',
    contextBlock(context),
    '',
    'OCENY WYSTAWIONE PRZEZ UŻYTKOWNIKA:',
    ratingsBlock(overallRating, detailedRatings),
    odd.length ? `\nKategorie odstające od oceny ogólnej (dobry materiał na pytanie): ${odd.join(', ')}` : '',
    '',
    askedCount === 0
      ? [
          'To początek rozmowy. Przywitaj się jednym zdaniem i odnieś się do wystawionej oceny ogólnej.',
          context
            ? 'Pierwsze pytanie zaczep o konkret z kontekstu filmu — bohatera, miejsce albo wątek.'
            : 'Zadaj pierwsze, otwarte pytanie o wrażenia po seansie.',
        ].join(' ')
      : `Zadałeś już ${askedCount} pyt., użytkownik odpowiedział ${answeredCount} razy.`,
    mustClose
      ? 'To ostatnia tura — ustaw "isFinal" na true i domknij rozmowę.'
      : 'Ustaw "isFinal" na true tylko jeśli naprawdę masz już dość materiału.',
  ]
    .filter(Boolean)
    .join('\n');

  const chat = messages.map((m) => ({
    role: m.role === 'ai' ? 'assistant' : 'user',
    content: m.text,
  }));

  const text = await complete({
    json: true,
    maxTokens: 300,
    temperature: 0.8,
    messages: [
      { role: 'system', content: INTERVIEWER_RULES },
      { role: 'system', content: prompt },
      ...chat,
    ],
  });

  const parsed = parseJson(text);
  const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
  if (!message) throw new LlmError('OpenAI nie zwróciło treści pytania.');

  return {
    message,
    isFinal: Boolean(parsed.isFinal) || mustClose,
  };
}

const SUMMARY_RULES = `Piszesz notatkę filmową na podstawie rozmowy z użytkownikiem tuż po seansie.

Zasady:
- WYŁĄCZNIE po polsku, w drugiej osobie liczby pojedynczej ("Doceniasz...", "Zauważasz...").
- 3 do 5 zdań, jeden akapit, bez nagłówków, list, cudzysłowów i emoji.
- Opierasz się TYLKO na tym, co użytkownik faktycznie napisał, oraz na jego ocenach.
  Nie dopisujesz faktów o filmie, których nie było w rozmowie.
- Oddajesz jego opinię, nie swoją. Nie oceniasz filmu od siebie.
- Uwzględniasz zarówno to, co go zachwyciło, jak i zastrzeżenia — jeśli jakieś padły.
- To ma się czytać jak osobista notatka w notatniku, nie jak recenzja prasowa.

Odpowiadasz obiektem JSON: {"summary": "treść notatki"}`;

/**
 * Buduje podsumowanie recenzji z historii rozmowy i ocen.
 * @returns {Promise<string>}
 */
export async function generateSummary({ movie, overallRating, detailedRatings, messages }) {
  const transcript = messages
    .map((m) => `${m.role === 'ai' ? 'PYTANIE' : 'UŻYTKOWNIK'}: ${m.text}`)
    .join('\n');

  const text = await complete({
    json: true,
    maxTokens: 400,
    temperature: 0.6,
    messages: [
      { role: 'system', content: SUMMARY_RULES },
      {
        role: 'user',
        content: [
          'FILM:',
          movieBlock(movie),
          '',
          'OCENY:',
          ratingsBlock(overallRating, detailedRatings),
          '',
          'ROZMOWA:',
          transcript || '(użytkownik nie dodał komentarzy — oprzyj notatkę wyłącznie na ocenach)',
        ].join('\n'),
      },
    ],
  });

  const parsed = parseJson(text);
  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  if (!summary) throw new LlmError('OpenAI nie zwróciło treści podsumowania.');
  return summary;
}

export { LlmError, MAX_AI_QUESTIONS, categoryLabel };
