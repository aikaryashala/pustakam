# Generative AI and LLMs

## What is Generative AI?

Old AI mainly **classified** things. Is this a cat or a dog? Is this email spam or not?

**Generative AI** is different. It **creates** new things. It can write a poem, draw a picture, compose music, make a video or write a program. The word *generate* means *to make*.

| Input you give | Generative AI makes |
|---|---|
| "Write a poem about Rushikonda beach" | A new poem |
| "A fishing boat at sunrise, oil painting" | A new image |
| "Write a C program to add two numbers" | New code |
| A 20-page PDF | A short summary |

## What is an LLM?

An **LLM** is a **Large Language Model**. It is the engine inside ChatGPT, Gemini and Claude.

- **Large** — it has billions of numbers (called parameters) inside it.
- **Language** — it works with text: English, Telugu, Hindi, Python, C and more.
- **Model** — it was trained on a huge amount of text from books and the internet.

## How does an LLM work? (Simple version)

An LLM does one thing. It guesses the **next word**.

Give it "Visakhapatnam is a city on the east". It guesses "coast". Add that and ask again. It guesses "of". Then "India". It keeps going, one word at a time, until the answer is complete.

That is all. But because it read so much text, its guesses are very good. It can answer questions, write essays and write code just by guessing the next word again and again.

> Actually, the model works with **tokens**, not words. A token is a word or a part of a word. "Visakhapatnam" might be 4 tokens. You will see the word *token* in many AI tools.

## Important things to know about LLMs

1. **They can be wrong.** An LLM does not "know" facts. It guesses what sounds right. Sometimes it makes up things that are false. This is called a **hallucination**. Always check important facts.
2. **They have a cut-off date.** The model learned from text up to some date. It may not know last month's news. Some tools fix this by searching the web.
3. **They have a context window.** This is how much text the model can read at one time. If you paste a very long document, the model may forget the start.
4. **They are not alive.** An LLM has no feelings, no opinions and no memory of you (unless the app saves your chat).
5. **Same question, different answers.** LLMs use a little randomness. Ask twice and you may get two different answers.

## Other generative models

- **Image models** make pictures from text. Examples: Imagen (Google), DALL·E and GPT Image (OpenAI), Midjourney, Stable Diffusion.
- **Audio models** make speech or music. Examples: ElevenLabs, Suno.
- **Video models** make short videos. Examples: Veo (Google), Sora (OpenAI).
- **Multimodal models** can handle text, images, audio and video together. Gemini and GPT are multimodal. You can show them a photo and ask a question about it.

## Try it

- In Gemini or ChatGPT, type only: *"Visakhapatnam is a city on the"* and see how it continues the sentence.
- Upload a photo of your handwritten notes to Gemini and ask it to type them out.
- See how text becomes tokens: [OpenAI Tokenizer](https://platform.openai.com/tokenizer). Type your name and a Telugu word.
- Short video: [How LLMs work – 3Blue1Brown](https://www.youtube.com/watch?v=LPZh9BOjkQs).

## New words

- **Generate** — to make or create something new.
- **Classify** — to put something into a group (cat or dog, spam or not spam).
- **LLM** — Large Language Model; an AI trained on a huge amount of text.
- **Parameter** — a number inside a model that was set during training.
- **Token** — a word or part of a word; the unit an LLM reads and writes.
- **Hallucination** — when an AI confidently gives a wrong or made-up answer.
- **Cut-off date** — the last date of the data the model was trained on.
- **Context window** — the amount of text a model can look at in one go.
- **Multimodal** — can work with many types of input: text, image, audio, video.
