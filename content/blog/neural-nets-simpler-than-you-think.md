---
title: "Neural Nets Are Simpler Than You Think"
description: "A neural network in 20 lines of Python. We build one from scratch, break it on purpose, fix it, and teach it arithmetic."
weight: 20
series: "Neural Nets from Scratch"
skin: chalkboard
---

In [Part 1](/blog/neural-nets-origin-story/), I described writing a neural network in BASIC as an undergrad — a couple of layers, a handful of nodes, training by hand on the command line. It was the most interesting thing I'd ever built.

Now let's build one together. In Python this time. And I want to convince you of something: the core of a neural network is *embarrassingly* simple. Not simple-once-you-understand-it simple. Simple-from-the-start simple.

We're going to build a neural net from scratch — no PyTorch, no TensorFlow, just NumPy — and by the end of this post, it will learn to do arithmetic. Along the way, we'll recreate one of the most famous failures in AI history, and then fix it.

But first — try it yourself. This is a live neural network running in your browser. Pick a task, hit **Train**, and watch it learn (or fail to learn):

{{< interactive component="nn-playground" >}}

Try **XOR with no hidden layer** — the network gets stuck at 0.5 for everything. Then switch to **4 hidden neurons** and train again. That's the fix that took fifteen years to figure out. We'll build this from scratch below.

---

## A Single Neuron

A neural network is made of neurons. A neuron does three things:

1. **Multiply** each input by a weight
2. **Sum** the results (plus a bias)
3. **Squish** the total through an activation function

That's it. Here's the whole thing:

```python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def neuron(inputs, weights, bias):
    return sigmoid(np.dot(inputs, weights) + bias)
```

The **sigmoid** function is our "squisher" — it takes any number and maps it to a value between 0 and 1. Large positive inputs get pushed toward 1. Large negative inputs get pushed toward 0. It's smooth and differentiable, which will matter when we get to learning.

The **weights** control how much each input matters. The **bias** shifts the threshold — how easily the neuron "fires." Together, they define a decision boundary.

Let's train a single neuron to learn the AND function — output 1 only when both inputs are 1:

| Input A | Input B | AND |
|:---:|:---:|:---:|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

```python
# Training data: AND gate
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([0, 0, 0, 1])

# Random starting weights
np.random.seed(42)
weights = np.random.randn(2)
bias = np.random.randn()
learning_rate = 2.0

# Train
for epoch in range(1000):
    for i in range(len(X)):
        # Forward pass
        prediction = sigmoid(np.dot(X[i], weights) + bias)

        # How wrong were we?
        error = y[i] - prediction

        # Adjust weights in the direction that reduces error
        gradient = error * prediction * (1 - prediction)
        weights += learning_rate * gradient * X[i]
        bias += learning_rate * gradient

# Test
for i in range(len(X)):
    pred = sigmoid(np.dot(X[i], weights) + bias)
    print(f"{X[i]} → {pred:.4f}  (expected {y[i]})")
```

```
[0 0] → 0.0001  (expected 0)
[0 1] → 0.0377  (expected 0)
[1 0] → 0.0379  (expected 0)
[1 1] → 0.9557  (expected 1)
```

It works. The neuron learned AND. The outputs aren't exactly 0 and 1 — they're probabilities, hovering near the correct answers. Close enough.

The learning loop is worth staring at. On every example, we:

1. **Forward pass**: compute the prediction
2. **Measure error**: how far off were we?
3. **Compute gradient**: which direction should we nudge each weight?
4. **Update**: nudge the weights a tiny bit in that direction

This is the entire learning algorithm. Everything else in deep learning — every framework, every optimization trick, every billion-dollar GPU cluster — is an elaboration of this four-step loop.

---

## The Catastrophe

Now let's try XOR. This is the function that outputs 1 when *exactly one* input is 1:

| Input A | Input B | XOR |
|:---:|:---:|:---:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

We just swap out the training data:

```python
y_xor = np.array([0, 1, 1, 0])  # XOR instead of AND
```

And run the same training loop. After 1,000 epochs:

```
[0 0] → 0.5693  (expected 0)
[0 1] → 0.5000  (expected 1)
[1 0] → 0.4307  (expected 1)
[1 1] → 0.3639  (expected 0)
```

Every output is hovering near 0.5. The neuron is maximally confused — it's barely doing better than a coin flip, and the outputs don't even trend in the right direction.

This isn't a bug. It's a mathematical impossibility. A single neuron draws a straight line through the input space, and everything on one side is "1" while everything on the other side is "0." For AND, that works — you can draw a line that separates (1,1) from the rest. For XOR, you can't. The "1" outputs are on opposite corners. No single straight line can separate them.

This is exactly the critique that Marvin Minsky and Seymour Papert published in 1969 in their book *Perceptrons*. They proved that single-layer networks couldn't learn XOR, and the AI community took this as evidence that neural nets were a dead end. Funding dried up. Research ground to a halt. The first AI winter.

