import { GoogleGenerativeAI } from '@google/generative-ai'

let client

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return client
}

const extractResponseText = (response) => {
  const parts = response?.candidates?.[0]?.content?.parts
  if (Array.isArray(parts) && parts.length) {
    return parts
      .map((part) => {
        if (typeof part.text === 'string') return part.text
        return ''
      })
      .join('')
      .trim()
  }
  if (typeof response?.text === 'function') {
    return response.text()
  }
  return ''
}

const cleanJson = (text = '') => text.replace(/```json/gi, '').replace(/```/g, '').trim()

const normalizeItem = (item = {}) => {
  const amount = Number(item.amount) || 0
  const title = item.title || item.description || item.merchant || 'Expense'
  const type = item.type === 'income' ? 'income' : 'expense'
  const category = item.category || 'General'
  const date = item.date ? new Date(item.date).toISOString() : new Date().toISOString()

  return {
    title,
    amount: Math.abs(amount),
    type,
    category,
    currency: item.currency || 'USD',
    date
  }
}

export const extractExpensesFromFile = async (file) => {
  const genAI = getClient()
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
  const model = genAI.getGenerativeModel({ model: modelName })

  const base64 = file.buffer.toString('base64')
  const prompt = `You are Gemini 2.5 Image Flash, an expert accountant assistant. Read the provided document (receipt, invoice, bank statement) and respond with VALID JSON only in the shape:
{
  "items":[
    {
      "title":"Store or vendor",
      "amount":00.00,
      "currency":"USD",
      "category":"Food",
      "type":"expense",
      "date":"2024-05-01"
    }
  ],
  "summary": {
    "total": 0,
    "currency": "USD",
    "notes": "..."
  }
}

- Titles should be concise merchant descriptions.
- Amounts must be numeric positives without symbols; type "income" only if clearly revenue.
- Use single-word categories (Food, Travel, Rent, Utilities, etc.).
- Dates must be YYYY-MM-DD; estimate when missing.
- Currency defaults to USD if unspecified.
- Provide short summary notes (1-2 sentences).
- Do NOT include markdown or explanations.`

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: base64,
        mimeType: file.mimetype
      }
    }
  ])

  const text = extractResponseText(result.response)
  const cleaned = cleanJson(text)
  let parsed

  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    throw new Error('Unable to parse Gemini response')
  }

  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error('Gemini response missing items array')
  }

  return {
    items: parsed.items.map((item) => normalizeItem(item)),
    summary: parsed.summary || null
  }
}
