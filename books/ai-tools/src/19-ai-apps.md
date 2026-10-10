# Building an AI-enabled application

An **AI-enabled application** is an app that uses an AI model inside it to do something useful. You do not need to train a model. You use a ready model (like Gemini) and build a small app around it. This is Lab experiment 17.

## Start with a real problem

Pick a problem from real life. Keep it small. Some ideas:

| Field | Problem | What the app does |
|---|---|---|
| Education | Students in a village cannot afford tutors | Explains any 10th class topic in Telugu, with a quiz |
| Healthcare | People do not understand their medical reports | Reads a report (photo) and explains it in simple words, and says "see a doctor" |
| Agriculture | A farmer in Anakapalle sees spots on a plant | Takes a photo and suggests what the disease may be and what to do |
| Marketing | A small shop in Jagadamba junction needs posts | Writes Instagram captions and WhatsApp messages for offers |
| College | New students get lost on campus | Answers questions about rooms, timings and bus routes |

## Three ways to build, from easy to harder

### Way 1: A custom chatbot (no code)

Make a chatbot with a fixed role and instructions.

- **Gemini Gems:** In Gemini, click **Gems** → **New Gem**. Give it a name, instructions, and optionally files. Save. Now it is your app.
- **ChatGPT custom GPTs:** Similar, under **Explore GPTs → Create** (may need a paid plan).
- **NotebookLM:** Upload your college handbook. Share the notebook. It is now a "campus helper" app.

Example instructions for a Gem:

```prompt
You are "Vizag Campus Buddy", a helper for first year students of our college. Answer questions about college life, study tips and Visakhapatnam in simple English. If someone asks about exam dates or fees, tell them to check the college website or ask the office. Be friendly. Keep answers under 100 words.
```

### Way 2: A small web app with Google AI Studio (little or no code)

1. Open [aistudio.google.com](https://aistudio.google.com).
2. Go to the **Build** section.
3. Describe your app in one paragraph. Example: *"A web app where a farmer uploads a photo of a plant leaf. The app says what the problem might be and gives 3 simple steps, in English and Telugu."*
4. AI Studio writes the code and shows a working app. Try it. Ask for changes.
5. You can share the link or download the code.

### Way 3: Write the code yourself with an API (some code)

An **API** lets your own program talk to the AI model. You need an **API key** from AI Studio (free).

```
# pip install google-genai
from google import genai

client = genai.Client(api_key="PASTE_YOUR_KEY_HERE")

topic = input("Which topic do you want explained? ")
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=f"Explain {topic} to a 10th class student in Telugu. Under 100 words.",
)
print(response.text)
```

Run this in [Google Colab](https://colab.research.google.com) or on your laptop. That is a complete AI app in 8 lines. Add a loop, a menu or a web page with [Streamlit](https://streamlit.io) to make it bigger.

> Never share your API key. Do not paste it in WhatsApp groups or put it on GitHub. Anyone with the key can use your account.

## Design before you build

Write one page answering:

1. **Problem:** What problem? For whom?
2. **Input:** What does the user give? Text, photo, voice?
3. **AI step:** What does the model do?
4. **Output:** What does the user get?
5. **Risks:** What if the AI is wrong? Privacy? Bias? (Chapter 6)
6. **Limits:** What will the app **not** do? (A health app must say "see a doctor".)

## Try it

- Make a Gem or a NotebookLM for one problem from the table. Test it with 5 questions. Note 2 things it got wrong.
- Open AI Studio → **Build** and describe a small app. See what it generates.
- Get an API key and run the 8-line Python program in Colab.
- Explore [Hugging Face Spaces](https://huggingface.co/spaces) to see thousands of small AI apps made by people. Many have their code open.

## New words

- **Application (app)** — a program made for users to do a task.
- **AI-enabled** — has an AI model inside it.
- **Chatbot** — an app you talk to by typing.
- **Gem / custom GPT** — a personal version of Gemini / ChatGPT with your own instructions.
- **API** — Application Programming Interface; a way for one program to use another program's service.
- **API key** — a secret code that identifies you when using an API.
- **Colab** — Google's free online Python notebook.
- **Streamlit** — a Python tool for making simple web apps.
- **Risk** — something that could go wrong.
