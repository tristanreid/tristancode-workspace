---
title: "Minds, Brains and Computers"
description: "I wrote neural nets in BASIC before they were cool. The experience changed the course of my life."
weight: 10
series: "Neural Nets from Scratch"
skin: chalkboard
draft: true
---

I've always felt a deep affinity for neural networks. It was my first exposure to machine learning, and it was the first time I felt like I was building something that was actually learning.

---

## The Seminar

As an undergraduate at Duke, I enrolled in a seminar called "Minds, Brains and Computers." I was a Cognitive Psychology major at the time, fascinated by the question of how human minds actually work — not the mechanical or biological aspects of human brains, specifically. I just wondered: what does it mean for a brain to *learn*? Our textbook was Michael Arbib's "Brains, Machines, and Mathematics" (2nd ed.), a wonderfully accessible introduction.

The seminar sat at the intersection of three fields: psychology (what do minds do?), neuroscience (what do brains do?), and computer science (can we build something that does the same thing?). The most exciting idea in the room was **connectionism** — the theory that cognition emerges from networks of simple, interconnected units.

Not logic gates. Not symbolic rules. Not "if the patient has a fever and a cough, then diagnose flu." Something far more interesting: thousands of tiny, neuron-like nodes, connected by weighted links, and learning by adjusting those weights based on experience.

The connectionist claim was radical: you don't need to write rules. You just need the right network architecture and enough examples, and the rules *emerge* from the learning process itself. Intelligence isn't programmed. It's *grown*.

We didn't just read about this. We built one.

---

## What a Neural Net Actually Is

The core idea is strikingly simple.

A neural network is a collection of nodes arranged in layers. Each node takes in some numbers, multiplies them by **weights** (which are just numbers too), adds the results together, and passes the total through a simple function that squishes it into a useful range. The output of one layer becomes the input to the next.

```
Input → [Multiply by weights] → [Sum up] → [Squish] → Output
```

That's it. That's the whole neuron. Everything else — the learning, the intelligence, the hype — comes from doing this simple operation *many times* with *many nodes* and adjusting the weights based on whether the network got the right answer.

The learning rule is called **backpropagation**, and it's essentially this: run an input through the network, see how wrong the answer is, then trace backward through the network adjusting each weight a tiny bit in the direction that would have made the answer less wrong. Do this thousands of times with thousands of examples, and the network gradually gets better.

The mathematics behind this had been worked out in 1986 by Rumelhart, Hinton, and Williams, and by the time I sat in that seminar, the implications were still reverberating through cognitive science. Their paper had solved a problem that had stumped the field for two decades: how to train a network with hidden layers — layers between input and output that could learn their own internal representations.

This was the breakthrough that made neural nets genuinely interesting. A network with only inputs and outputs is severely limited. With hidden layers, a neural net can learn to represent concepts that nobody programmed in. It discovers its own features.

---

## Writing It in BASIC

For our seminar project, I implemented a neural network in BASIC. On a machine that would be comfortably outperformed by a modern dishwasher, I typed in the loops and arrays that implemented forward propagation, error calculation, and backpropagation. The network was relatively simple — a couple of layers with a small handful of nodes. I trained it by entering numbers on the command line and giving it feedback on whether it produced the correct answer.

I remember thinking: *this is actually learning.* Not looking things up in a table. Not following rules someone wrote. Learning. From experience. The way we do.

I felt at the time like I had a special affinity for training neural nets — a sense for how many times to repeat the same examples before introducing new ones, and when to periodically retrain the network on all of the examples at once.

It was the most interesting thing I'd ever built.

---

## The Switch

I walked into that seminar as a Cognitive Psychology major and walked out pointed in a different direction. Not because I'd lost interest in how minds work — if anything, the seminar had deepened it. But I'd realized that the most exciting way to study the mind was to *build* one. Or at least to try.

I switched my major to Computer Science.

It wasn't a clean pivot. Cognitive psychology had given me intuitions about learning, memory, and representation that would prove surprisingly useful in software engineering. And the question that had drawn me into psychology in the first place — *how does understanding emerge from simple components?* — turned out to be the central question of neural network research too. I just found I preferred asking the question with code.

The AI course had prerequisites, which in turn had their own prerequisites, so it was over a year before I could take it. The CS department was in the process of transitioning from C to C++. When I finally reached the AI course, the description promised exactly what I was hoping for:

```
Heuristic versus algorithmic methods; programming of
games such as chess; theorem proving and its relation
to correctness of programs; readings in simulation of
cognitive processes, problem solving, semantic memory,
analogy, adaptive learning
```

