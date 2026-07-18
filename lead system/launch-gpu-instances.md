# Launch GPU Instances - AWS & GCP

## AWS g4dn.xlarge Status

### ✅ What's Ready:
- **Instance available:** g4dn.xlarge in us-east-1
- **Current spot price:** $0.195-0.223/hour (varies by AZ)
- **VPC:** vpc-08bcace0fc08e0fbf (default)
- **Subnets:** 6 available across all AZs
- **SSH Key:** openclaw-ollama-key

### ❌ Blocker: Zero Quota

**Current quotas:**
- On-demand G instances: **0 vCPUs**
- Spot G instances: **0 vCPUs**

**Need:** 4 vCPUs (g4dn.xlarge uses 4 vCPUs)

---

## Step 1: Request AWS Quota Increase

### Option A: AWS Console (Fastest)
1. Go to: https://console.aws.amazon.com/servicequotas/home/services/ec2/quotas
2. Search for "Running On-Demand G and VT instances"
3. Click "Request quota increase"
4. Enter: **4** (for 1 instance) or **8** (for 2 instances)
5. Submit request

**Approval time:** Usually 15 minutes to 24 hours

### Option B: AWS CLI
```bash
aws service-quotas request-service-quota-increase \
  --service-code ec2 \
  --quota-code L-DB2E81BA \
  --desired-value 4 \
  --region us-east-1
```

### Option C: For Spot Instances (Cheaper)
```bash
aws service-quotas request-service-quota-increase \
  --service-code ec2 \
  --quota-code L-3819A6DF \
  --desired-value 4 \
  --region us-east-1
```

---

## Step 2: Launch AWS g4dn.xlarge (After Quota Approved)

### Spot Instance (Recommended - 60% cheaper)

```bash
# Get latest Deep Learning AMI
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
  --instance-market-options '{"MarketType":"spot","SpotOptions":{"MaxPrice":"0.25","SpotInstanceType":"persistent"}}' \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":100,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=openclaw-ai-gen}]' \
  --region us-east-1
```

**Cost:** ~$0.20/hour = $144/month (24/7)

### On-Demand Instance (More reliable)

```bash
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type g4dn.xlarge \
  --key-name openclaw-ollama-key \
  --subnet-id subnet-0af57c29db8adcb52 \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":100,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=openclaw-ai-gen}]' \
  --region us-east-1
```

**Cost:** $0.526/hour = $379/month (24/7)

---

## Step 3: Connect and Setup

```bash
# Get instance IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=openclaw-ai-gen" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text \
  --region us-east-1)

# SSH into instance
ssh -i ~/.ssh/openclaw-ollama-key.pem ubuntu@$INSTANCE_IP

# Verify GPU
nvidia-smi

# Install Docker (if not pre-installed)
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Test GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
```

---

## GCP n1-standard-4 + T4 Setup

### Prerequisites
1. GCP account with billing enabled
2. gcloud CLI installed
3. GPU quota (check first)

### Check GPU Quota

```bash
# Check T4 quota in us-central1
gcloud compute regions describe us-central1 \
  --format="table(quotas.filter(metric:NVIDIA_T4_GPUS))"
```

If quota is 0, request increase:
1. Go to: https://console.cloud.google.com/iam-admin/quotas
2. Filter: "NVIDIA T4 GPUs"
3. Select region (us-central1 recommended)
4. Click "Edit Quotas"
5. Request: 1 GPU
6. Wait for approval (usually 1-2 business days)

---

### Launch GCP Instance

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create instance with T4 GPU
gcloud compute instances create openclaw-ai-gen \
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

# Create firewall rules for web access
gcloud compute firewall-rules create allow-comfyui \
  --allow=tcp:8188 \
  --target-tags=http-server

gcloud compute firewall-rules create allow-ollama \
  --allow=tcp:11434 \
  --target-tags=http-server

gcloud compute firewall-rules create allow-n8n \
  --allow=tcp:5678 \
  --target-tags=http-server
