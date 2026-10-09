import type { Status, StudyLibrary, Topic } from "./types";

type SeedTopic = {
  title: string;
  status?: Status;
  notes?: string;
  links?: Topic["links"];
  children?: SeedTopic[];
};

// Starting content, built from the sources listed in ROADMAP.md. Everything starts as "to study".
const t = (
  title: string,
  extra: Omit<SeedTopic, "title"> | SeedTopic[] = {},
): SeedTopic =>
  Array.isArray(extra) ? { title, children: extra } : { title, ...extra };

const link = (label: string, url: string) => ({ label, url });

const HANDS_ON_ML = [
  link(
    "Hands-On Machine Learning, 3rd edition (O'Reilly)",
    "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/",
  ),
  link("Book notebooks on GitHub", "https://github.com/ageron/handson-ml3"),
];

// Part I of Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow.
const ML_BEGINNERS = t("ML (beginners)", {
  notes:
    "Part I of Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow by Aurélien Géron: the fundamentals of machine learning.",
  links: HANDS_ON_ML,
  children: [
    t("1. The machine learning landscape", [
      t("What machine learning is"),
      t("Why use machine learning"),
      t("Types of ML systems", {
        notes:
          "Supervised, unsupervised, semi-supervised, self-supervised and reinforcement learning. Batch versus online learning. Instance-based versus model-based learning.",
      }),
      t("Main challenges of ML", {
        notes:
          "Too little data, unrepresentative or poor-quality data, irrelevant features, overfitting and underfitting.",
      }),
      t("Testing and validating", {
        notes:
          "Train, validation and test sets. Hyperparameter tuning and model selection. Data mismatch.",
      }),
    ]),
    t("2. End-to-end ML project", [
      t("Look at the big picture", {
        notes:
          "Frame the problem, pick a performance measure, check the assumptions.",
      }),
      t("Get the data"),
      t("Explore and visualise the data"),
      t("Prepare the data", {
        notes:
          "Cleaning, handling text and categorical attributes, feature scaling, custom transformers, pipelines.",
      }),
      t("Select and train a model"),
      t("Fine-tune the model", {
        notes:
          "Grid search, randomised search, ensembles, evaluating on the test set.",
      }),
      t("Launch, monitor and maintain"),
    ]),
    t("3. Classification", [
      t("MNIST"),
      t("Training a binary classifier"),
      t("Performance measures", {
        notes:
          "Cross-validation accuracy, confusion matrices, precision and recall, the precision/recall trade-off, the ROC curve.",
      }),
      t("Multiclass classification"),
      t("Error analysis"),
      t("Multilabel and multioutput classification"),
    ]),
    t("4. Training models", [
      t("Linear regression", {
        notes: "The normal equation and computational complexity.",
      }),
      t("Gradient descent", {
        notes: "Batch, stochastic and mini-batch gradient descent.",
      }),
      t("Polynomial regression"),
      t("Learning curves"),
      t("Regularised linear models", {
        notes: "Ridge, lasso, elastic net and early stopping.",
      }),
      t("Logistic regression", {
        notes:
          "Estimating probabilities, decision boundaries, softmax regression.",
      }),
    ]),
    t("5. Support vector machines", [
      t("Linear SVM classification", { notes: "Soft margin classification." }),
      t("Nonlinear SVM classification", {
        notes: "Polynomial features, the kernel trick, Gaussian RBF kernel.",
      }),
      t("SVM regression"),
      t("Under the hood", {
        notes:
          "The decision function, the training objective, the dual problem, kernelised SVMs.",
      }),
    ]),
    t("6. Decision trees", [
      t("Training and visualising a tree"),
      t("Making predictions and class probabilities"),
      t("The CART training algorithm"),
      t("Gini impurity or entropy"),
      t("Regularisation hyperparameters"),
      t("Regression trees"),
      t("Limitations", {
        notes: "Sensitivity to axis orientation and high variance.",
      }),
    ]),
    t("7. Ensemble learning and random forests", [
      t("Voting classifiers"),
      t("Bagging and pasting", {
        notes: "Out-of-bag evaluation, random patches and subspaces.",
      }),
      t("Random forests", { notes: "Extra-trees and feature importance." }),
      t("Boosting", {
        notes:
          "AdaBoost, gradient boosting, histogram-based gradient boosting.",
      }),
      t("Stacking"),
    ]),
    t("8. Dimensionality reduction", [
      t("The curse of dimensionality"),
      t("Main approaches", { notes: "Projection and manifold learning." }),
      t("PCA", {
        notes:
          "Preserving variance, principal components, explained variance ratio, choosing the number of dimensions, randomised and incremental PCA.",
      }),
      t("Random projection"),
      t("Locally linear embedding"),
      t("Other techniques", { notes: "MDS, Isomap, t-SNE, LDA." }),
    ]),
    t("9. Unsupervised learning techniques", [
      t("k-means clustering", {
        notes:
          "The algorithm, centroid initialisation, mini-batch k-means, finding the number of clusters, limits of k-means.",
      }),
      t("Using clustering", {
        notes: "Image segmentation and semi-supervised learning.",
      }),
      t("DBSCAN and other clustering algorithms"),
      t("Gaussian mixtures", {
        notes:
          "Anomaly detection, selecting the number of clusters, Bayesian Gaussian mixture models.",
      }),
    ]),
  ],
});