The textbook was the classic "Artificial Intelligence: A Modern Approach" by Russell and Norvig — a wonderful introduction to the field.

Unfortunately, one of the first things we learned was that neural networks were no longer considered a promising direction for artificial intelligence. The field had moved on. Everything was **expert systems** — hand-crafted rules for making decisions. We spent our time learning Prolog, a logic programming language built for exactly that kind of symbolic reasoning. It was the opposite of connectionism: intelligence as a set of rules written by humans, not patterns learned from data.

I continued on with computer science as my major. But I never forgot the idea of connectionism.

---

## The Winters

Here's the thing that's easy to forget in the current AI frenzy: when I was writing neural nets in BASIC, they were deeply unfashionable.

Neural networks have had one of the most turbulent histories in computer science, cycling between wild enthusiasm and near-total abandonment:

**The first wave (1950s–1960s):** Frank Rosenblatt builds the Perceptron in 1958 — a single-layer neural network that can learn to classify inputs. The New York Times reports it as the embryo of a computer that "will be able to walk, talk, see, write, reproduce itself and be conscious of its existence." The hype is enormous.

Then in 1969, Marvin Minsky and Seymour Papert publish *Perceptrons*, a rigorous mathematical critique showing that single-layer networks can't learn even simple functions like XOR (exclusive or — true when exactly one input is true). The funding dries up. The first AI winter begins.

**The second wave (1980s–1990s):** The backpropagation breakthrough of 1986 solves the problem Minsky and Papert identified. Multi-layer networks with hidden layers *can* learn XOR and much more. David Rumelhart and James McClelland publish the landmark two-volume *Parallel Distributed Processing* — the connectionist bible — and the field is reborn as a major force in cognitive science.

This is the era I stumbled into. Neural nets were intellectually alive and genuinely exciting. But within a few years, the enthusiasm would fade again. Support vector machines and other methods proved more practical for the problems people cared about in the late 1990s and 2000s. Neural nets retreated to a niche. Serious machine learning researchers moved on.

**The third wave (2012–present):** Geoffrey Hinton, Yann LeCun, and Yoshua Bengio — who had kept working on neural nets through the wilderness years — demonstrate that deep networks trained on GPUs can shatter benchmarks in image recognition, speech, and translation. The field explodes. "Deep learning" enters the vocabulary. And within a decade, neural nets are generating text, images, music, and code.

Writing neural nets in BASIC in the 1990s was like being an early investor in a company that wouldn't IPO for twenty years. The idea was right. The timing was premature. The vindication was slow, then sudden.

---

## What I Didn't Know

Sitting in that seminar, I had no idea that the simple mechanism I was implementing — multiply, sum, squish, adjust — would eventually scale to systems with hundreds of billions of parameters that can write poetry, debug code, and pass the bar exam.

I couldn't have imagined that the backpropagation algorithm I coded in BASIC would become the foundation of the most transformative technology of the early 21st century.

But I also think the essence hasn't changed. A modern large language model is, at its core, still doing the same thing my BASIC program did: multiplying inputs by weights, summing them up, squishing through a nonlinearity, and adjusting based on errors. The scale is different. The architecture is more sophisticated. The training data is the entire internet instead of a handful of examples.

But the fundamental idea — that intelligence can emerge from simple, repeated, trainable operations — is the same idea that lit up that seminar room.

---

## What's Coming

This series is about recapturing that sense of surprise. We're going to build neural nets from scratch, starting from something almost as simple as my BASIC program and working our way up to experiments with small language models.

Here's the plan:

1. **Minds, Brains and Computers** — You are here
2. [Neural Nets Are Simpler Than You Think](/blog/neural-nets-simpler-than-you-think/) — Building a neural net from scratch and teaching it arithmetic
3. [A Tour of Karpathy's Tutorials](/blog/neural-nets-karpathy-tour/) — Walking through the best resource for building LLMs from zero
4. [Building a Mixture-of-Experts Model](/blog/neural-nets-mixture-of-experts/) — Can a small model learn to specialize?
5. [Adding "Thinking"](/blog/neural-nets-adding-thinking/) — Can architecture alone teach a model to reason?
6. [The Economics of Tool Use](/blog/neural-nets-tool-use/) — When should a model compute internally vs. call for help?

The arc of this series mirrors my own trajectory: start with the simple, personal encounter with the idea. Build understanding from first principles. Then push into genuinely open questions.

Let's go.

---

*Next: [Neural Nets Are Simpler Than You Think](/blog/neural-nets-simpler-than-you-think/)*