```

**Cost:** ~$0.70/hour = $504/month (24/7)

---

### Connect to GCP Instance

```bash
# SSH into instance
gcloud compute ssh openclaw-ai-gen --zone=us-central1-a

# Wait for NVIDIA driver installation (check status)
sudo journalctl -u google-startup-scripts.service

# Verify GPU (may take 5-10 minutes after first boot)
nvidia-smi

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Log out and back in for docker group to take effect
exit
gcloud compute ssh openclaw-ai-gen --zone=us-central1-a
```

---

## Step 4: Install AI Stack (Both AWS & GCP)

### Install ComfyUI (Stable Diffusion)

```bash
docker run -d --gpus all \
  --name comfyui \
  -p 8188:8188 \
  -v ~/comfyui:/output \
  --restart unless-stopped \
  yanwk/comfyui-boot:latest
```

Access: http://INSTANCE_IP:8188

---

### Install Ollama (LLM)

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

Test:
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Write a 3-word ad headline for law firm automation",
  "stream": false
}'
```

---

### Install n8n (Automation)

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --restart unless-stopped \
  n8nio/n8n
```

Access: http://INSTANCE_IP:5678

---

## Step 5: Create Simple Ad Generation Workflow

### Test Stable Diffusion
1. Open http://INSTANCE_IP:8188
2. Load default workflow
3. Enter prompt: "professional law firm office, modern, clean"
4. Click "Queue Prompt"
5. Wait 30-60 seconds for image

### Test LLM
```bash
curl http://INSTANCE_IP:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Write 3 ad headlines for a law firm automation service that saves 15 hours per week",
  "stream": false
}'
```

### Create n8n Workflow
1. Open http://INSTANCE_IP:5678
2. Create new workflow
3. Add nodes:
   - Webhook (trigger)
   - HTTP Request → Ollama (generate copy)
   - HTTP Request → ComfyUI (generate image)
   - Respond to Webhook
4. Test with:
```bash
curl -X POST http://INSTANCE_IP:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"product": "OpenClaw", "industry": "law firms"}'
```

---

## Cost Comparison

| Provider | Instance | Cost/Hour | Cost/Month (24/7) | VRAM | Notes |
|----------|----------|-----------|-------------------|------|-------|
| AWS | g4dn.xlarge spot | $0.20 | $144 | 16GB | Best value |
| AWS | g4dn.xlarge on-demand | $0.53 | $379 | 16GB | More reliable |
| GCP | n1-standard-4 + T4 | $0.70 | $504 | 16GB | 15% more than AWS |
| GCP | Preemptible | $0.21 | $151 | 16GB | Can be terminated |

---

## Recommended: Start with AWS Spot

**Why:**
- Cheapest option ($144/month)
- Your quota request will likely be approved quickly
- Spot instances are 60% cheaper
- Can switch to on-demand if spot gets interrupted

**Next steps:**
1. Request AWS quota increase (do this now)
2. Wait for approval (15 min - 24 hours)
3. Launch spot instance
4. Install stack (30 minutes)
5. Start generating ads

---

## Monitoring & Optimization

### Check costs
```bash
# AWS
aws ce get-cost-and-usage \
  --time-period Start=2026-02-01,End=2026-02-28 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --region us-east-1

# GCP
gcloud billing accounts list
gcloud billing projects describe YOUR_PROJECT_ID
```

### Auto-shutdown when idle (save money)
```bash
# Create script to stop instance after 1 hour of no activity
cat > ~/auto-shutdown.sh << 'EOF'
#!/bin/bash
IDLE_TIME=$(uptime -s)
# Add logic to check GPU usage and shutdown if idle
EOF

chmod +x ~/auto-shutdown.sh
crontab -e
# Add: */15 * * * * ~/auto-shutdown.sh
```

### Scale down when not in use
```bash
# AWS - Stop instance
aws ec2 stop-instances --instance-ids i-xxxxx --region us-east-1

# GCP - Stop instance
gcloud compute instances stop openclaw-ai-gen --zone=us-central1-a
```

**Stopped instance cost:** Only storage (~$10/month for 100GB)
