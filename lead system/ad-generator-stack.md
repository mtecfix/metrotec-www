# AI Ad Generator Stack - Complete Setup

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (n8n)                     │
│                  http://instance-ip:5678                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────────┐         ┌──────────────────┐
│   Ollama (LLM)    │         │ ComfyUI (Images) │
│   Port: 11434     │         │   Port: 8188     │
│   Llama 3.1 8B    │         │ Stable Diffusion │
│   Mistral 7B      │         │   SDXL Turbo     │
└───────────────────┘         └──────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       ▼
              ┌─────────────────┐
              │  Generated Ads  │
              │  Text + Images  │
              └─────────────────┘
```

---

## Prerequisites

- AWS g4dn.xlarge spot instance (or GCP n1-standard-4 + T4)
- Ubuntu 22.04 with NVIDIA drivers
- Docker + NVIDIA Container Toolkit
- 100GB storage

---

## Step 1: Launch Instance

### AWS (After Quota Approved)
```bash
# Get Deep Learning AMI
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=Deep Learning Base OSS Nvidia Driver GPU AMI (Ubuntu 22.04)*" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text \
  --region us-east-1)

# Launch spot instance
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type g4dn.xlarge \
  --key-name openclaw-ollama-key \
  --subnet-id subnet-0af57c29db8adcb52 \
  --instance-market-options '{"MarketType":"spot","SpotOptions":{"MaxPrice":"0.25","SpotInstanceType":"persistent","InstanceInterruptionBehavior":"stop"}}' \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":100,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ad-generator}]' \
  --user-data file://setup-script.sh \
  --region us-east-1
```

### GCP
```bash
gcloud compute instances create ad-generator \
  --zone=us-central1-a \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=100GB \
  --boot-disk-type=pd-ssd \
  --maintenance-policy=TERMINATE \
  --metadata=install-nvidia-driver=True \
  --tags=http-server,https-server
```

---

## Step 2: Install Docker Stack

SSH into instance and run:

```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Verify GPU
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Create directories
mkdir -p ~/comfyui ~/ollama ~/.n8n

echo "Docker setup complete. Log out and back in for group changes."
```

---

## Step 3: Deploy Services

### 3.1 ComfyUI (Stable Diffusion)

```bash
docker run -d --gpus all \
  --name comfyui \
  -p 8188:8188 \
  -v ~/comfyui:/output \
  -v ~/comfyui/models:/app/models \
  --restart unless-stopped \
  yanwk/comfyui-boot:latest
```

**Access:** http://INSTANCE_IP:8188

**Download models:**
```bash
# SDXL Turbo (fast generation)
docker exec comfyui wget -P /app/models/checkpoints \
  https://huggingface.co/stabilityai/sdxl-turbo/resolve/main/sd_xl_turbo_1.0_fp16.safetensors

# Or SD 1.5 (lighter weight)
docker exec comfyui wget -P /app/models/checkpoints \
  https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors
```

---

### 3.2 Ollama (LLM)

```bash
docker run -d --gpus all \
  --name ollama \
  -p 11434:11434 \
  -v ~/ollama:/root/.ollama \
  --restart unless-stopped \
  ollama/ollama

# Pull models
docker exec ollama ollama pull llama3.1:8b
docker exec ollama ollama pull mistral:7b
```

**Test:**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Write 3 ad headlines for law firm automation",
  "stream": false
}'
```

---

### 3.3 n8n (Workflow Automation)

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_HOST="0.0.0.0" \
  -e WEBHOOK_URL="http://INSTANCE_IP:5678/" \
  -v ~/.n8n:/home/node/.n8n \
  --restart unless-stopped \
  n8nio/n8n
