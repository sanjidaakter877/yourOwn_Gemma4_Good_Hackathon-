"""
yourOwn — Gemma 4 fine-tune with Unsloth
=========================================
Trains a LoRA adapter on Alzheimer's care companion data using Gemma 4.

Requirements: see training_requirements.txt
Run on: Google Colab (A100/L4) or local GPU with >= 16 GB VRAM

After training, upload the adapter to HuggingFace:
  huggingface-cli login
  huggingface-cli upload <your-hf-username>/yourOwn-gemma4-medical-ft ./gemma4-medical-ft-output
"""

import json
import os
import torch
from datasets import Dataset

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Gemma 4 model via Unsloth (choose based on your GPU VRAM):
#   gemma-4-E4B  →  ~8 GB VRAM   (4B edge model — fits Colab T4/free tier)
#   gemma-4-31B  →  ~24 GB VRAM  (31B MoE — needs A100)
MODEL_NAME = os.getenv("TRAIN_MODEL", "unsloth/gemma-4-E4B-it-unsloth-bnb-4bit")

TRAINING_DATA_PATH = os.getenv("TRAIN_DATA", "alzheimers_training.jsonl")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./gemma4-medical-ft-output")

MAX_SEQ_LENGTH = 4096  # fits within Gemma 4's 128K window; keep short for efficiency
LORA_RANK = 16
LORA_ALPHA = 16
LORA_DROPOUT = 0.05
LEARNING_RATE = 2e-4
NUM_EPOCHS = 3
BATCH_SIZE = 2
GRAD_ACCUM = 4

# ---------------------------------------------------------------------------
# Load model
# ---------------------------------------------------------------------------

from unsloth import FastLanguageModel  # noqa: E402  (import after config)

print(f"Loading {MODEL_NAME} via Unsloth …")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    load_in_4bit=True,
    dtype=None,  # auto
)

# Apply LoRA — target all attention projections for better coverage than q/v only
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_RANK,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    use_gradient_checkpointing="unsloth",
    use_rslora=True,
    random_state=42,
)

# ---------------------------------------------------------------------------
# Load and format training data
# ---------------------------------------------------------------------------

def load_jsonl(path: str) -> list:
    examples = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                examples.append(json.loads(line))
    return examples


def format_example(example: dict, tokenizer) -> str:
    """Convert either chat-format or legacy prompt/completion to a training string."""
    if "messages" in example:
        # Native chat format — preferred for Gemma 4 instruction-tuned models
        return tokenizer.apply_chat_template(
            example["messages"],
            tokenize=False,
            add_generation_prompt=False,
        )

    # Legacy prompt/completion format (clinical Q&A examples)
    prompt = example.get("prompt", "")
    completion = example.get("completion", "")
    return (
        f"<start_of_turn>user\n{prompt}<end_of_turn>\n"
        f"<start_of_turn>model\n{completion}<end_of_turn>"
    )


print(f"Loading training data from {TRAINING_DATA_PATH} …")
raw_data = load_jsonl(TRAINING_DATA_PATH)
print(f"  {len(raw_data)} examples loaded.")

formatted = [{"text": format_example(ex, tokenizer)} for ex in raw_data]
dataset = Dataset.from_list(formatted)

# ---------------------------------------------------------------------------
# Train
# ---------------------------------------------------------------------------

from trl import SFTTrainer, SFTConfig  # noqa: E402

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=SFTConfig(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRAD_ACCUM,
        num_train_epochs=NUM_EPOCHS,
        learning_rate=LEARNING_RATE,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=5,
        save_strategy="epoch",
        warmup_ratio=0.05,
        lr_scheduler_type="cosine",
        max_seq_length=MAX_SEQ_LENGTH,
        dataset_text_field="text",
        report_to="none",
    ),
)

print("Starting training …")
trainer_stats = trainer.train()
print(f"Training complete. Steps: {trainer_stats.global_step}, Loss: {trainer_stats.training_loss:.4f}")

# ---------------------------------------------------------------------------
# Save LoRA adapter only (not the full model)
# ---------------------------------------------------------------------------

print(f"Saving LoRA adapter to {OUTPUT_DIR} …")
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("\nDone. Next steps:")
print("  1. huggingface-cli login")
print(f"  2. huggingface-cli upload <your-hf-username>/yourOwn-gemma4-medical-ft {OUTPUT_DIR}")
print("  3. Update backend/.env: OLLAMA_MODEL=<your-hf-username>/yourOwn-gemma4-medical-ft")
print("  4. Or: ollama create yourown-gemma4 -f Modelfile  (see Modelfile.example below)")