// Part II of the same book.
const DL_BEGINNERS = t("DL (beginners)", {
  notes:
    "Part II of Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow by Aurélien Géron: neural networks and deep learning.",
  links: HANDS_ON_ML,
  children: [
    t("10. Neural networks with Keras", [
      t("From biological to artificial neurons", {
        notes:
          "The perceptron, multilayer perceptrons and backpropagation, regression and classification MLPs.",
      }),
      t("Implementing MLPs with Keras", {
        notes:
          "Sequential, functional and subclassing APIs. Saving and restoring models, callbacks, TensorBoard.",
      }),
      t("Fine-tuning hyperparameters", {
        notes:
          "Number of hidden layers and neurons, learning rate, batch size.",
      }),
    ]),
    t("11. Training deep neural networks", [
      t("Vanishing and exploding gradients", {
        notes:
          "Glorot and He initialisation, better activation functions, batch normalisation, gradient clipping.",
      }),
      t("Reusing pretrained layers", {
        notes:
          "Transfer learning, unsupervised pretraining, pretraining on an auxiliary task.",
      }),
      t("Faster optimisers", {
        notes: "Momentum, Nesterov, AdaGrad, RMSProp, Adam and its variants.",
      }),
      t("Learning rate scheduling"),
      t("Avoiding overfitting", {
        notes:
          "L1 and L2 regularisation, dropout, Monte Carlo dropout, max-norm.",
      }),
    ]),
    t("12. Custom models and training with TensorFlow", [
      t("A quick tour of TensorFlow"),
      t("Using TensorFlow like NumPy"),
      t("Customising models and training", {
        notes:
          "Custom losses, activations, initialisers, metrics, layers and models. Computing gradients with autodiff. Custom training loops.",
      }),
      t("TensorFlow functions and graphs"),
    ]),
    t("13. Loading and preprocessing data", [
      t("The tf.data API"),
      t("The TFRecord format"),
      t("Keras preprocessing layers", {
        notes:
          "Normalisation, discretisation, category encoding, string lookup, embeddings, text and image preprocessing.",
      }),
      t("The TensorFlow Datasets project"),
    ]),
    t("14. Computer vision with CNNs", [
      t("The architecture of the visual cortex"),
      t("Convolutional layers"),
      t("Pooling layers"),
      t("CNN architectures", {
        notes:
          "LeNet-5, AlexNet, GoogLeNet, VGGNet, ResNet, Xception, SENet and others. Choosing an architecture.",
      }),
      t("Implementing a ResNet-34 with Keras"),
      t("Pretrained models and transfer learning"),
      t("Classification and localisation"),
      t("Object detection", {
        notes: "Fully convolutional networks and YOLO.",
      }),
      t("Object tracking"),
      t("Semantic segmentation"),
    ]),
    t("15. Sequences with RNNs and CNNs", [
      t("Recurrent neurons and layers", {
        notes: "Memory cells, input and output sequences.",
      }),
      t("Training RNNs"),
      t("Forecasting a time series", {
        notes:
          "The ARMA model family, preparing the data, linear, simple RNN and deep RNN forecasts, multivariate series, forecasting several steps ahead.",
      }),
      t("Handling long sequences", {
        notes:
          "Unstable gradients, the short-term memory problem, LSTM, GRU, 1D convolutions, WaveNet.",
      }),
    ]),
    t("16. NLP with RNNs and attention", [
      t("Generating text with a character RNN"),
      t("Sentiment analysis", {
        notes: "Masking and reusing pretrained embeddings and language models.",
      }),
      t("Encoder-decoder for machine translation", {
        notes: "Bidirectional RNNs and beam search.",
      }),
      t("Attention mechanisms"),
      t("The transformer architecture", {
        notes:
          "Attention Is All You Need: positional encodings and multi-head attention.",
      }),
      t("An avalanche of transformer models"),
      t("Vision transformers"),
      t("Hugging Face Transformers library"),
    ]),
    t("17. Autoencoders, GANs and diffusion models", [
      t("Efficient data representations"),
      t("PCA with an undercomplete linear autoencoder"),
      t("Stacked autoencoders"),
      t("Convolutional, denoising and sparse autoencoders"),
      t("Variational autoencoders"),
      t("Generative adversarial networks", {
        notes:
          "Training difficulties, deep convolutional GANs, progressive growing, StyleGAN.",
      }),
      t("Diffusion models"),
    ]),
    t("18. Reinforcement learning", [
      t("Learning to optimise rewards"),
      t("Policy search"),
      t("Introduction to OpenAI Gym"),
      t("Neural network policies"),
      t("The credit assignment problem"),
      t("Policy gradients"),
      t("Markov decision processes"),
      t("Temporal difference learning and Q-learning", {
        notes: "Exploration policies, approximate Q-learning.",
      }),
      t("Deep Q-learning and its variants", {
        notes:
          "Fixed Q-value targets, double DQN, prioritised experience replay, dueling DQN.",
      }),
      t("Overview of popular RL algorithms"),
    ]),
    t("19. Training and deploying at scale", [
      t("Serving a TensorFlow model", {
        notes: "TensorFlow Serving and deploying to a cloud platform.",
      }),
      t("Deploying to mobile or embedded devices"),
      t("Running a model in a web page"),
      t("Using GPUs to speed up computation"),
      t("Training across multiple devices", {
        notes:
          "Model and data parallelism, the distribution strategies API, training on a cluster.",
      }),
    ]),
  ],
});

// A single resource as its own topic, so every link in the sources is visible on the map.
const r = (title: string, url: string, notes?: string): SeedTopic =>
  t(title, { notes, links: [link(title, url)] });

