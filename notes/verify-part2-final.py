"""
Final verification: exact code as it will appear in the blog post.
Run this to get the output numbers to paste into the markdown.
"""
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

print("=" * 60)
print("EXAMPLE 1: Single neuron learns AND")
print("=" * 60)

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([0, 0, 0, 1])

np.random.seed(42)
weights = np.random.randn(2)
bias = np.random.randn()
learning_rate = 2.0

for epoch in range(1000):
    for i in range(len(X)):
        prediction = sigmoid(np.dot(X[i], weights) + bias)
        error = y[i] - prediction
        gradient = error * prediction * (1 - prediction)
        weights += learning_rate * gradient * X[i]
        bias += learning_rate * gradient

for i in range(len(X)):
    pred = sigmoid(np.dot(X[i], weights) + bias)
    print(f"{X[i]} → {pred:.4f}  (expected {y[i]})")

print()
print("=" * 60)
print("EXAMPLE 2: Single neuron FAILS on XOR")
print("=" * 60)

y_xor = np.array([0, 1, 1, 0])

np.random.seed(42)
weights = np.random.randn(2)
bias = np.random.randn()
learning_rate = 2.0

for epoch in range(1000):
    for i in range(len(X)):
        prediction = sigmoid(np.dot(X[i], weights) + bias)
        error = y_xor[i] - prediction
        gradient = error * prediction * (1 - prediction)
        weights += learning_rate * gradient * X[i]
        bias += learning_rate * gradient

for i in range(len(X)):
    pred = sigmoid(np.dot(X[i], weights) + bias)
    print(f"{X[i]} → {pred:.4f}  (expected {y_xor[i]})")

print()
print("=" * 60)
print("EXAMPLE 3: Two-layer network solves XOR")
print("=" * 60)

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([[0], [1], [1], [0]])

np.random.seed(42)
W1 = np.random.randn(2, 4) * 0.5
b1 = np.zeros((1, 4))
W2 = np.random.randn(4, 1) * 0.5
b2 = np.zeros((1, 1))
lr = 2.0

for epoch in range(10000):
    hidden = sigmoid(X @ W1 + b1)
    output = sigmoid(hidden @ W2 + b2)
    loss = np.mean((y - output) ** 2)

    d_output = (output - y) * output * (1 - output)
    d_W2 = hidden.T @ d_output
    d_b2 = d_output.sum(axis=0, keepdims=True)

    d_hidden = (d_output @ W2.T) * hidden * (1 - hidden)
    d_W1 = X.T @ d_hidden
    d_b1 = d_hidden.sum(axis=0, keepdims=True)

    W2 -= lr * d_W2
    b2 -= lr * d_b2
    W1 -= lr * d_W1
    b1 -= lr * d_b1

    if epoch % 2000 == 0:
        print(f"Epoch {epoch:5d}  Loss: {loss:.6f}")

print()
print("Final predictions:")
hidden = sigmoid(X @ W1 + b1)
output = sigmoid(hidden @ W2 + b2)
for i in range(len(X)):
    print(f"{X[i]} → {output[i][0]:.4f}  (expected {y[i][0]})")

print()
print("=" * 60)
print("EXAMPLE 4: Three-layer network learns addition (SGD)")
print("=" * 60)

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
    # Shuffle the training data each epoch
    indices = np.random.permutation(n_samples)
    epoch_loss = 0.0

    for s in indices:
        x = X_train[s:s+1]       # shape: (1, 2)
        target = y_train[s:s+1]  # shape: (1, 1)

        # Forward
        h1 = sigmoid(x @ W1 + b1)
        h2 = sigmoid(h1 @ W2 + b2)
        out = sigmoid(h2 @ W3 + b3)

        epoch_loss += (target[0,0] - out[0,0]) ** 2

        # Backward
        d_out = (out - target) * out * (1 - out)
        d_W3 = h2.T @ d_out
        d_b3 = d_out

        d_h2 = (d_out @ W3.T) * h2 * (1 - h2)
        d_W2 = h1.T @ d_h2
        d_b2 = d_h2

        d_h1 = (d_h2 @ W2.T) * h1 * (1 - h1)
        d_W1 = x.T @ d_h1
        d_b1 = d_h1

        # Update weights after each example
        W3 -= lr * d_W3;  b3 -= lr * d_b3
        W2 -= lr * d_W2;  b2 -= lr * d_b2
        W1 -= lr * d_W1;  b1 -= lr * d_b1

    if epoch % 40 == 0:
        print(f"Epoch {epoch:5d}  Loss: {epoch_loss / n_samples:.6f}")

print()
print("Test predictions:")
test_pairs = [(23, 45), (35, 12), (91, 6), (50, 50), (73, 84), (0, 0), (99, 99)]
for a, b in test_pairs:
    x = np.array([[a / 100.0, b / 100.0]])
    h1 = sigmoid(x @ W1 + b1)
    h2 = sigmoid(h1 @ W2 + b2)
    pred = sigmoid(h2 @ W3 + b3)
    result = pred[0][0] * 200
    print(f"  {a:2d} + {b:2d} = {result:5.1f}  (actual: {a + b})")
