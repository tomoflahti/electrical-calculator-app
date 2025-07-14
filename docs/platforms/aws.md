# AWS Deployment Guide

Complete guide for deploying the International Electric Calculator to Amazon Web Services.

## Quick Start Options

### Option 1: AWS S3 + CloudFront (Static Hosting)
- **Best for**: Simple, cost-effective static hosting
- **Cost**: ~$1-5/month for typical traffic
- **Complexity**: Low

### Option 2: AWS Elastic Beanstalk
- **Best for**: Managed platform with auto-scaling
- **Cost**: ~$10-50/month depending on instance size
- **Complexity**: Medium

### Option 3: AWS ECS/Fargate (Docker)
- **Best for**: Containerized deployment with scaling
- **Cost**: ~$15-100/month depending on usage
- **Complexity**: High

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Domain name (optional, for custom domain)

## Option 1: S3 + CloudFront (Recommended)

### Step 1: Create S3 Bucket

```bash
# Set variables
BUCKET_NAME="electrical-calculator-yourname"
REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure for static website hosting
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html
```

### Step 2: Set Bucket Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::electrical-calculator-yourname/*"
        }
    ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://bucket-policy.json
```

### Step 3: Build and Upload

```bash
# Build application
npm run build

# Upload to S3
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Set proper content types
aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json"

aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=3600" \
    --include "*.html"
```

### Step 4: Create CloudFront Distribution

```json
{
    "CallerReference": "electrical-calc-$(date +%s)",
    "Aliases": {
        "Quantity": 1,
        "Items": ["calculator.yourdomain.com"]
    },
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-electrical-calculator",
                "DomainName": "electrical-calculator-yourname.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-electrical-calculator",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {"Forward": "none"}
        },
        "MinTTL": 0,
        "Compress": true
    },
    "Comment": "Electrical Calculator Distribution",
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
```

Create distribution:
```bash
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

### Step 5: Configure Custom Domain (Optional)

1. **Get SSL Certificate**:
```bash
aws acm request-certificate \
    --domain-name calculator.yourdomain.com \
    --validation-method DNS \
    --region us-east-1
```

2. **Update Route 53**:
```bash
# Create hosted zone (if needed)
aws route53 create-hosted-zone \
    --name yourdomain.com \
    --caller-reference electrical-calc-$(date +%s)

# Add CNAME record pointing to CloudFront distribution
```

## Option 2: AWS Elastic Beanstalk

### Step 1: Install EB CLI

```bash
pip install awsebcli
```

### Step 2: Initialize Application

```bash
# Initialize EB application
eb init electrical-calculator --region us-east-1 --platform "Node.js 18"

# Create environment
eb create production --instance-type t3.micro
```

### Step 3: Configure Environment

Create `.ebextensions/01_nginx.config`:
```yaml
files:
  "/etc/nginx/conf.d/01_gzip.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      gzip on;
      gzip_comp_level 4;
      gzip_types text/html text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  "/etc/nginx/conf.d/02_security.conf":
    mode: "000644"
    owner: root
    group: root
    content: |
      add_header X-Frame-Options "SAMEORIGIN" always;
      add_header X-Content-Type-Options "nosniff" always;
      add_header X-XSS-Protection "1; mode=block" always;
```

### Step 4: Deploy

```bash
# Build application
npm run build

# Deploy to Elastic Beanstalk
eb deploy

# Open in browser
eb open
```

## Option 3: AWS ECS/Fargate

### Step 1: Create ECR Repository

```bash
# Create repository
aws ecr create-repository --repository-name electrical-calculator

# Get login token
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    123456789.dkr.ecr.us-east-1.amazonaws.com
```

### Step 2: Build and Push Docker Image

```bash
# Build image
docker build -t electrical-calculator .

# Tag for ECR
docker tag electrical-calculator:latest \
    123456789.dkr.ecr.us-east-1.amazonaws.com/electrical-calculator:latest

# Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/electrical-calculator:latest
```