// Ahmad Osman's roadmap.
const LLMS = t("LLMs", {
  notes:
    "Ahmad Osman's roadmap for learning large language models, in five phases.",
  links: [
    link(
      "Learn LLMs roadmap (Ahmad Osman)",
      "https://www.ahmadosman.com/blog/learn-llms-roadmap/",
    ),
  ],
  children: [
    t("Phase 0: Foundations refresher", [
      t("Linear algebra and probability", [
        r(
          "3Blue1Brown: Essence of Linear Algebra",
          "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
        ),
        r(
          "MIT 18.06: Linear Algebra (Strang)",
          "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/video_galleries/video-lectures/",
        ),
        r(
          "Deep Learning Book (Goodfellow)",
          "https://www.deeplearningbook.org/",
        ),
      ]),
      t("PyTorch fundamentals", [
        r(
          "Karpathy: Neural Networks Zero to Hero",
          "https://karpathy.ai/zero-to-hero.html",
        ),
        r(
          "PyTorch: Learn the Basics",
          "https://pytorch.org/tutorials/beginner/basics/intro.html",
        ),
        r("Zero to Mastery PyTorch", "https://www.learnpytorch.io/"),
      ]),
      t("Project: build micrograd"),
      t("Project: train an MLP on MNIST"),
    ]),
    t("Phase 1: Transformers", [
      t("Build intuition", [
        r(
          "3Blue1Brown: Transformers and attention",
          "https://www.3blue1brown.com/lessons/gpt",
        ),
        r(
          "Jay Alammar: The Illustrated Transformer",
          "https://jalammar.github.io/illustrated-transformer/",
        ),
      ]),
      t("Formal theory", [
        r(
          "Stanford CS224N: NLP with Deep Learning",
          "https://www.youtube.com/playlist?list=PLoROMvodv4rMFqRtEuo6SGjY4XbRIVRd4",
          "The lecture videos.",
        ),
        r("CS224N course site", "https://web.stanford.edu/class/cs224n/"),
      ]),
      r(
        "Attention Is All You Need",
        "https://arxiv.org/abs/1706.03762",
        "Vaswani et al. The primary paper.",
      ),
      r(
        "Karpathy: Let's Build GPT",
        "https://www.youtube.com/watch?v=kCc8FmEb1nY",
      ),
      t("Project: decoder-only GPT from scratch"),
      t("Bonus: write a tokenizer", { notes: "BPE or SentencePiece." }),
    ]),
    t("Phase 2: Scaling laws and distributed training", [
      t("Scaling laws", [
        r(
          "Scaling Laws for Neural Language Models",
          "https://arxiv.org/abs/2001.08361",
          "Kaplan et al.",
        ),
        r("Chinchilla", "https://arxiv.org/abs/2203.15556", "Hoffmann et al."),
      ]),
      t("Distributed training", [
        r("Hugging Face Accelerate", "https://huggingface.co/docs/accelerate/"),
      ]),
      t("Project: run a small distributed training job"),
      t("Experiment with batch size and gradient accumulation"),
    ]),
    t("Phase 3: Alignment and efficient fine-tuning", [
      t("RLHF and instruction following", [
        r(
          "OpenAI: Aligning language models to follow instructions",
          "https://openai.com/index/instruction-following/",
        ),
        r(
          "Training language models to follow instructions",
          "https://arxiv.org/abs/2203.02155",
          "Ouyang et al., the InstructGPT paper.",
        ),
      ]),
      r("Constitutional AI", "https://arxiv.org/abs/2212.08073", "Anthropic."),
      t("LoRA", [
        r("LoRA: Low-Rank Adaptation", "https://arxiv.org/abs/2106.09685"),
        r(
          "Lightning AI: LoRA from scratch",
          "https://lightning.ai/lightning-ai/studios/code-lora-from-scratch",
        ),
      ]),
      r("QLoRA", "https://arxiv.org/abs/2305.14314"),
      t("Project: fine-tune an open model with LoRA", {
        notes:
          "GPT-2 or DistilBERT with your own LoRA adapters, on a real dataset.",
      }),
    ]),
    t("Phase 4: Production", [
      r("FlashAttention paper", "https://arxiv.org/abs/2205.14135"),
      t("Understand why FlashAttention works"),
      t("Try it with a quantised model"),
    ]),
  ],
});

const RL_GUIDE = link(
  "An Ultra Opinionated Guide to Reinforcement Learning (Joseph Suarez)",
  "https://x.com/jsuarez/status/1943692998975402064",
);
const RL_QUICKSTART = link(
  "Reinforcement Learning Quickstart Guide (Joseph Suarez)",
  "https://x.com/jsuarez/status/1854855861295849793",
);
const RL_PREQUEL = link(
  "My Advice for Programming and ML (Joseph Suarez)",
  "https://x.com/jsuarez/status/1943692968013025457",
);
const RL_FIRST_YEAR = link(
  "My first year in reinforcement learning (Spencer Cheng)",
  "https://x.com/spenccheng/status/1948806364542726188",
);
const PUFFERLIB = link("PufferLib", "https://github.com/pufferai/pufferlib");
const PUFFER_DOCS = link("PufferLib docs", "https://puffer.ai/docs.html");
const PUFFER_DISCORD = link("Puffer Discord", "https://discord.gg/puffer");
const PPO = "https://arxiv.org/abs/1707.06347";
const GAE = "https://arxiv.org/abs/1506.02438";

