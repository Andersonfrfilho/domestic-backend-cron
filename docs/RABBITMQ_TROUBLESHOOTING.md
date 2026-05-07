# RabbitMQ Connection Troubleshooting Guide

## Problem Summary
CRON service experiencing persistent `ECONNREFUSED` errors when connecting to RabbitMQ (error occurring every 5 seconds).

## Root Causes Identified

### 1. **Wrong RabbitMQ User Credential**
- **Problem**: CRON was configured to use `domestic` user instead of `domestic_cron`
- **File**: `domestic-kubernets/cron/cron.secret.yaml`
- **Fix**: 
  ```yaml
  QUEUE_RABBITMQ_USER: "domestic_cron"  # Changed from "domestic"
  QUEUE_RABBITMQ_PASS: "backendapi123"
  ```
- **Verification**: Run `rabbitmqctl list_users` in RabbitMQ container to confirm user exists and has permissions

### 2. **Hardcoded Default RABBITMQ_URL**
- **Problem**: When `RABBITMQ_URL` env var wasn't explicitly set, `env.validation.ts` Joi schema defaulted to `amqp://guest:guest@localhost:5672`, overriding individual credentials
- **File**: `src/config/env.validation.ts` (line 32)
- **Original**: 
  ```typescript
  RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672')
  ```
- **Fix**: Explicitly provide `RABBITMQ_URL` in Kubernetes ConfigMap
  ```yaml
  RABBITMQ_URL: "amqp://domestic_cron:backendapi123@rabbitmq:5672"
  ```
- **Why**: Kubernetes service discovery uses hostname `rabbitmq` (not localhost), and the default used guest credentials which don't have access

### 3. **Exchange Type Mismatch**
- **Problem**: CRON code declared `zolve.dlx` as `type: 'direct'`, but RabbitMQ already had it as `type: 'fanout'`
- **Error**: `PRECONDITION_FAILED - inequivalent arg 'type' for exchange 'zolve.dlx' in vhost '/': received 'direct' but current is 'fanout'`
- **File**: `src/modules/shared/rabbitmq/rabbitmq.module.ts` (line 29)
- **Fix**:
  ```typescript
  { name: 'zolve.dlx', type: 'fanout', options: { durable: true } }  // Changed from 'direct'
  ```
- **Why**: RabbitMQ prevents changing exchange types on existing exchanges. Once created as 'fanout', it must stay that way.

### 4. **Missing enableControllerDiscovery**
- **Problem**: `@RabbitSubscribe` decorators require explicit `enableControllerDiscovery: true` configuration
- **File**: `src/modules/shared/rabbitmq/rabbitmq.module.ts` (line 27)
- **Status**: ✅ Already enabled in fixed version

## Verification Checklist

### 1. Environment Variables Loaded Correctly
Check CRON pod logs for debug output:
```
🐰 [ENV] Raw values: user="domestic_cron", pass="backendapi123", host="rabbitmq", port="5672", url="amqp://domestic_cron:backendapi123@rabbitmq:5672"
```

### 2. Connection Established
Look for these success messages in logs:
```
[RabbitMQModule] Successfully connected to RabbitMQ
[AmqpConnection] Successfully connected to RabbitMQ broker (default)
[AmqpConnection] Successfully connected a RabbitMQ channel "AmqpConnection"
[NestApplication] Nest application successfully started
```

### 3. RabbitMQ Bindings Created
```
Creating bindings...
RabbitMQ bindings created successfully
```

### 4. No ECONNREFUSED Errors
Verify logs do NOT contain repeated `ECONNREFUSED` or `ENOTFOUND` errors.

## Troubleshooting Steps (If Problem Recurs)

### Step 1: Verify RabbitMQ Pod is Running
```bash
kubectl get pods -n domestic | grep rabbitmq
kubectl logs -n domestic <rabbitmq-pod> --tail=50
```

### Step 2: Check DNS Resolution
```bash
kubectl exec -it <cron-pod> -n domestic -- nslookup rabbitmq
```
Should resolve to RabbitMQ service IP.

### Step 3: Test TCP Connection
```bash
kubectl exec -it <cron-pod> -n domestic -- nc -zv rabbitmq 5672
```
Should show `succeeded` or `open`.

### Step 4: Verify Credentials
```bash
kubectl exec -it <rabbitmq-pod> -n domestic -- rabbitmqctl list_users
```
Should show `domestic_cron` in the list.

### Step 5: Test AMQP Connection Directly
```bash
kubectl exec -it <cron-pod> -n domestic -- node -e "
const amqp = require('amqplib');
amqp.connect('amqp://domestic_cron:backendapi123@rabbitmq:5672')
  .then(() => console.log('✅ Connection successful'))
  .catch(e => console.log('❌ Connection failed:', e.message))
"
```

### Step 6: Check ConfigMap and Secret
```bash
kubectl get configmap cron-config -n domestic -o yaml | grep RABBITMQ
kubectl get secret cron-secret -n domestic -o yaml | grep QUEUE_RABBITMQ
```

Verify:
- `RABBITMQ_URL` is present in ConfigMap
- `QUEUE_RABBITMQ_USER` and `QUEUE_RABBITMQ_PASS` are in Secret
- Values match RabbitMQ user credentials

### Step 7: Review Exchange Configuration
```bash
kubectl exec -it <rabbitmq-pod> -n domestic -- rabbitmqctl list_exchanges
```

Verify `zolve.dlx` exists and shows `fanout` type (not `direct`).

### Step 8: Check Docker Image Version
```bash
kubectl get deployment cron -n domestic -o jsonpath='{.spec.template.spec.containers[0].image}'
```

Ensure the deployed image includes all three fixes:
1. Correct user credential
2. RABBITMQ_URL in ConfigMap
3. Exchange type as 'fanout'

## Key Files to Check

| File | Change | Purpose |
|------|--------|---------|
| `cron.secret.yaml` | User = `domestic_cron` | Authentication |
| `cron.configmap.yaml` | Added `RABBITMQ_URL` | Connection string |
| `rabbitmq.module.ts` | Exchange type = `fanout` | Exchange config match |
| `env.validation.ts` | No fallback default | Explicit config required |

## Related Issues

- **Worker RabbitMQ URI**: Some services may have duplicate RabbitMQ config with missing vhost separator "/"
- **API Backend**: See `src/modules/shared/providers/queue/producer/implementations/rabbitmq/rabbit.connection.ts` for correct pattern

## Prevention

1. Always explicitly provide `RABBITMQ_URL` in Kubernetes ConfigMap — never rely on defaults
2. Verify service user credentials exist: `rabbitmqctl list_users`
3. Check exchange types before deploying: `rabbitmqctl list_exchanges`
4. Add debug logging to `configService.get()` calls during deployment to verify values are loaded
5. Review logs for `[ENV]` debug lines before assuming network issues
