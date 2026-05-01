---
base_model: unsloth/gemma-2-9b-bnb-4bit
library_name: peft
pipeline_tag: text-generation
tags:
- legacy
- gemma-2
- lora
- sft
- transformers
- trl
- unsloth
---

# Legacy Adapter Artifact

This directory contains an older experimental adapter trained from
`unsloth/gemma-2-9b-bnb-4bit`. It is retained only as a development artifact
and should not be described as a Gemma 4 fine-tune in the Kaggle submission.

For the Gemma 4 Good Hackathon, use the application path that runs Gemma 4 via
Ollama, or regenerate this directory with `backend/services/finetune-gemma4.py`
using an official Gemma 4 base model such as `google/gemma-4-E4B-it`.

If entering the Unsloth special technology track, publish the regenerated
Gemma 4 adapter weights and benchmark results.