The irony, of course, is that the fix was already available — it just wasn't well understood yet.

---

## The Fix: Hidden Layers

The solution is to add a **hidden layer** — a layer of neurons between the input and the output. These hidden neurons can learn their own internal representations, and the output neuron combines those representations to solve problems that no single neuron could.

Here's a two-layer network — 2 inputs, 4 hidden neurons, 1 output — implemented from scratch:

```python
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

# XOR training data
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([[0], [1], [1], [0]])

# Initialize weights randomly
np.random.seed(42)
W1 = np.random.randn(2, 4) * 0.5   # input → hidden (2 inputs, 4 hidden neurons)
b1 = np.zeros((1, 4))
W2 = np.random.randn(4, 1) * 0.5   # hidden → output (4 hidden, 1 output)
b2 = np.zeros((1, 1))
lr = 2.0

for epoch in range(10000):
    # ── Forward pass ──
    hidden = sigmoid(X @ W1 + b1)          # shape: (4, 4)
    output = sigmoid(hidden @ W2 + b2)     # shape: (4, 1)

    # ── Loss ──
    loss = np.mean((y - output) ** 2)

    # ── Backward pass (backpropagation) ──
    d_output = (output - y) * output * (1 - output)
    d_W2 = hidden.T @ d_output
    d_b2 = d_output.sum(axis=0, keepdims=True)

    d_hidden = (d_output @ W2.T) * hidden * (1 - hidden)
    d_W1 = X.T @ d_hidden
    d_b1 = d_hidden.sum(axis=0, keepdims=True)

    # ── Update weights ──
    W2 -= lr * d_W2
    b2 -= lr * d_b2
    W1 -= lr * d_W1
    b1 -= lr * d_b1

    if epoch % 2000 == 0:
        print(f"Epoch {epoch:5d}  Loss: {loss:.6f}")
```

```
Epoch     0  Loss: 0.255675
Epoch  2000  Loss: 0.000355
Epoch  4000  Loss: 0.000149
Epoch  6000  Loss: 0.000093
Epoch  8000  Loss: 0.000068
```

And the final predictions:

```python
hidden = sigmoid(X @ W1 + b1)
output = sigmoid(hidden @ W2 + b2)
for i in range(len(X)):
    print(f"{X[i]} → {output[i][0]:.4f}  (expected {y[i][0]})")
```

```
[0 0] → 0.0085  (expected 0)
[0 1] → 0.9931  (expected 1)
[1 0] → 0.9930  (expected 1)
[1 1] → 0.0065  (expected 0)
```

XOR is solved. The hidden layer learned to create an intermediate representation that makes the problem linearly separable — exactly what a single neuron couldn't do.

Look at the backward pass. It's just the chain rule from calculus, applied layer by layer from output to input. We compute how much each weight contributed to the error, and nudge it in the opposite direction. The word "backpropagation" sounds mysterious, but it's really just: *trace the blame backward and fix it*.

That's 30 lines of code. No frameworks. No libraries beyond NumPy. And it solves the problem that froze an entire field of research for fifteen years.

---

## Teaching It Arithmetic

XOR is a toy problem — four examples, binary inputs, binary output. Let's try something more ambitious: can a small neural network learn to **add two numbers**?

We'll use the same architecture, just scaled up — two hidden layers with 16 neurons each, and 500 random addition problems as training data:

```python
# Generate training data: pairs of numbers and their sum
np.random.seed(42)
n_samples = 500
a_train = np.random.randint(0, 100, n_samples)
b_train = np.random.randint(0, 100, n_samples)
sums_train = a_train + b_train

# Normalize to [0, 1] — neural nets work best with small numbers
X_train = np.column_stack([a_train / 100.0, b_train / 100.0])
y_train = sums_train.reshape(-1, 1) / 200.0  # max possible sum is 199

# Network: 2 inputs → 16 hidden → 16 hidden → 1 output
np.random.seed(1)
W1 = np.random.randn(2, 16) * 0.5
b1 = np.zeros((1, 16))
W2 = np.random.randn(16, 16) * 0.5
b2 = np.zeros((1, 16))
W3 = np.random.randn(16, 1) * 0.5
b3 = np.zeros((1, 1))
lr = 1.0

for epoch in range(200):
    # Shuffle training data each epoch
    indices = np.random.permutation(n_samples)

    for s in indices:
        x = X_train[s:s+1]       # shape: (1, 2)
        target = y_train[s:s+1]  # shape: (1, 1)

        # Forward
        h1 = sigmoid(x @ W1 + b1)
        h2 = sigmoid(h1 @ W2 + b2)
        out = sigmoid(h2 @ W3 + b3)

        # Backward
        d_out = (out - target) * out * (1 - out)
        d_W3 = h2.T @ d_out;  d_b3 = d_out
        d_h2 = (d_out @ W3.T) * h2 * (1 - h2)
        d_W2 = h1.T @ d_h2;  d_b2 = d_h2
        d_h1 = (d_h2 @ W2.T) * h1 * (1 - h1)
        d_W1 = x.T @ d_h1;   d_b1 = d_h1

        # Update weights after each example
        W3 -= lr * d_W3;  b3 -= lr * d_b3
        W2 -= lr * d_W2;  b2 -= lr * d_b2
        W1 -= lr * d_W1;  b1 -= lr * d_b1
```