### Step 3: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name electrical-calculator-cluster
```

### Step 4: Create Task Definition

Create `task-definition.json`:
```json
{
    "family": "electrical-calculator",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::123456789:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "electrical-calculator",
            "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/electrical-calculator:latest",
            "portMappings": [
                {
                    "containerPort": 80,
                    "protocol": "tcp"
                }
            ],
            "essential": true,
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/electrical-calculator",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
```

Register task:
```bash
aws ecs register-task-definition \
    --cli-input-json file://task-definition.json
```

### Step 5: Create ECS Service

```bash
# Create service
aws ecs create-service \
    --cluster electrical-calculator-cluster \
    --service-name electrical-calculator-service \
    --task-definition electrical-calculator \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

## CI/CD with GitHub Actions

The provided `.github/workflows/deploy.yml` includes AWS deployment. Set these secrets:

```bash
# Required secrets in GitHub repository settings
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=electrical-calculator-yourname
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC  # Optional
```

## Cost Estimation

### S3 + CloudFront
- **S3 Storage**: ~$0.50/month (20GB)
- **CloudFront**: ~$1-10/month (depends on traffic)
- **Data Transfer**: ~$1-5/month
- **Total**: ~$2-15/month

### Elastic Beanstalk
- **EC2 Instance (t3.micro)**: ~$8.50/month
- **Load Balancer**: ~$18/month
- **Data Transfer**: ~$1-5/month
- **Total**: ~$27-32/month

### ECS Fargate
- **vCPU (0.25)**: ~$7.50/month
- **Memory (0.5GB)**: ~$1.50/month
- **Data Transfer**: ~$1-5/month
- **Total**: ~$10-15/month

## Monitoring and Logging

### CloudWatch Setup

```bash
# Create log group
aws logs create-log-group --log-group-name /aws/electrical-calculator

# Create CloudWatch alarm for errors
aws cloudwatch put-metric-alarm \
    --alarm-name "electrical-calculator-errors" \
    --alarm-description "Monitor application errors" \
    --metric-name ErrorCount \
    --namespace AWS/ApplicationELB \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold
```

### X-Ray Tracing (Optional)

Add to task definition:
```json
{
    "name": "xray-daemon",
    "image": "amazon/aws-xray-daemon:latest",
    "cpu": 32,
    "memory": 256,
    "portMappings": [
        {
            "containerPort": 2000,
            "protocol": "udp"
        }
    ]
}
```

## Security Best Practices

### IAM Policies

Create least-privilege IAM policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::electrical-calculator-yourname/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        }
    ]
}
```

### WAF Configuration

```bash
# Create WAF Web ACL
aws wafv2 create-web-acl \
    --name electrical-calculator-waf \
    --scope CLOUDFRONT \
    --default-action Allow={} \
    --rules file://waf-rules.json
```

## Troubleshooting

### Common Issues

**S3 Access Denied**:
```bash
# Check bucket policy and public access settings
aws s3api get-bucket-policy --bucket $BUCKET_NAME
aws s3api get-public-access-block --bucket $BUCKET_NAME
```

**CloudFront Not Updating**:
```bash
# Create invalidation
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABC \
    --paths "/*"
```

**ECS Task Not Starting**:
```bash
# Check task logs
aws logs get-log-events \
    --log-group-name /ecs/electrical-calculator \
    --log-stream-name ecs/electrical-calculator/task-id
```

### Support Resources

- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: Available through AWS Console
- Community: AWS Forums and Stack Overflow

---

## Quick Commands Summary

```bash
# S3 Deployment
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"

# Elastic Beanstalk
eb init electrical-calculator
eb create production
eb deploy

# ECS/Fargate
aws ecr get-login-password | docker login --username AWS --password-stdin ECR_URL
docker build -t electrical-calculator .
docker tag electrical-calculator:latest ECR_URL:latest
docker push ECR_URL:latest
```

...and Bob's your uncle,  Electrical Calculator is now ready for professional AWS deployment.
