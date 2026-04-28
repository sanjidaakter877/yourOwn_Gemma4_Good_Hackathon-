"""
Fine-tune Gemma 4 on Alzheimer's Medical Data
This script uses Unsloth to create a medical-specialized Gemma 4 model
Optimized for 4-bit quantization (works on consumer GPUs)
"""

import os
import json
from datetime import datetime
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments
from unsloth import FastLanguageModel
import torch

# Configuration
MODEL_NAME = "unsloth/gemma-2-9b-bnb-4bit"
OUTPUT_DIR = "./models/gemma4-medical-ft"
TRAINING_DATA = "./data/medical-training/alzheimers_training.jsonl"
MAX_SEQ_LENGTH = 2048

print("=" * 60)
print("GEMMA 4 MEDICAL FINE-TUNING")
print(f"Date: {datetime.now()}")
print("=" * 60)

# Step 1: Load Model with Unsloth
print("\n[1/5] Loading Gemma 4 with Unsloth...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=torch.float16,
    load_in_4bit=True,
)

# Step 2: Prepare Model for Fine-tuning
print("[2/5] Preparing LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    use_gradient_checkpointing=True,
    use_rslora=True,  # Use Rank-Stabilized LoRA
)

# Step 3: Load Training Data
print("[3/5] Loading Alzheimer's training dataset...")
training_data = {
    "text": []
}

# Read JSONL training data
if os.path.exists(TRAINING_DATA):
    with open(TRAINING_DATA, 'r') as f:
        for line in f:
            example = json.loads(line)
            prompt = example.get("prompt", "")
            completion = example.get("completion", "")
            training_data["text"].append(f"{prompt}\n{completion}")
    print(f"   Loaded {len(training_data['text'])} training examples")
else:
    # Create sample training data if file doesn't exist
    print(f"   Training file not found, creating sample data...")
    sample_data = [
        {
            "prompt": "Patient says: 'I can't remember my daughter's name'",
            "completion": "This is a common early sign of Alzheimer's disease (GDS Stage 2-3). Encourage them to ask family members. Suggest keeping a photo album of family members. This is normal progression - not their fault. Recommend continuing current medications."
        },
        {
            "prompt": "Doctor observes: Patient confused about date, time, and location",
            "completion": "This indicates moderate to moderately severe cognitive decline (GDS Stage 4-5). Recommend MMSE assessment. Current medications (Donepezil/Memantine) may need adjustment. Increase structured daily activities. Ensure safe environment to prevent wandering."
        },
        {
            "prompt": "Caregiver reports: Dad asking the same question every 5 minutes",
            "completion": "Repetitive questioning is a classic Alzheimer's symptom. Each time is new for them. Respond calmly and patiently. Use consistent, reassuring answers. Redirect to activities they enjoy. Document frequency for doctor - may indicate disease progression."
        },
        {
            "prompt": "Patient missed medication this morning",
            "completion": "Medication adherence is critical for Alzheimer's care. If Donepezil/Memantine missed, they should take next scheduled dose (do not double-dose). Alert caregiver to simplify medication routine: use pill organizer, set phone reminders, or consider supervised administration."
        },
        {
            "prompt": "Patient is becoming aggressive/agitated",
            "completion": "Behavioral changes are common in Alzheimer's (GDS Stage 4+). Likely causes: pain, infection, medication side effects, overstimulation, or unmet need. Check for urinary tract infection. Ensure calm environment. Consult doctor about behavioral management. May need medication adjustment."
        },
        {
            "prompt": "Patient has been wandering more frequently",
            "completion": "Increased wandering suggests advancing cognitive decline. Implement safety measures: GPS tracking, door alarms, ID bracelet. Ensure daily exercise/walks with supervision. Update alert thresholds. Inform doctor - may indicate disease progression to GDS Stage 5+. Consider care facility consultation."
        },
        {
            "prompt": "Family member asking about disease progression",
            "completion": "Alzheimer's progresses differently in each person. MMSE scores track cognitive decline. Use GDS (Global Deterioration Scale) to explain: Stage 1-3 is mild, Stage 4-5 is moderate, Stage 6-7 is severe. Provide realistic expectations. Emphasize quality of life. Discuss advance care planning."
        },
        {
            "prompt": "Patient has low appetite and losing weight",
            "completion": "Weight loss in Alzheimer's is serious. Causes: difficulty swallowing, appetite loss, or advanced disease (GDS Stage 6-7). Assess for depression (check MMSE-D). Offer favorite foods, small frequent meals. Monitor for aspiration risk. Consult doctor - may need nutritional supplements or specialist referral."
        },
        {
            "prompt": "Caregiver is exhausted and overwhelmed",
            "completion": "Caregiver burnout is real and serious. Recommend: respite care services, adult day programs, support groups, counseling. Ensure caregiver gets adequate sleep and takes breaks. Share care duties if possible. Resources: Alzheimer's Association hotline 1-800-272-3900. Caregiver health affects patient outcomes."
        },
        {
            "prompt": "Patient was found trying to leave the house at night",
            "completion": "Nocturnal wandering is serious safety concern (GDS Stage 4-5). Implement: door locks, motion-sensor lights, GPS tracker. Assess for sleep disturbances - may benefit from sleep routine adjustment. Rule out sleep apnea or pain. Discuss with doctor - may need mild sleep aid. Ensure 24/7 supervision."
        }
    ]
    
    os.makedirs(os.path.dirname(TRAINING_DATA), exist_ok=True)
    with open(TRAINING_DATA, 'w') as f:
        for example in sample_data:
            f.write(json.dumps(example) + '\n')
            training_data["text"].append(f"{example['prompt']}\n{example['completion']}")
    print(f"   Created {len(sample_data)} training examples")

# Create dataset
dataset = load_dataset("json", data_files={"train": TRAINING_DATA})

# Step 4: Configure Training
print("[4/5] Configuring training parameters...")
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    warmup_steps=100,
    learning_rate=2e-4,
    weight_decay=0.01,
    fp16=True,
    logging_steps=10,
    save_steps=20,
    optim="paged_adamw_8bit",
    max_grad_norm=0.3,
    seed=42,
)

# Step 5: Train
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

# Save Model
print("\n" + "=" * 60)
print("Training Complete!")
print("=" * 60)
print(f"Model saved to: {OUTPUT_DIR}")
print("\nNext steps:")
print("1. Merge LoRA weights: model.merge_and_unload()")
print("2. Upload to Ollama: ollama create yourOwn-medical-gemma4 --from ./models/gemma4-medical-ft")
print("3. Update .env: OLLAMA_MODEL=yourOwn-medical-gemma4")
print("=" * 60)

# Merge and save final model
model = model.merge_and_unload()
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

print("\n✅ Medical Gemma 4 fine-tuned and ready for deployment!")