// Joseph Suarez's three articles, plus the projects from Spencer Cheng's first year.
const REINFORCEMENT_LEARNING = t("Reinforcement learning", {
  notes:
    "Joseph Suarez's opinionated path into reinforcement learning: start building environments straight away and fill knowledge gaps through experience.",
  links: [RL_GUIDE, RL_QUICKSTART, RL_PREQUEL, RL_FIRST_YEAR, PUFFERLIB],
  children: [
    t("Source articles", [
      t("An Ultra Opinionated Guide to RL", {
        notes: "Joseph Suarez. The main path.",
        links: [RL_GUIDE],
      }),
      t("RL Quickstart Guide", {
        notes: "Joseph Suarez. Background and practical advice.",
        links: [RL_QUICKSTART],
      }),
      t("My Advice for Programming and ML", {
        notes: "Joseph Suarez. The prequel.",
        links: [RL_PREQUEL],
      }),
      t("My first year in RL", {
        notes: "Spencer Cheng.",
        links: [RL_FIRST_YEAR],
      }),
    ]),
    t("Courses", [
      r(
        "Berkeley CS 185/285: Deep RL",
        "https://rail.eecs.berkeley.edu/deeprlcourse/",
        "Deep Reinforcement Learning, Decision Making, and Control.",
      ),
      t("Stanford CS231n", {
        notes:
          "The ML prerequisite Suarez recommends: watch the lectures by Andrej Karpathy or Justin Johnson and do the problem sets.",
        links: [
          link("CS231n course site", "https://cs231n.stanford.edu/"),
          link("CS231n course notes", "https://cs231n.github.io/"),
        ],
      }),
    ]),
    t("Prerequisites", {
      notes:
        "Start here if you cannot yet implement an LSTM forward pass without imports, or do not know ML at the level of CS231n.",
      links: [RL_PREQUEL],
      children: [
        t("Learn to program", {
          notes:
            "Avoid abstraction and solve the problem at hand in the simplest way. Do not get nerd sniped by OOP or functional dogma, test-driven development, type hints, fancy config or CI, or web frameworks. Do not grind LeetCode to learn, and do not worry much about IDEs.",
          children: [
            t("Learn by doing", {
              notes:
                "Start with something that takes a few hours, then a few days. Simple games give quick visual feedback.",
              children: [
                r(
                  "raylib",
                  "https://www.raylib.com/",
                  "Suggested for rendering.",
                ),
              ],
            }),
            t("Start with Python", {
              notes:
                "Write a few basic games or tools and move on. Avoid heavy packages, inheritance and decorators.",
              children: [
                r(
                  "uv",
                  "https://docs.astral.sh/uv/",
                  "For package management.",
                ),
              ],
            }),
            t("Learn C early", {
              notes:
                "Types, type casts, structs, single-pass compilation, linking, memory allocation, stack versus heap, pointers. Avoid C++ for now.",
            }),
            t("Use Git", {
              notes: "New projects on GitHub by default, commit often.",
            }),
            t("Use a debugger", {
              notes:
                "pdb for Python, gdb for C, and an address sanitiser for C.",
              links: [
                link("pdb", "https://docs.python.org/3/library/pdb.html"),
                link("gdb", "https://sourceware.org/gdb/"),
                link(
                  "AddressSanitizer",
                  "https://github.com/google/sanitizers/wiki/AddressSanitizer",
                ),
              ],
            }),
            t("Basic Unix tooling", {
              notes:
                "The ten or so most common commands, and your distro's package manager. Native Linux if possible; WSL on Windows.",
            }),
            t("Basic data structures and algorithms"),
          ],
        }),
        t("Learn ML", {
          notes:
            "Understand how science is done: page limits, reviewer tastes and missing ablations shape papers. Do not trust prestige; the best sign a result is right is open code with independent replications. Assume papers are wrong by default and look for the errors.",
          children: [
            t("Stanford CS231n lectures and problem sets", {
              notes:
                "Watch the lectures by Andrej Karpathy or Justin Johnson and do the problem sets. You build an autograd and get comfortable with PyTorch.",
              links: [
                link("CS231n course site", "https://cs231n.stanford.edu/"),
                link("CS231n course notes", "https://cs231n.github.io/"),
              ],
            }),
            r("Read the key papers on arXiv", "https://arxiv.org/"),
            t("Implement some of the basic papers"),
          ],
        }),
      ],
    }),
    t("1. First environment and agent", {
      links: [RL_GUIDE, PUFFER_DISCORD],
      children: [
        t("Read the quickstart introduction", {
          notes:
            "Just the first paragraph: agent, policy, environment, state, observation, action, reward.",
          links: [RL_QUICKSTART],
        }),
        t("Read the PufferLib environment docs", {
          notes:
            "Including the code for the squared sample environment. Observations, actions, rewards and terminals are just arrays.",
          links: [PUFFER_DOCS],
        }),
        t("Write your own tiny environment", {
          notes:
            "So simple it is not even useful, such as flappy bird on a grid two blocks tall with -1 reward for hitting the ceiling.",
        }),
        t("Bind it to PufferLib and train an agent", {
          notes: "Ask in the Discord if you get stuck.",
          links: [PUFFER_DOCS, PUFFER_DISCORD],
        }),
      ],
    }),
    t("2. Basic fundamentals", [
      r(
        "Karpathy: Pong from Pixels",
        "https://karpathy.github.io/2016/05/31/rl/",
        "The policy gradient blog, including the implementation. How observations, actions and rewards become derivatives over weights, and what the discount factor means.",
      ),
      t("Classes of methods", {
        notes:
          "The Fundamentals section of the quickstart guide. Read the multi-agent point twice.",
        links: [RL_QUICKSTART],
        children: [
          t("On-policy", {
            notes:
              "Learn a function from observations to actions. Policy gradients, then PPO, with GAE for context.",
            links: [
              link("Proximal Policy Optimization", PPO),
              link("Generalized Advantage Estimation", GAE),
            ],
          }),
          t("Off-policy", {
            notes:
              "Learn the value of (observation, action), usually with experience replay. Read DQN, then Rainbow; Soft Actor-Critic is the most used today.",
            children: [
              r(
                "Playing Atari with Deep RL (DQN)",
                "https://arxiv.org/abs/1312.5602",
              ),
              r("Rainbow", "https://arxiv.org/abs/1710.02298"),
              r("Soft Actor-Critic", "https://arxiv.org/abs/1801.01290"),
            ],
          }),
          t("Model-based", {
            notes:
              "The agent predicts future observations, as an auxiliary loss or to generate training data.",
            children: [
              r(
                "World Models",
                "https://arxiv.org/abs/1809.01999",
                "Ha and Schmidhuber.",
              ),
            ],
          }),
          t("Offline RL", {
            notes:
              "Supervised learning on a fixed dataset of observations, actions and rewards; no interaction.",
          }),
          t("Multi-agent RL", {
            notes:
              "The same as single-agent in practice: one policy applied to every agent independently, or computed jointly over concatenated observations.",
            children: [
              r(
                "IPPO",
                "https://arxiv.org/abs/2011.09533",
                "Is Independent Learning All You Need in the StarCraft Multi-Agent Challenge?",
              ),
              r(
                "MAPPO",
                "https://arxiv.org/abs/2103.01955",
                "The Surprising Effectiveness of PPO in Cooperative, Multi-Agent Games.",
              ),
            ],
          }),
        ],
      }),
      t("Read and train Puffer Target", {
        notes:
          "Multi-agent, with a sparse reward of 1 for reaching the goal. Trains in seconds.",
        links: [PUFFER_DOCS],
      }),
    ]),
    t("3. A more complex environment", [
      t("Build something as complex as Target", {
        notes:
          "About 300 lines at most. Think about what the agent needs to see. Train an agent you can visually confirm plays well.",
        links: [PUFFER_DISCORD],
      }),
      t("Read other Puffer environments", {
        notes:
          "Snake and Convert, then arcade games such as Pong and Breakout.",
        links: [PUFFERLIB],
      }),
      t("Enhance your environment", {
        notes:
          "Add features, retrain, and see how the changes alter learning. Aim for the level of Pong or Snake.",
      }),
    ]),
    t("4. Understand why it worked", [
      r(
        "Proximal Policy Optimization paper",
        PPO,
        "Skip the TRPO and KL-penalty sections. Equation 7: clip the policy gradient, weight it by the advantage, average over a batch.",
      ),
      r(
        "Generalized Advantage Estimation paper",
        GAE,
        "Now if you have a strong maths background, otherwise at step 6.",
      ),
      r(
        "The 37 Implementation Details of PPO",
        "https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/",
        "With the CleanRL PPO implementation. The reference algorithms are fiddly and the details matter.",
      ),
      r(
        "CleanRL",
        "https://github.com/vwxyzjn/cleanrl",
        "Single-file reference implementations.",
      ),
      t("Puffer articles", [
        r(
          "Stronger Hyperparameters with PROTEIN",
          "https://x.com/jsuarez5341/status/1938287195305005500",
        ),
        r(
          "Puffing up PPO",
          "https://x.com/jsuarez5341/status/1937554394700231105",
        ),
        r(
          "Neural MMO 3.0",
          "https://x.com/jsuarez5341/status/1866127102627438866",
        ),
      ]),
    ]),
    t("5. First real project", [
      t("Finish the quickstart guide", {
        links: [RL_QUICKSTART],
        children: [
          r(
            "How AI Training Scales",
            "https://openai.com/index/how-ai-training-scales/",
            "OpenAI blog post, recommended for its comprehensive experiments.",
          ),
          r(
            "Scaling laws for single-agent RL",
            "https://arxiv.org/abs/2301.13442",
          ),
        ],
      }),
      r(
        "Pokemon Red RL blog",
        "https://drubinstein.github.io/pokerl/",
        "Observation space, reward engineering and problem setup for beating the whole game from scratch.",
      ),
      t("Pick an interesting problem", {
        notes:
          "Something you can do in 500 to 1000 lines. Arcade games work well; applied problems from a field you know are better.",
      }),
      t("Solve it and open a PR to PufferLib", { links: [PUFFERLIB] }),
    ]),
    t("6. Papers to read", {
      notes:
        "The short list of capability-defining results. Most of the OpenAI and DeepMind ones have more accessible blog posts.",
      children: [
        r(
          "Dota 2 with Large Scale Deep RL",
          "https://arxiv.org/abs/1912.06680",
          "OpenAI Five. The pick for most important paper: PPO with a one-layer LSTM solves Dota. Do not skip the appendix.",
        ),
        r(
          "Grandmaster level in StarCraft II",
          "https://www.nature.com/articles/s41586-019-1724-z",
          "AlphaStar.",
        ),
        r(
          "Mastering the game of Go",
          "https://www.researchgate.net/publication/292074166_Mastering_the_game_of_Go_with_deep_neural_networks_and_tree_search",
          "AlphaGo.",
        ),
        r(
          "Learning Dexterous In-Hand Manipulation",
          "https://arxiv.org/abs/1808.00177",
          "Pioneered domain randomisation.",
        ),
        r("Open-Ended Learning (XLand)", "https://arxiv.org/abs/2107.12808"),
        r(
          "Emergent Tool Use",
          "https://arxiv.org/abs/1909.07528",
          "3v3 hide and seek with movable obstacles.",
        ),
        r(
          "Capture the Flag",
          "https://arxiv.org/abs/1807.01281",
          "Human-level play in first-person multiplayer games with population-based RL.",
        ),
        r(
          "The NetHack Learning Environment",
          "https://arxiv.org/abs/2006.13760",
        ),
        r("Proximal Policy Optimization", PPO),
        r("Generalized Advantage Estimation", GAE),
        r(
          "Playing Atari with Deep RL",
          "https://arxiv.org/abs/1312.5602",
          "The original deep Q-learning paper.",
        ),
      ],
    }),
    t("7. Working practices", {
      notes:
        "Advice gathered from section 7 of the guide and the quickstart guide.",
      links: [RL_GUIDE, RL_QUICKSTART],
      children: [
        t("Approaching a new problem", {
          notes:
            "Start from first principles: the agent is a blank slate mashing buttons. Decide what it must see and do, log a single score rather than raw reward, keep the environment simple and fast, train early and often, and suspect your data when training fails.",
        }),
        t("Encoding observations and actions", {
          notes:
            "Make positions egocentric and divide by the maximum. One-hot or embed discrete data. Keep actions to the simplest set of controls.",
        }),
        t("Normalising data", {
          notes:
            "Divide continuous values by their known maximum, not by mean statistics. Do the same for rewards.",
        }),
        t("Designing rewards", {
          notes:
            "Pick three to five things relevant to performance, guess coefficients, then tune them in a sweep. Prefer +1 and -1 for progress over raw distance.",
        }),
        t("PPO as the default", {
          notes: "Vanilla policy gradients plus GAE plus clipping.",
          links: [link("Proximal Policy Optimization", PPO)],
        }),
        t("Hyperparameter intuition", {
          notes:
            "Always sweep learning rate. Set gamma and lambda from the task's effective horizon. Leave clipping at 0.1 to 0.2. Set batch sizes from hardware.",
        }),
        r(
          "CARBS",
          "https://github.com/imbue-ai/carbs",
          "Hyperparameter tuning from Imbue, with bindings in PufferLib.",
        ),
        t("Common architectures", {
          notes:
            "An LSTM by default; two or three conv layers for 2D data. Smaller networks with more samples. The ResNet from the IMPALA paper is a decent slower option.",
          links: [link("IMPALA", "https://arxiv.org/abs/1802.01561")],
        }),
        t("Whitebox software", {
          notes:
            "Do not over-modularise. CleanRL's single-file implementations are the model.",
          links: [link("CleanRL", "https://github.com/vwxyzjn/cleanrl")],
        }),
      ],
    }),
    t("8. Applications", {
      notes:
        "RL works when you have a fiddly interactive optimisation problem and can build a fast simulator.",
      children: [
        r(
          "Magnetic control of tokamak plasmas",
          "https://www.nature.com/articles/s41586-021-04301-9",
          "Nuclear fusion.",
        ),
        r(
          "Reinforcement Learning at Lyft",
          "https://arxiv.org/pdf/2310.13810",
          "Rideshare logistics.",
        ),
        r(
          "Controlling Commercial Cooling Systems",
          "https://arxiv.org/pdf/2211.07357",
          "Datacentre cooling.",
        ),
        r(
          "Robust Autonomy Emerges from Self-Play",
          "https://arxiv.org/pdf/2502.03349",
          "Self-driving.",
        ),
        r(
          "Chip Placement with Deep RL",
          "https://arxiv.org/pdf/2004.10746",
          "Chip design.",
        ),
      ],
    }),
    t("9. Algorithms research", [
      t("Off-policy learning", [
        r("Rainbow", "https://arxiv.org/abs/1710.02298"),
        r("Beyond The Rainbow", "https://arxiv.org/abs/2411.03820"),
        r("Human-level Atari 200x faster", "https://arxiv.org/abs/2209.07550"),
        r(
          "IMPALA",
          "https://arxiv.org/abs/1802.01561",
          "Introduces V-trace to correct off-policy drift.",
        ),
      ]),
      t("Model-based learning", [
        r("Recurrent World Models", "https://arxiv.org/abs/1809.01999"),
        r("DreamerV3", "https://arxiv.org/abs/2301.04104"),
        r(
          "Reward Scale Robustness for PPO",
          "https://arxiv.org/abs/2310.17805",
          "Tests the DreamerV3 tricks.",
        ),
      ]),
      t("Search", [
        r("MuZero", "https://arxiv.org/abs/1911.08265"),
        r("Go-Explore", "https://arxiv.org/abs/1901.10995"),
        r("EfficientZero V2", "https://arxiv.org/pdf/2403.00564"),
      ]),
    ]),
    t("10. Infrastructure", [
      t("Environment speed", {
        notes:
          "Read PufferLib's env_binding.h: N copies of your environment run in a loop, sharing memory with Python.",
        links: [PUFFERLIB],
      }),
      t("Parallelisation", {
        notes:
          "A Python implementation of EnvPool with buffers in shared memory.",
        children: [r("EnvPool paper", "https://arxiv.org/abs/2206.10558")],
      }),
      t("Models and training", {
        notes:
          "Custom kernels, fused operations and model FLOPs utilisation are where the biggest gains remain.",
      }),
    ]),
    t("Sim-building ladder", {
      notes:
        "The environments Spencer Cheng built in his first year, in order. What makes a sim hard is the domain you have to learn to build it.",
      links: [RL_FIRST_YEAR, link("Puffer", "https://puffer.ai")],
      children: [
        t("Easy sims", [t("Connect4"), t("Triple Triad")]),
        t("Intermediate sims", [
          t("Go", { notes: "Needed a custom policy with Conv2D layers." }),
          t("RWARE", { notes: "A first multi-agent problem." }),
        ]),
        t("Harder sims", [
          r(
            "Tower Climb",
            "https://x.com/spenccheng/status/1937949551090143604",
            "A 3D puzzle with one life, irreversible states and partial observations.",
          ),
          r(
            "GPUDrive port",
            "https://emerge-lab.github.io/",
            "A driving simulator from the EMERGE lab at NYU.",
          ),
          r(
            "Terraforming environment",
            "https://x.com/spenccheng/status/1938629134193693096",
          ),
        ]),
      ],
    }),
  ],
});

