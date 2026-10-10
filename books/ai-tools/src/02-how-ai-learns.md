# How AI learns

## Data, model, prediction

Most AI today works in three steps.

1. **Data.** We collect many examples. For example, 10,000 photos of cats and 10,000 photos of dogs.
2. **Training.** The computer looks at the examples again and again. It slowly adjusts numbers inside itself until it gets most answers right. The result is called a **model**.
3. **Prediction.** We give the model a new photo. It says "cat" or "dog". This is called a prediction, or an **output**.

The whole method is called **Machine Learning (ML)**. The machine learns from data. Nobody writes the rules by hand.

## A small example

Suppose you want to predict the price of a flat in Madhurawada. You collect data: size of the flat, floor, distance from the beach and the price. You give this data to an ML model. It learns the pattern. Then you give it a new flat. It predicts the price.

The model is not magic. It only finds patterns in the data you gave it. If your data is bad, the model is bad. There is a saying: **garbage in, garbage out**.

## Three ways of learning

| Way | How it works | Example |
|---|---|---|
| Supervised learning | Data has the correct answers (labels) | Photos labelled "cat" or "dog" |
| Unsupervised learning | Data has no labels; the model finds groups | Grouping customers by what they buy |
| Reinforcement learning | The model gets a reward when it does well | A game-playing AI, a robot learning to walk |

## Neural networks

A **neural network** is a type of model. It is loosely inspired by the brain. It has many small units called **neurons**, arranged in **layers**. Each neuron does a small calculation. Together, millions of them can learn very complex patterns.

When a network has many layers, we call it **deep learning**. Deep learning is behind almost all modern AI: voice assistants, face unlock, self-driving cars and ChatGPT.

## Training needs a lot of power

Training a big model needs:

- A lot of data (the whole internet, in some cases).
- A lot of computers with special chips called **GPUs**.
- A lot of electricity and money.

This is why only big companies like Google, OpenAI, Meta and Anthropic train the largest models. But anyone can **use** them. That is what this course is about.

## Try it

- Play [Quick, Draw!](https://quickdraw.withgoogle.com/) by Google. You draw. The AI guesses. Every drawing becomes training data.
- Try [Teachable Machine](https://teachablemachine.withgoogle.com/). Train your own image model in 5 minutes using your webcam. No code needed.
- Ask Gemini: *"Explain supervised learning with an example from a Vizag fish market."*

## New words

- **Data** — facts, numbers, text or images that a computer can store.
- **Model** — the result of training; the "brain" that gives predictions.
- **Training** — the process of learning from data.
- **Prediction** — the answer a model gives for a new input.
- **Label** — the correct answer attached to a piece of data.
- **Pattern** — something that repeats in data.
- **Neural network** — a model made of many small connected units (neurons).
- **Layer** — a group of neurons in a network.
- **GPU** — Graphics Processing Unit; a chip that is very fast at the maths AI needs.
