"""
Fine-tune Gemma 4 on Alzheimer's care-support data.

This script uses Unsloth and TRL to create a LoRA adapter from an official
Gemma 4 Hugging Face checkpoint. Keep the base model configurable so the
submission can truthfully report the exact Gemma 4 variant that was trained.
"""

import json
import os
from datetime import datetime

import torch
from datasets import load_dataset
from transformers import TrainingArguments
from trl import SFTTrainer
from unsloth import FastLanguageModel



MODEL_NAME = os.getenv("GEMMA4_BASE_MODEL", "google/gemma-4-E4B-it")
OUTPUT_DIR = os.getenv("GEMMA4_OUTPUT_DIR", "./models/gemma4-medical-ft")
TRAINING_DATA = os.getenv(
    "GEMMA4_TRAINING_DATA",
    "./data/medical-training/alzheimers_training.jsonl",
)
MAX_SEQ_LENGTH = int(os.getenv("GEMMA4_MAX_SEQ_LENGTH", "2048"))

if "gemma-4" not in MODEL_NAME.lower():
    raise ValueError(
        "GEMMA4_BASE_MODEL must be an official Gemma 4 checkpoint, "
        f"got: {MODEL_NAME}"
    )


def ensure_training_data() -> None:
    if os.path.exists(TRAINING_DATA):
        return

    print(f"Training file not found, creating starter data at {TRAINING_DATA}")
    sample_data = [
        {
            "prompt": "Patient says: 'I can't remember my daughter's name'",
            "completion": (
                "Respond calmly. Reassure the patient that this can happen, "
                "encourage checking a family photo or asking a trusted caregiver, "
                "and avoid blaming or correcting harshly."
            ),
        },
        {
            "prompt": "Patient says: 'Where am I? I am scared.'",
            "completion": (
                "First reassure the patient. Use verified location, time, routine, "
                "and caregiver context only if present. Give one safe next step."
            ),
        },
        {
            "prompt": "Patient asks whether to take another pill.",
            "completion": (
                "Do not invent medication instructions. Tell the patient to wait "
                "and ask a caregiver or follow an existing doctor note only if it "
                "is available and relevant."
            ),
        },
        {
            "prompt": "Caregiver reports repeated nighttime wandering.",
            "completion": (
                "Treat this as a safety risk. Recommend caregiver check-in, safe "
                "place verification, door or GPS safeguards, and clinical review."
            ),
        },
    ]

    os.makedirs(os.path.dirname(TRAINING_DATA), exist_ok=True)
    with open(TRAINING_DATA, "w", encoding="utf-8") as file:
        for example in sample_data:
            file.write(json.dumps(example) + "\n")


print("=" * 60)
print("GEMMA 4 CARE-SUPPORT FINE-TUNING")
print(f"Date: {datetime.now()}")
print(f"Base model: {MODEL_NAME}")
print("=" * 60)

ensure_training_data()

print("\n[1/5] Loading Gemma 4 with Unsloth...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
    load_in_4bit=True,
)

print("[2/5] Preparing LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    lora_alpha=16,
    target_modules=[
        "q_proj",
        "k_proj",
        "v_proj",
        "o_proj",
        "gate_proj",
        "up_proj",
        "down_proj",
    ],
    lora_dropout=0.05,
    bias="none",
    use_gradient_checkpointing="unsloth",
    use_rslora=True,
)

print("[3/5] Loading Alzheimer's care-support dataset...")
dataset = load_dataset("json", data_files={"train": TRAINING_DATA})

print("[4/5] Configuring training parameters...")
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    warmup_steps=100,
    learning_rate=2e-4,
    weight_decay=0.01,
    bf16=torch.cuda.is_bf16_supported(),
    fp16=not torch.cuda.is_bf16_supported(),
    logging_steps=10,
    save_steps=20,
    optim="paged_adamw_8bit",
    max_grad_norm=0.3,
    seed=42,
)

print("[5/5] Starting training...")
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    args=training_args,
    train_dataset=dataset["train"],
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    packing=False,
)

trainer.train()

print("\n" + "=" * 60)
print("Training complete")
print("=" * 60)
print(f"Adapter saved to: {OUTPUT_DIR}")
print("Next steps:")
print("1. Run benchmark prompts against the base model and tuned adapter.")
print("2. Publish adapter weights and benchmarks if entering the Unsloth track.")
print("3. For the app demo, run Gemma 4 locally via Ollama, for example gemma4:e4b.")
print("=" * 60)

model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("\nGemma 4 LoRA adapter saved. Validate and benchmark before submission.")