```

**Access:** http://INSTANCE_IP:5678

---

## Step 4: Create Ad Generation Workflow

### n8n Workflow Configuration

1. **Open n8n:** http://INSTANCE_IP:5678
2. **Create new workflow**
3. **Add nodes:**

#### Node 1: Webhook (Trigger)
- **Method:** POST
- **Path:** `ad-generator`
- **Response Mode:** When Last Node Finishes

#### Node 2: Set Variables
- **Extract from webhook:**
  - `industry` (e.g., "law firms")
  - `product` (e.g., "OpenClaw automation")
  - `pain_point` (e.g., "missed deadlines")
  - `roi` (e.g., "save 15 hours/week")

#### Node 3: HTTP Request - Generate Ad Copy (Ollama)
- **Method:** POST
- **URL:** `http://INSTANCE_IP:11434/api/generate`
- **Body:**
```json
{
  "model": "llama3.1:8b",
  "prompt": "Write a compelling 30-word Facebook ad for {{$json.product}} targeting {{$json.industry}}. Focus on {{$json.pain_point}}. Include specific benefit: {{$json.roi}}. End with strong CTA.",
  "stream": false
}
```

#### Node 4: Extract Ad Copy
- **Use Code node:**
```javascript
const response = JSON.parse($input.item.json.body);
const adCopy = response.response;

// Split into headline and body
const lines = adCopy.split('\n').filter(l => l.trim());
const headline = lines[0];
const body = lines.slice(1).join(' ');

return {
  headline: headline,
  body: body,
  full_copy: adCopy
};
```

#### Node 5: HTTP Request - Generate Image (ComfyUI)
- **Method:** POST
- **URL:** `http://INSTANCE_IP:8188/prompt`
- **Body:**
```json
{
  "prompt": {
    "3": {
      "inputs": {
        "seed": 42,
        "steps": 8,
        "cfg": 1.0,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": "sd_xl_turbo_1.0_fp16.safetensors"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "5": {
      "inputs": {
        "width": 1024,
        "height": 1024,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "6": {
      "inputs": {
        "text": "professional {{$json.industry}} office, modern, clean, bright, high quality, advertising photo",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": "blurry, low quality, text, watermark",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": "ad_{{$json.industry}}",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  }
}
```

#### Node 6: Combine Results
- **Merge ad copy + image URL**
- **Format response:**
```json
{
  "headline": "{{$node['Extract Ad Copy'].json.headline}}",
  "body": "{{$node['Extract Ad Copy'].json.body}}",
  "image_url": "http://INSTANCE_IP:8188/view?filename={{$node['Generate Image'].json.filename}}",
  "generated_at": "{{$now}}",
  "industry": "{{$json.industry}}"
}
```

#### Node 7: Respond to Webhook
- **Return combined results**

---

## Step 5: Test the Stack

### Test via curl:
```bash
curl -X POST http://INSTANCE_IP:5678/webhook/ad-generator \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "law firms",
    "product": "OpenClaw automation",
    "pain_point": "missed client calls after hours",
    "roi": "capture 100% of leads 24/7"
  }'
```

**Expected response (30-60 seconds):**
```json
{
  "headline": "Never Miss Another Client Call",
  "body": "Detroit law firms: OpenClaw answers intake 24/7. Capture 100% of leads, even after hours. Stop losing clients to competitors. Free demo.",
  "image_url": "http://INSTANCE_IP:8188/view?filename=ad_law_firms_00001.png",
  "generated_at": "2026-02-28T05:30:00Z",
  "industry": "law firms"
}
```

---

## Step 6: Industry-Specific Prompts

### Law Firms
```json
{
  "industry": "law firms",
  "product": "OpenClaw automation",
  "pain_point": "missed filing deadlines",
  "roi": "eliminate malpractice risk",
  "image_prompt": "professional law office, scales of justice, modern, trustworthy"
}
```

### Property Management
```json
{
  "industry": "property management",
  "product": "OpenClaw automation",
  "pain_point": "tenant questions overwhelming staff",
  "roi": "handle 3x more units per manager",
  "image_prompt": "modern apartment building, happy tenants, professional property manager"
}
```