There's one important change from the XOR code: instead of computing gradients over the entire dataset at once, we update the weights after *every single example*. This is **stochastic gradient descent** — the noise from processing one example at a time actually helps the network escape bad spots that batch training gets stuck in. It's how neural networks are typically trained in practice.

After 200 passes through the data, let's test it on numbers it has never seen:

```python
test_pairs = [(23, 45), (35, 12), (91, 6), (50, 50), (73, 84), (0, 0), (99, 99)]
for a, b in test_pairs:
    x = np.array([[a / 100.0, b / 100.0]])
    h1 = sigmoid(x @ W1 + b1)
    h2 = sigmoid(h1 @ W2 + b2)
    pred = sigmoid(h2 @ W3 + b3)
    result = pred[0][0] * 200
    print(f"  {a} + {b} = {result:.1f}  (actual: {a + b})")
```

```
  23 + 45 =  65.7  (actual: 68)
  35 + 12 =  46.4  (actual: 47)
  91 +  6 =  96.2  (actual: 97)
  50 + 50 = 100.3  (actual: 100)
  73 + 84 = 157.8  (actual: 157)
   0 +  0 =  18.0  (actual: 0)
  99 + 99 = 182.3  (actual: 198)
```

Not bad! In the middle of the range, the network nails it — 50+50=100.3, 91+6=96.2, 73+84=157.8. It struggles at the extremes (0+0 and 99+99) because the sigmoid function saturates near 0 and 1, making it hard to represent values at the very edges. But a network with 545 trainable parameters, trained on 500 examples, has learned the *concept* of addition.

No one told it what addition is. No one gave it the rule "add the two numbers." It figured out the relationship from examples alone.

---

## What the Hidden Layers Learned

Here's what's happening inside the network, conceptually. The first hidden layer learns to decompose the inputs into features — different neurons might respond to different ranges of input values, or to specific relationships between the two inputs. The second hidden layer recombines those features into higher-level patterns. The output layer produces the final answer.

None of this was programmed. The features emerged from the learning process — the same process we used for XOR, just with more neurons, more layers, and more data.

This is the fundamental magic of neural networks: given enough neurons and enough examples, the hidden layers will discover useful internal representations on their own. The network doesn't just memorize input-output pairs. It learns a *function* — a generalized mapping that works on inputs it has never seen before.

---

## The Gap: From Here to ChatGPT

Our addition network has 545 parameters (weights and biases). GPT-4 is estimated to have over a *trillion*. That's a factor of roughly two billion. But here's what's remarkable: the core mechanism is the same.

**What doesn't change:**

- **Forward pass**: still multiply-by-weights, sum, activate — exactly what our code does
- **Training**: still backpropagation and gradient descent — the same `d_W = h.T @ d_out` pattern we wrote by hand
- **The loss function**: still measuring "how wrong was the prediction?" and tracing the blame backward

**What changes:**

- **Scale**: billions of parameters instead of hundreds
- **Architecture**: the **transformer** replaces our simple feed-forward layers with attention mechanisms that let every input "look at" every other input — this is what makes language models possible
- **Data**: the entire internet instead of 500 addition examples
- **Tokenization**: text is converted to numbers (tokens) before it enters the network
- **Infrastructure**: distributed training across thousands of GPUs instead of a single laptop core
- **Optimization tricks**: Adam instead of vanilla gradient descent, learning rate schedules, batch normalization, dropout, mixed-precision training — decades of engineering

But if you understand our XOR network — forward pass, loss, backpropagation, weight update — you understand the conceptual core of every neural network ever built. The rest is scale and engineering.

---

## The Simplicity Is the Point

People sometimes ask: "How can a system built from simple arithmetic operations produce something that looks like intelligence?" I think the question has it backward. The whole point of neural networks — the radical claim of connectionism from [Part 1](/blog/neural-nets-origin-story/) — is that intelligence *is* what you get when you arrange enough simple operations in the right structure and train them on enough data.

Minsky and Papert were right that a single layer isn't enough. But the fix wasn't to abandon simplicity — it was to add more layers of the same simple operation, and let the network figure out the rest.

The code in this post is about 60 lines of Python. It solves XOR, it learns addition, and it demonstrates every concept that scales up to the largest language models in existence. That's not a simplification or an analogy. It's the actual mechanism, just smaller.

In the next post, we'll see how Andrej Karpathy takes this same foundation and builds it into a working language model — one that can generate text, character by character, from nothing but the pattern of "what comes next."

---

*Next: [A Tour of Karpathy's Tutorials](/blog/neural-nets-karpathy-tour/)*