const AI_RESEARCH_ROADMAP = [
  link("AI Research Mastery roadmap", "https://airesearchmastery.com/roadmap"),
];
const stage = (title: string, notes: string, children: SeedTopic[]) =>
  t(title, { notes, links: AI_RESEARCH_ROADMAP, children });

// The public lesson titles from airesearchmastery.com. The lessons themselves are a paid course.
const AI_RESEARCH = t("AI research", {
  notes:
    "The AI Research Mastery curriculum: from zero to publishing original AI research, in fourteen stages.",
  links: AI_RESEARCH_ROADMAP,
  children: [
    stage(
      "1. AI core intuitions",
      "The raw operations behind the models: similarity, selection and scaling.",
      [
        t("Similarity with dot product"),
        t("Softmax probabilities"),
        t("Tensor broadcasting"),
        t("L1 vs L2 norms"),
        t("Cosine similarity"),
      ],
    ),
    stage(
      "2. Mathematics fundamentals",
      "The calculus and probability that let machines learn from error.",
      [
        t("Derivatives for ML", {
          notes:
            "The intuition of nudging an input. Power, addition and product rules.",
        }),
        t("The chain rule", {
          notes:
            "How change flows through a chain. The gear intuition: multiplying sensitivities.",
        }),
        t("Backprop in Python", {
          notes:
            "Building a simple computational graph from scratch. The forward pass.",
        }),
        t("The Jacobian matrix", {
          notes:
            "Scaling to higher dimensions. Derivatives for vector functions.",
        }),
        t("Hadamard product", {
          notes:
            "Element-wise matrix multiplication, the fastest GPU operation.",
        }),
        t("Entropy and information theory", {
          notes: "What information is. Bits, nats and surprise.",
        }),
        t("KL divergence", {
          notes: "Measuring distance between distributions.",
        }),
        t("Coding cross-entropy loss", {
          notes: "Softmax from scratch. Why negative log likelihood.",
        }),
        t("Singular value decomposition", {
          notes:
            "Compression by low-rank approximation. The geometry: rotate, scale, rotate.",
        }),
        t("Moving averages (EMA)", {
          notes:
            "Smoothing noisy data. Why a simple moving average wastes memory.",
        }),
      ],
    ),
    stage(
      "3. Neural networks",
      "How simple linear operations stack into deep learning.",
      [
        t("Layers as matrices", {
          notes:
            "Thinking in shapes, not neurons. Matrix multiplication as row times column.",
        }),
        t("Activation functions", { notes: "Non-linearity, and ReLU." }),
        t("The forward pass", {
          notes: "Linking layers together with step-by-step vector maths.",
        }),
      ],
    ),
    stage(
      "4. Building PyTorch from scratch",
      "Build your own micrograd to understand backprop step by step.",
      [
        t("The Value object and graph", {
          notes: "Tensors hold both data and gradient.",
        }),
        t("Manual to automated backprop", {
          notes:
            "Deriving L = a * b + c. Local derivatives versus upstream gradients.",
        }),
        t("Why accumulate gradients?"),
        t("More operations", {
          notes: "Reverse operators so that 2 + x works. The power rule.",
        }),
      ],
    ),
    stage(
      "5. Language modelling (makemore)",
      "Bigram models and MLPs: how machines predict the next token.",
      [
        t("Statistical bigrams"),
        t("The neural bigram"),
        t("The MLP architecture", { notes: "Bengio et al., 2003." }),
        t("Initialisation and the hockey stick"),
        t("Batch normalisation", { notes: "The covariate shift problem." }),
      ],
    ),
    stage(
      "6. Tokenization",
      "Turning language and vision into numerical tensors.",
      [
        t("The atom of text", {
          notes: "Text as raw integers. Unicode code points.",
        }),
        t("The BPE algorithm", {
          notes: "The need for compression. Iterative merging.",
        }),
        t("Writing a tokenizer", {
          notes: "Counting pair statistics. The merging loop.",
        }),
        t("Image patches (ViT)", {
          notes: "From 2D to 1D by flattening spatial blocks.",
        }),
        t("Discrete tokenization (VQ-VAE)", {
          notes: "A visual vocabulary through vector quantisation.",
        }),
        t("Semantic tokenization (CLIP)", {
          notes: "Aligning text and images with a contrastive objective.",
        }),
      ],
    ),
    stage(
      "7. Transformers",
      "The architecture, from self-attention to residual dynamics.",
      [
        t("Self-attention: the big picture", {
          notes: "Why we moved past RNNs. The query, key, value intuition.",
        }),
        t("The attention formula", {
          notes: "The four-step algorithm and the scaling factor.",
        }),
        t("Causal masking", {
          notes:
            "Why the model must not see future tokens. The triangular mask.",
        }),
        t("Multi-head attention", { notes: "Representation subspaces." }),
        t("The MLP"),
        t("Residuals"),
        t("Positional encoding"),
        t("The decoder"),
        t("Absolute vs relative positioning", {
          notes: "Where absolute encoding fails. Learning relative distance.",
        }),
        t("The RoPE intuition", { notes: "Rotary positional embeddings." }),
        t("BERT vs GPT", {
          notes:
            "Encoder versus decoder, bidirectional versus unidirectional, understanding versus generation.",
        }),
        t("Cross-attention"),
        t("Scaling laws"),
      ],
    ),
    stage("8. Generative models", "The maths of VAEs and diffusion.", [
      t("VAE intuition: the latent space", {
        notes:
          "Autoencoders and the bottleneck. Why standard autoencoders fail at generation.",
      }),
      t("The maths of VAEs (ELBO)", {
        notes: "The intractable integral and the evidence lower bound.",
      }),
      t("Diffusion: destruction and creation", {
        notes: "Entropy and loss of structure.",
      }),
      t("The forward process", {
        notes: "The Markov chain of noise and the reparameterisation trick.",
      }),
      t("Predicting noise", {
        notes: "The denoising objective: predicting noise versus images.",
      }),
      t("The UNet architecture", {
        notes: "The encoder-decoder U shape and the role of skip connections.",
      }),
    ]),
    stage(
      "9. Reinforcement learning",
      "Teaching models to make decisions for long-term reward.",
      [
        t("Agents and environments", {
          notes: "Trial and error. States, actions and rewards.",
        }),
        t("Policy gradients (REINFORCE)", {
          notes: "The log-derivative trick. Learning from win-loss signals.",
        }),
        t("Deep Q-learning (DQN)"),
      ],
    ),
    stage(
      "10. Do research",
      "Tricks for stable training, scaling and performance.",
      [
        t("The mathematical origin of warmup"),
        t("What is a gradient norm?"),
        t("The problem: exploding gradients"),
        t("The solution: gradient clipping", {
          notes: "A speed limit that preserves the update direction.",
        }),
        t("Gradient clipping in PyTorch", {
          notes: "The clip_grad_norm_ helper and where it goes in the loop.",
        }),
      ],
    ),
    stage(
      "11. Modern LLMs",
      "The Llama architecture, quantisation and the tricks behind large models.",
      [
        t("Llama vs GPT: architecture changes", {
          notes: "The SwiGLU activation. RMSNorm versus LayerNorm.",
        }),
        t("Flash attention intuition", {
          notes: "Memory bandwidth versus compute. Tiling and IO-awareness.",
        }),
        t("The KV cache", {
          notes: "Why generation gets slower. Caching keys and values.",
        }),
        t("Grouped-query attention", { notes: "MQA versus GQA versus MHA." }),
        t("PEFT and LoRA", {
          notes: "Low-rank adaptation: fine-tuning large models on one GPU.",
        }),
        t("Quantization", {
          notes: "FP16 versus INT8. Zero-point quantisation.",
        }),
      ],
    ),
    stage("12. Multimodal agents", "Combining vision, text and audio.", [
      t("CLIP: connecting text and images", {
        notes: "Contrastive loss with positive and negative pairs.",
      }),
      t("LLaVA: the projection layer", {
        notes:
          "Vision encoders and the linear projection that joins them to the language model.",
      }),
      t("Patches and AnyRes", {
        notes: "Splitting images into patches and handling odd aspect ratios.",
      }),
    ]),
    stage(
      "13. State space models",
      "Linear-time sequence modelling beyond transformers.",
      [
        t("The sequence problem", { notes: "Why long context is quadratic." }),
        t("SSM intuition", {
          notes: "The parallel training trick and constant-time inference.",
        }),
        t("Mamba: selective state spaces", {
          notes: "Data-dependent parameters.",
        }),
      ],
    ),
    stage(
      "14. Geometric deep learning",
      "Deep learning on graphs, molecules and 3D geometry.",
      [
        t("Graph fundamentals", {
          notes: "Nodes, edges and adjacency matrices.",
        }),
        t("Neural message passing", {
          notes: "The core GNN algorithm: aggregate and update.",
        }),
        t("Case study: AlphaFold"),
      ],
    ),
  ],
});

const SEEDS: Record<string, SeedTopic> = {
  "ml-beginners": ML_BEGINNERS,
  "dl-beginners": DL_BEGINNERS,
  llms: LLMS,
  "reinforcement-learning": REINFORCEMENT_LEARNING,
  "ai-research": AI_RESEARCH,
};

function flatten(
  seed: SeedTopic,
  parentId: string | null,
  id: string,
): Topic[] {
  const topic: Topic = {
    id,
    parentId,
    title: seed.title,
    status: seed.status ?? "todo",
    notes: seed.notes ?? "",
    links: seed.links ?? [],
  };
  const children = (seed.children ?? []).flatMap((child, i) =>
    flatten(child, id, `${id}.${i}`),
  );
  return [topic, ...children];
}

// Topic ids start with the map id, so they stay unique across every map on the canvas.
export function createSeedLibrary(): StudyLibrary {
  return {
    maps: Object.entries(SEEDS).map(([id, seed]) => ({
      id,
      topics: flatten(seed, null, id),
    })),
  };
}