### Restaurants
```json
{
  "industry": "restaurants",
  "product": "OpenClaw automation",
  "pain_point": "missed reservation requests during rush",
  "roi": "capture every booking across all channels",
  "image_prompt": "busy restaurant, full tables, happy diners, professional service"
}
```

---

## Step 7: Batch Generation Script

Create `generate-ads.sh`:
```bash
#!/bin/bash

WEBHOOK_URL="http://INSTANCE_IP:5678/webhook/ad-generator"

# Generate ads for all industries
industries=("law firms" "property management" "restaurants" "small business")
pain_points=("missed deadlines" "tenant complaints" "missed reservations" "invoice chaos")
roi_claims=("eliminate malpractice risk" "handle 3x more units" "capture every booking" "save 80 hours/month")

for i in "${!industries[@]}"; do
  echo "Generating ad for ${industries[$i]}..."
  
  curl -X POST $WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"industry\": \"${industries[$i]}\",
      \"product\": \"OpenClaw automation\",
      \"pain_point\": \"${pain_points[$i]}\",
      \"roi\": \"${roi_claims[$i]}\"
    }" \
    -o "ad_${industries[$i]// /_}.json"
  
  echo "Saved to ad_${industries[$i]// /_}.json"
  sleep 60  # Wait for generation to complete
done

echo "All ads generated!"
```

Run:
```bash
chmod +x generate-ads.sh
./generate-ads.sh
```

---

## Step 8: Monitoring & Optimization

### Check GPU usage:
```bash
watch -n 1 nvidia-smi
```

### Check Docker logs:
```bash
docker logs -f comfyui
docker logs -f ollama
docker logs -f n8n
```

### Monitor costs:
```bash
# AWS
aws ce get-cost-and-usage \
  --time-period Start=2026-02-01,End=2026-02-28 \
  --granularity DAILY \
  --metrics BlendedCost \
  --region us-east-1
```

### Performance metrics:
- **Ad generation time:** 30-60 seconds
- **Cost per ad:** $0.00 (after instance running)
- **Concurrent generations:** 1 at a time (GPU limitation)
- **Daily capacity:** ~1,440 ads (if running 24/7)

---

## Step 9: Auto-Restart on Spot Interruption

Create `/etc/systemd/system/ad-generator-restart.service`:
```ini
[Unit]
Description=Restart Ad Generator Stack
After=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/docker start comfyui ollama n8n

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable ad-generator-restart.service
```

---

## Step 10: Backup & Disaster Recovery

### Backup models and data:
```bash
# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf ~/backup-$DATE.tar.gz \
  ~/comfyui/models \
  ~/ollama \
  ~/.n8n
aws s3 cp ~/backup-$DATE.tar.gz s3://your-backup-bucket/
EOF

chmod +x ~/backup.sh

# Run daily
crontab -e
# Add: 0 2 * * * ~/backup.sh
```

---

## Cost Summary

| Component | Cost |
|-----------|------|
| AWS g4dn.xlarge spot | $144/month |
| Storage (100GB) | $10/month |
| Data transfer | ~$5/month |
| **Total** | **$159/month** |

**Per ad cost:** $0.00 (unlimited generation)

---

## Next Steps

1. ✅ Request AWS quota increase
2. ✅ Launch instance
3. ✅ Deploy stack (30 minutes)
4. ✅ Test with sample industries
5. ✅ Generate 100 ads for portfolio
6. ✅ Start pitching to Detroit businesses

---

## Troubleshooting

### ComfyUI not loading:
```bash
docker logs comfyui
# Check for model download errors
```

### Ollama slow responses:
```bash
# Use smaller model
docker exec ollama ollama pull llama3.2:3b
```

### Out of VRAM:
```bash
# Stop one service while using the other
docker stop comfyui  # When generating text
docker stop ollama   # When generating images
```

### Spot instance terminated:
```bash
# Check if instance stopped
aws ec2 describe-instances --instance-ids i-xxxxx

# Restart
aws ec2 start-instances --instance-ids i-xxxxx
```
