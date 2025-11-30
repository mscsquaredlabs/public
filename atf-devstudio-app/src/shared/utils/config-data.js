/**
 * config-data.js
 * Contains data for configuration samples, templates, and categories
 */

/**
 * Configuration types available in the tool
 */
export const configTypes = [
    { id: 'docker', name: 'Docker' },
    { id: 'kubernetes', name: 'Kubernetes' },
    { id: 'nginx', name: 'Nginx' },
    { id: 'apache', name: 'Apache' },
    { id: 'eslint', name: 'ESLint' },
    { id: 'babel', name: 'Babel' },
    { id: 'webpack', name: 'Webpack' },
    { id: 'tsconfig', name: 'TypeScript' },
    { id: 'jest', name: 'Jest' },
    { id: 'github', name: 'GitHub Actions' },
    { id: 'gitlab', name: 'GitLab CI' },
    { id: 'aws', name: 'AWS' }
  ];
  
  /**
   * Sample configurations organized by type
   */
  export const samplesByType = {
    docker: [
      {
        id: 'node-basic',
        name: 'Node.js Basic',
        description: 'Basic Node.js application Dockerfile',
        format: 'docker'
      },
      {
        id: 'node-dev',
        name: 'Node.js Development',
        description: 'Node.js development environment with hot reloading',
        format: 'docker'
      },
      {
        id: 'nginx',
        name: 'Nginx Static Server',
        description: 'Nginx server for static files',
        format: 'docker'
      },
      {
        id: 'docker-compose',
        name: 'Docker Compose',
        description: 'Multi-container application with Node.js, MongoDB, and Redis',
        format: 'yaml'
      },
      {
        id: 'python-basic',
        name: 'Python Basic',
        description: 'Basic Python application Dockerfile',
        format: 'docker'
      },
      {
        id: 'python-django',
        name: 'Python Django',
        description: 'Django web application Dockerfile',
        format: 'docker'
      },
      {
        id: 'postgres',
        name: 'PostgreSQL',
        description: 'PostgreSQL database Dockerfile',
        format: 'docker'
      },
      {
        id: 'redis',
        name: 'Redis',
        description: 'Redis cache server Dockerfile',
        format: 'docker'
      },
      {
        id: 'multi-stage',
        name: 'Multi-Stage Build',
        description: 'Optimized multi-stage Dockerfile for production',
        format: 'docker'
      },
      {
        id: 'docker-compose-prod',
        name: 'Docker Compose Production',
        description: 'Production-ready multi-container setup',
        format: 'yaml'
      }
    ],
    kubernetes: [
      {
        id: 'pod',
        name: 'Basic Pod',
        description: 'Simple pod configuration',
        format: 'yaml'
      },
      {
        id: 'deployment',
        name: 'Deployment',
        description: 'Kubernetes deployment with replica management',
        format: 'yaml'
      },
      {
        id: 'service',
        name: 'Service',
        description: 'Kubernetes service for pod discovery',
        format: 'yaml'
      },
      {
        id: 'ingress',
        name: 'Ingress',
        description: 'Kubernetes ingress for external access',
        format: 'yaml'
      },
      {
        id: 'configmap',
        name: 'ConfigMap',
        description: 'Kubernetes ConfigMap for configuration data',
        format: 'yaml'
      },
      {
        id: 'secret',
        name: 'Secret',
        description: 'Kubernetes Secret for sensitive data',
        format: 'yaml'
      },
      {
        id: 'persistent-volume',
        name: 'Persistent Volume',
        description: 'Persistent volume claim for storage',
        format: 'yaml'
      },
      {
        id: 'horizontal-pod-autoscaler',
        name: 'Horizontal Pod Autoscaler',
        description: 'Auto-scaling configuration based on CPU/memory',
        format: 'yaml'
      },
      {
        id: 'namespace',
        name: 'Namespace',
        description: 'Kubernetes namespace for resource isolation',
        format: 'yaml'
      },
      {
        id: 'statefulset',
        name: 'StatefulSet',
        description: 'StatefulSet for stateful applications',
        format: 'yaml'
      }
    ],
    nginx: [
      {
        id: 'static',
        name: 'Static Site',
        description: 'Configuration for static website hosting',
        format: 'nginx'
      },
      {
        id: 'proxy',
        name: 'Reverse Proxy',
        description: 'Reverse proxy configuration for backend services',
        format: 'nginx'
      },
      {
        id: 'ssl',
        name: 'SSL/TLS',
        description: 'SSL/TLS configuration with Let\'s Encrypt',
        format: 'nginx'
      },
      {
        id: 'load-balancer',
        name: 'Load Balancer',
        description: 'Load balancer configuration for multiple backends',
        format: 'nginx'
      },
      {
        id: 'websocket',
        name: 'WebSocket Proxy',
        description: 'WebSocket proxy configuration',
        format: 'nginx'
      },
      {
        id: 'gzip',
        name: 'Gzip Compression',
        description: 'Gzip compression configuration',
        format: 'nginx'
      },
      {
        id: 'rate-limiting',
        name: 'Rate Limiting',
        description: 'Rate limiting and DDoS protection',
        format: 'nginx'
      },
      {
        id: 'caching',
        name: 'Caching',
        description: 'Proxy caching configuration',
        format: 'nginx'
      },
      {
        id: 'redirects',
        name: 'Redirects',
        description: 'HTTP redirects and rewrites',
        format: 'nginx'
      },
      {
        id: 'security-headers',
        name: 'Security Headers',
        description: 'Security headers configuration',
        format: 'nginx'
      }
    ],
    eslint: [
      {
        id: 'react',
        name: 'React',
        description: 'ESLint configuration for React projects',
        format: 'json'
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'ESLint configuration for TypeScript projects',
        format: 'json'
      },
      {
        id: 'node',
        name: 'Node.js',
        description: 'ESLint configuration for Node.js projects',
        format: 'json'
      },
      {
        id: 'vue',
        name: 'Vue.js',
        description: 'ESLint configuration for Vue.js projects',
        format: 'json'
      },
      {
        id: 'angular',
        name: 'Angular',
        description: 'ESLint configuration for Angular projects',
        format: 'json'
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        description: 'ESLint configuration for Next.js projects',
        format: 'json'
      },
      {
        id: 'strict',
        name: 'Strict Mode',
        description: 'Strict ESLint configuration with all rules enabled',
        format: 'json'
      },
      {
        id: 'airbnb',
        name: 'Airbnb Style',
        description: 'ESLint with Airbnb style guide',
        format: 'json'
      },
      {
        id: 'prettier',
        name: 'Prettier Integration',
        description: 'ESLint with Prettier integration',
        format: 'json'
      },
      {
        id: 'custom',
        name: 'Custom Rules',
        description: 'Custom ESLint rules configuration',
        format: 'json'
      }
    ],
    github: [
      {
        id: 'node-ci',
        name: 'Node.js CI',
        description: 'GitHub Actions workflow for Node.js CI',
        format: 'yaml'
      },
      {
        id: 'docker-build',
        name: 'Docker Build & Push',
        description: 'Build and push Docker image to registry',
        format: 'yaml'
      },
      {
        id: 'deploy',
        name: 'Deploy to Production',
        description: 'Deploy application to production environment',
        format: 'yaml'
      },
      {
        id: 'python-ci',
        name: 'Python CI',
        description: 'GitHub Actions workflow for Python CI',
        format: 'yaml'
      },
      {
        id: 'java-ci',
        name: 'Java CI',
        description: 'GitHub Actions workflow for Java CI',
        format: 'yaml'
      },
      {
        id: 'release',
        name: 'Release Workflow',
        description: 'Automated release workflow with versioning',
        format: 'yaml'
      },
      {
        id: 'code-quality',
        name: 'Code Quality',
        description: 'Code quality checks with linting and testing',
        format: 'yaml'
      },
      {
        id: 'security-scan',
        name: 'Security Scan',
        description: 'Security vulnerability scanning workflow',
        format: 'yaml'
      },
      {
        id: 'matrix-build',
        name: 'Matrix Build',
        description: 'Matrix strategy for multiple OS and versions',
        format: 'yaml'
      },
      {
        id: 'scheduled',
        name: 'Scheduled Jobs',
        description: 'Scheduled cron jobs workflow',
        format: 'yaml'
      }
    ],
    babel: [
      {
        id: 'react',
        name: 'React',
        description: 'Babel configuration for React projects',
        format: 'json'
      },
      {
        id: 'node',
        name: 'Node.js',
        description: 'Babel configuration for Node.js projects',
        format: 'json'
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'Babel configuration for TypeScript projects',
        format: 'json'
      },
      {
        id: 'vue',
        name: 'Vue.js',
        description: 'Babel configuration for Vue.js projects',
        format: 'json'
      },
      {
        id: 'angular',
        name: 'Angular',
        description: 'Babel configuration for Angular projects',
        format: 'json'
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        description: 'Babel configuration for Next.js projects',
        format: 'json'
      },
      {
        id: 'library',
        name: 'Library',
        description: 'Babel configuration for library projects',
        format: 'json'
      },
      {
        id: 'legacy-browsers',
        name: 'Legacy Browsers',
        description: 'Babel configuration for legacy browser support',
        format: 'json'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Minimal Babel configuration',
        format: 'json'
      },
      {
        id: 'production',
        name: 'Production',
        description: 'Production-optimized Babel configuration',
        format: 'json'
      }
    ],
    webpack: [
      {
        id: 'react',
        name: 'React',
        description: 'Webpack configuration for React projects',
        format: 'js'
      },
      {
        id: 'vue',
        name: 'Vue.js',
        description: 'Webpack configuration for Vue.js projects',
        format: 'js'
      },
      {
        id: 'angular',
        name: 'Angular',
        description: 'Webpack configuration for Angular projects',
        format: 'js'
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'Webpack configuration for TypeScript projects',
        format: 'js'
      },
      {
        id: 'library',
        name: 'Library',
        description: 'Webpack configuration for library bundling',
        format: 'js'
      },
      {
        id: 'microfrontend',
        name: 'Microfrontend',
        description: 'Webpack configuration for microfrontend architecture',
        format: 'js'
      },
      {
        id: 'pwa',
        name: 'PWA',
        description: 'Webpack configuration for Progressive Web Apps',
        format: 'js'
      },
      {
        id: 'production',
        name: 'Production',
        description: 'Production-optimized Webpack configuration',
        format: 'js'
      },
      {
        id: 'development',
        name: 'Development',
        description: 'Development Webpack configuration with HMR',
        format: 'js'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Minimal Webpack configuration',
        format: 'js'
      }
    ],
    tsconfig: [
      {
        id: 'react',
        name: 'React',
        description: 'TypeScript configuration for React projects',
        format: 'json'
      },
      {
        id: 'node',
        name: 'Node.js',
        description: 'TypeScript configuration for Node.js projects',
        format: 'json'
      },
      {
        id: 'vue',
        name: 'Vue.js',
        description: 'TypeScript configuration for Vue.js projects',
        format: 'json'
      },
      {
        id: 'angular',
        name: 'Angular',
        description: 'TypeScript configuration for Angular projects',
        format: 'json'
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        description: 'TypeScript configuration for Next.js projects',
        format: 'json'
      },
      {
        id: 'library',
        name: 'Library',
        description: 'TypeScript configuration for library projects',
        format: 'json'
      },
      {
        id: 'strict',
        name: 'Strict Mode',
        description: 'Strict TypeScript configuration',
        format: 'json'
      },
      {
        id: 'monorepo',
        name: 'Monorepo',
        description: 'TypeScript configuration for monorepo projects',
        format: 'json'
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Minimal TypeScript configuration',
        format: 'json'
      },
      {
        id: 'legacy',
        name: 'Legacy',
        description: 'TypeScript configuration for legacy projects',
        format: 'json'
      }
    ],
    jest: [
      {
        id: 'react',
        name: 'React',
        description: 'Jest configuration for React projects',
        format: 'js'
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description: 'Jest configuration for TypeScript projects',
        format: 'js'
      },
      {
        id: 'vue',
        name: 'Vue.js',
        description: 'Jest configuration for Vue.js projects',
        format: 'js'
      },
      {
        id: 'node',
        name: 'Node.js',
        description: 'Jest configuration for Node.js projects',
        format: 'js'
      },
      {
        id: 'angular',
        name: 'Angular',
        description: 'Jest configuration for Angular projects',
        format: 'js'
      },
      {
        id: 'coverage',
        name: 'Coverage',
        description: 'Jest configuration with coverage reporting',
        format: 'js'
      },
      {
        id: 'e2e',
        name: 'E2E Testing',
        description: 'Jest configuration for end-to-end testing',
        format: 'js'
      },
      {
        id: 'snapshot',
        name: 'Snapshot Testing',
        description: 'Jest configuration for snapshot testing',
        format: 'js'
      },
      {
        id: 'parallel',
        name: 'Parallel Execution',
        description: 'Jest configuration for parallel test execution',
        format: 'js'
      },
      {
        id: 'custom',
        name: 'Custom Setup',
        description: 'Custom Jest configuration with setup files',
        format: 'js'
      }
    ],
    gitlab: [
      {
        id: 'node-ci',
        name: 'Node.js CI',
        description: 'GitLab CI configuration for Node.js projects',
        format: 'yaml'
      },
      {
        id: 'docker-build',
        name: 'Docker Build',
        description: 'GitLab CI configuration for Docker builds',
        format: 'yaml'
      },
      {
        id: 'python-ci',
        name: 'Python CI',
        description: 'GitLab CI configuration for Python projects',
        format: 'yaml'
      },
      {
        id: 'java-ci',
        name: 'Java CI',
        description: 'GitLab CI configuration for Java projects',
        format: 'yaml'
      },
      {
        id: 'deploy',
        name: 'Deploy',
        description: 'GitLab CI deployment configuration',
        format: 'yaml'
      },
      {
        id: 'multi-stage',
        name: 'Multi-Stage Pipeline',
        description: 'Multi-stage GitLab CI pipeline',
        format: 'yaml'
      },
      {
        id: 'matrix',
        name: 'Matrix Build',
        description: 'Matrix strategy for multiple environments',
        format: 'yaml'
      },
      {
        id: 'security',
        name: 'Security Scan',
        description: 'Security scanning in GitLab CI',
        format: 'yaml'
      },
      {
        id: 'artifacts',
        name: 'Artifacts',
        description: 'GitLab CI with artifact management',
        format: 'yaml'
      },
      {
        id: 'cache',
        name: 'Caching',
        description: 'GitLab CI with caching optimization',
        format: 'yaml'
      }
    ],
    apache: [
      {
        id: 'virtual-host',
        name: 'Virtual Host',
        description: 'Apache virtual host configuration',
        format: 'apache'
      },
      {
        id: 'ssl',
        name: 'SSL/TLS',
        description: 'Apache SSL/TLS configuration',
        format: 'apache'
      },
      {
        id: 'reverse-proxy',
        name: 'Reverse Proxy',
        description: 'Apache reverse proxy configuration',
        format: 'apache'
      },
      {
        id: 'load-balancer',
        name: 'Load Balancer',
        description: 'Apache load balancer configuration',
        format: 'apache'
      },
      {
        id: 'rewrite',
        name: 'URL Rewrite',
        description: 'Apache URL rewrite rules',
        format: 'apache'
      },
      {
        id: 'compression',
        name: 'Compression',
        description: 'Apache compression configuration',
        format: 'apache'
      },
      {
        id: 'caching',
        name: 'Caching',
        description: 'Apache caching configuration',
        format: 'apache'
      },
      {
        id: 'security',
        name: 'Security Headers',
        description: 'Apache security headers configuration',
        format: 'apache'
      },
      {
        id: 'php',
        name: 'PHP',
        description: 'Apache PHP configuration',
        format: 'apache'
      },
      {
        id: 'python',
        name: 'Python/WSGI',
        description: 'Apache Python WSGI configuration',
        format: 'apache'
      }
    ],
    aws: [
      {
        id: 'cloudformation',
        name: 'CloudFormation',
        description: 'AWS CloudFormation template for EC2 instance',
        format: 'json'
      },
      {
        id: 's3-policy',
        name: 'S3 Policy',
        description: 'AWS S3 bucket policy',
        format: 'json'
      },
      {
        id: 'lambda',
        name: 'Lambda Function',
        description: 'AWS Lambda function configuration',
        format: 'json'
      },
      {
        id: 'iam-role',
        name: 'IAM Role',
        description: 'AWS IAM role policy',
        format: 'json'
      },
      {
        id: 'ecs-task',
        name: 'ECS Task Definition',
        description: 'AWS ECS task definition',
        format: 'json'
      },
      {
        id: 'api-gateway',
        name: 'API Gateway',
        description: 'AWS API Gateway configuration',
        format: 'json'
      },
      {
        id: 'dynamodb',
        name: 'DynamoDB',
        description: 'AWS DynamoDB table configuration',
        format: 'json'
      },
      {
        id: 'rds',
        name: 'RDS Database',
        description: 'AWS RDS database configuration',
        format: 'json'
      },
      {
        id: 'vpc',
        name: 'VPC',
        description: 'AWS VPC network configuration',
        format: 'json'
      },
      {
        id: 'cloudwatch',
        name: 'CloudWatch',
        description: 'AWS CloudWatch alarms and metrics',
        format: 'json'
      }
    ]
  };
  
  /**
   * Full configuration templates for each sample
   */
  export const configTemplates = {
    docker: {
      'node-basic': `# Node.js Basic Dockerfile
  FROM node:14-alpine
  
  WORKDIR /app
  
  COPY package*.json ./
  
  RUN npm install
  
  COPY . .
  
  EXPOSE 3000
  
  CMD ["npm", "start"]`,
      'node-dev': `# Node.js Development Dockerfile
  FROM node:14-alpine
  
  WORKDIR /app
  
  COPY package*.json ./
  
  RUN npm install
  
  COPY . .
  
  EXPOSE 3000
  
  CMD ["npm", "run", "dev"]`,
      'nginx': `# Nginx Static Server Dockerfile
  FROM nginx:alpine
  
  COPY ./dist /usr/share/nginx/html
  
  COPY ./nginx.conf /etc/nginx/conf.d/default.conf
  
  EXPOSE 80
  
  CMD ["nginx", "-g", "daemon off;"]`,
      'docker-compose': `# Docker Compose for Node.js, MongoDB, and Redis
  version: '3'
  
  services:
    app:
      build:
        context: .
        dockerfile: Dockerfile
      ports:
        - "3000:3000"
      depends_on:
        - mongo
        - redis
      environment:
        - NODE_ENV=development
        - MONGO_URI=mongodb://mongo:27017/app
        - REDIS_HOST=redis
        - REDIS_PORT=6379
  
    mongo:
      image: mongo:4.4
      ports:
        - "27017:27017"
      volumes:
        - mongo-data:/data/db
  
    redis:
      image: redis:alpine
      ports:
        - "6379:6379"
      volumes:
        - redis-data:/data
  
  volumes:
    mongo-data:
    redis-data:`
    },
    kubernetes: {
      'pod': `# Basic Kubernetes Pod
  apiVersion: v1
  kind: Pod
  metadata:
    name: my-app
    labels:
      app: my-app
  spec:
    containers:
    - name: my-app
      image: my-app:latest
      ports:
      - containerPort: 3000
      resources:
        limits:
          memory: "128Mi"
          cpu: "500m"`,
      'deployment': `# Kubernetes Deployment
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: my-app
  spec:
    replicas: 3
    selector:
      matchLabels:
        app: my-app
    template:
      metadata:
        labels:
          app: my-app
      spec:
        containers:
        - name: my-app
          image: my-app:latest
          ports:
          - containerPort: 3000
          resources:
            limits:
              memory: "128Mi"
              cpu: "500m"
          env:
          - name: NODE_ENV
            value: "production"`,
      'service': `# Kubernetes Service
  apiVersion: v1
  kind: Service
  metadata:
    name: my-app
  spec:
    selector:
      app: my-app
    ports:
    - port: 80
      targetPort: 3000
    type: ClusterIP`,
      'ingress': `# Kubernetes Ingress
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: my-app
    annotations:
      nginx.ingress.kubernetes.io/rewrite-target: /
  spec:
    rules:
    - host: my-app.example.com
      http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: my-app
              port:
                number: 80`
    },
    nginx: {
      'static': `# Nginx static site configuration
  server {
      listen 80;
      server_name example.com www.example.com;
      root /var/www/html;
      index index.html;
  
      location / {
          try_files $uri $uri/ =404;
      }
  
      location ~* \\.(?:css|js|jpg|jpeg|gif|png|ico|svg)$ {
          expires 30d;
          add_header Cache-Control "public, no-transform";
      }
  
      # Error pages
      error_page 404 /404.html;
      error_page 500 502 503 504 /50x.html;
  }`,
      'proxy': `# Nginx reverse proxy configuration
  server {
      listen 80;
      server_name api.example.com;
  
      location / {
          proxy_pass http://backend:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
      }
  }`,
      'ssl': `# Nginx SSL configuration with Let's Encrypt
  server {
      listen 80;
      listen [::]:80;
      server_name example.com www.example.com;
      
      # Redirect HTTP to HTTPS
      return 301 https://$host$request_uri;
  }
  
  server {
      listen 443 ssl http2;
      listen [::]:443 ssl http2;
      server_name example.com www.example.com;
      
      # SSL certificates from Let's Encrypt
      ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
      ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
      
      # SSL configurations
      ssl_protocols TLSv1.2 TLSv1.3;
      ssl_prefer_server_ciphers on;
      ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
      ssl_session_timeout 1d;
      ssl_session_cache shared:SSL:10m;
      ssl_session_tickets off;
      
      # HSTS (optional)
      add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
      
      # OCSP Stapling
      ssl_stapling on;
      ssl_stapling_verify on;
      resolver 8.8.8.8 8.8.4.4 valid=300s;
      resolver_timeout 5s;
      
      # Website root
      root /var/www/html;
      index index.html;
      
      location / {
          try_files $uri $uri/ =404;
      }
  }`,
      'load-balancer': `# Nginx load balancer configuration
  upstream backend {
      # Load balancing method: round-robin (default), least_conn, ip_hash
      least_conn;
      
      server backend1.example.com:8080;
      server backend2.example.com:8080;
      server backend3.example.com:8080;
      
      # Optional: backup server that will be used when primary servers are unavailable
      server backup.example.com:8080 backup;
      
      # Health checks and connection settings
      keepalive 32;
  }
  
  server {
      listen 80;
      server_name api.example.com;
      
      location / {
          proxy_pass http://backend;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          
          # Enable caching for improved performance
          proxy_cache_bypass $http_upgrade;
          
          # Handle errors
          proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
          
          # Timeouts
          proxy_connect_timeout 5s;
          proxy_send_timeout 60s;
          proxy_read_timeout 60s;
      }
      
      # Health check endpoint
      location /health {
          access_log off;
          return 200 "healthy\\n";
      }
  }`
    },
    eslint: {
      'react': `{
    "extends": [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:jsx-a11y/recommended"
    ],
    "plugins": [
      "react",
      "react-hooks",
      "jsx-a11y"
    ],
    "parserOptions": {
      "ecmaVersion": 2021,
      "sourceType": "module",
      "ecmaFeatures": {
        "jsx": true
      }
    },
    "env": {
      "browser": true,
      "es2021": true,
      "node": true
    },
    "settings": {
      "react": {
        "version": "detect"
      }
    },
    "rules": {
      "react/prop-types": "warn",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }`,
      'typescript': `{
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaVersion": 2021,
      "sourceType": "module",
      "project": "./tsconfig.json"
    },
    "plugins": ["@typescript-eslint"],
    "env": {
      "browser": true,
      "es2021": true,
      "node": true
    },
    "rules": {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "no-console": "warn"
    }
  }`,
      'node': `{
    "extends": [
      "eslint:recommended",
      "plugin:node/recommended"
    ],
    "plugins": ["node"],
    "parserOptions": {
      "ecmaVersion": 2021,
      "sourceType": "module"
    },
    "env": {
      "node": true,
      "es2021": true
    },
    "rules": {
      "node/exports-style": ["error", "module.exports"],
      "node/file-extension-in-import": ["error", "always"],
      "node/prefer-global/buffer": ["error", "always"],
      "node/prefer-global/console": ["error", "always"],
      "node/prefer-global/process": ["error", "always"],
      "node/prefer-global/url-search-params": ["error", "always"],
      "node/prefer-global/url": ["error", "always"],
      "node/prefer-promises/dns": "error",
      "node/prefer-promises/fs": "error",
      "node/no-unpublished-require": "off",
      "no-console": "off"
    }
  }`
    },
    github: {
        'node-ci': `# GitHub Actions workflow for Node.js CI
    name: Node.js CI
    
    on:
      push:
        branches: [ main ]
      pull_request:
        branches: [ main ]
    
    jobs:
      build:
        runs-on: ubuntu-latest
    
        strategy:
          matrix:
            node-version: [14.x, 16.x, 18.x]
    
        steps:
        - uses: actions/checkout@v3
        - name: Use Node.js \${{ matrix.node-version }}
          uses: actions/setup-node@v3
          with:
            node-version: \${{ matrix.node-version }}
            cache: 'npm'
        - run: npm ci
        - run: npm run build --if-present
        - run: npm test`,
        
        'docker-build': `# GitHub Actions workflow for Docker build and push
    name: Docker Build and Push
    
    on:
      push:
        branches: [ main ]
        tags: [ 'v*' ]
    
    jobs:
      build-and-push:
        runs-on: ubuntu-latest
        permissions:
          contents: read
          packages: write
    
        steps:
        - name: Checkout code
          uses: actions/checkout@v3
    
        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v2
    
        - name: Login to GitHub Container Registry
          uses: docker/login-action@v2
          with:
            registry: ghcr.io
            username: \${{ github.repository_owner }}
            password: \${{ secrets.GITHUB_TOKEN }}
    
        - name: Extract metadata
          id: meta
          uses: docker/metadata-action@v4
          with:
            images: ghcr.io/\${{ github.repository }}
            tags: |
              type=semver,pattern={{version}}
              type=semver,pattern={{major}}.{{minor}}
              type=ref,event=branch
              type=sha,format=short
    
        - name: Build and push
          uses: docker/build-push-action@v3
          with:
            context: .
            push: true
            tags: \${{ steps.meta.outputs.tags }}
            labels: \${{ steps.meta.outputs.labels }}
            cache-from: type=gha
            cache-to: type=gha,mode=max`,
        
        'deploy': `# GitHub Actions workflow for deploying to production
    name: Deploy to Production
    
    on:
      push:
        tags: ['v*']
    
    jobs:
      deploy:
        runs-on: ubuntu-latest
        environment: production
    
        steps:
        - name: Checkout code
          uses: actions/checkout@v3
          
        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '16'
            cache: 'npm'
            
        - name: Install dependencies
          run: npm ci
    
        - name: Build
          run: npm run build
    
        - name: Run tests
          run: npm test
    
        - name: Deploy to server
          uses: appleboy/ssh-action@master
          with:
            host: \${{ secrets.HOST }}
            username: \${{ secrets.USERNAME }}
            key: \${{ secrets.SSH_KEY }}
            script: |
              cd /var/www/myapp
              git pull
              npm ci
              npm run build
              pm2 restart myapp`
      
    },
    babel: {
      'react': `{
    "presets": [
      ["@babel/preset-env", {
        "targets": {
          "browsers": ["last 2 versions", "not dead", "> 0.5%"]
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }],
      ["@babel/preset-react", {
        "runtime": "automatic"
      }],
      "@babel/preset-typescript"
    ],
    "plugins": [
      ["@babel/plugin-transform-runtime", {
        "regenerator": true
      }]
    ]
  }`,
      'node': `{
    "presets": [
      ["@babel/preset-env", {
        "targets": {
          "node": "current"
        }
      }],
      "@babel/preset-typescript"
    ],
    "plugins": [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread"
    ]
  }`
    },
    webpack: {
      'react': `const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const { CleanWebpackPlugin } = require('clean-webpack-plugin');
  
  module.exports = (env, argv) => {
    const isDevelopment = argv.mode !== 'production';
    
    return {
      entry: './src/index.js',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        publicPath: '/'
      },
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader'
            }
          },
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modules/,
            use: ['ts-loader']
          },
          {
            test: /\.css$/,
            use: [
              isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader'
            ]
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
          '@': path.resolve(__dirname, 'src'),
        }
      },
      plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
          template: './public/index.html',
          favicon: './public/favicon.ico'
        }),
        new MiniCssExtractPlugin({
          filename: isDevelopment ? '[name].css' : '[name].[contenthash].css',
        })
      ],
      optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      },
      devtool: isDevelopment ? 'inline-source-map' : 'source-map',
      devServer: {
        historyApiFallback: true,
        open: true,
        compress: true,
        hot: true,
        port: 3000,
      }
    };
  };`,
      'vue': `const path = require('path');
  const { VueLoaderPlugin } = require('vue-loader');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const MiniCssExtractPlugin = require('mini-css-extract-plugin');
  const { CleanWebpackPlugin } = require('clean-webpack-plugin');
  
  module.exports = (env, argv) => {
    const isDevelopment = argv.mode !== 'production';
    
    return {
      entry: './src/main.js',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        publicPath: '/'
      },
      module: {
        rules: [
          {
            test: /\\.vue$/,
            loader: 'vue-loader'
          },
          {
            test: /\\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader'
            }
          },
          {
            test: /\\.css$/,
            use: [
              isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader'
            ]
          },
          {
            test: /\\.scss$/,
            use: [
              isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader',
              'sass-loader'
            ]
          },
          {
            test: /\\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
          },
          {
            test: /\\.(woff|woff2|eot|ttf|otf)$/i,
            type: 'asset/resource',
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
  '@': path.resolve(__dirname, 'src'),
  'vue': 'vue/dist/vue.esm-bundler.js'
}
      },
      plugins: [
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
          template: './public/index.html',
          favicon: './public/favicon.ico'
        }),
        new MiniCssExtractPlugin({
          filename: isDevelopment ? '[name].css' : '[name].[contenthash].css',
        })
      ],
      optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      },
      devtool: isDevelopment ? 'inline-source-map' : 'source-map',
      devServer: {
        historyApiFallback: true,
        open: true,
        compress: true,
        hot: true,
        port: 3000,
      }
    };
  }`
    },
    apache: {
              'virtual-host': `# Apache Virtual Host Configuration
         <VirtualHost *:80>
            ServerAdmin webmaster@example.com
            ServerName example.com
            ServerAlias www.example.com
            DocumentRoot /var/www/html/example.com/public_html
            ErrorLog \${APACHE_LOG_DIR}/error.log 
            CustomLog \${APACHE_LOG_DIR}/access.log combined
        
            
            
            # Directory settings
            <Directory /var/www/html/example.com/public_html>
              Options Indexes FollowSymLinks
              AllowOverride All
              Require all granted
            </Directory>
            
            # Redirect to www if needed
            # RewriteEngine on
            # RewriteCond %{HTTP_HOST} ^example.com [NC]
            # RewriteRule ^(.*)$ http://www.example.com$1 [L,R=301]
         </VirtualHost>`, // Changed from ` to '
              'ssl': `# Apache SSL Virtual Host Configuration
         <VirtualHost *:80>
            ServerName example.com
            ServerAlias www.example.com
            
            # Redirect all HTTP requests to HTTPS
            RewriteEngine On
            RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
         </VirtualHost>
        
         <VirtualHost *:443>
            ServerAdmin webmaster@example.com
            ServerName example.com
            ServerAlias www.example.com
            DocumentRoot /var/www/html/example.com/public_html
            
            # SSL Configuration
            SSLEngine on
            SSLCertificateFile /etc/ssl/certs/example.com.crt
            SSLCertificateKeyFile /etc/ssl/private/example.com.key
            SSLCertificateChainFile /etc/ssl/certs/example.com-chain.crt
            
            # Modern SSL configuration (Apache 2.4.8 and later)
            SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
            SSLHonorCipherOrder on
            SSLCompression off
            SSLSessionTickets off
            
            # HSTS (optional)
            Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
            
            # Logs
            ErrorLog \${APACHE_LOG_DIR}/error.log  
            CustomLog \${APACHE_LOG_DIR}/access.log combined
            
            # Directory settings
            <Directory /var/www/html/example.com/public_html>
              Options Indexes FollowSymLinks
              AllowOverride All
              Require all granted
            </Directory>
         </VirtualHost>` // Changed from ` to '
            }
  };
  
  /**
   * Helper functions for working with configurations
   */
  
  /**
   * Get all samples for a specific category 
   * @param {string} categoryId - The category ID to filter by
   * @returns {Array} Array of sample objects for the category
   */
  export const getSamplesForCategory = (categoryId) => {
    return samplesByType[categoryId] || [];
  };
  
  /**
   * Get a specific template
   * @param {string} categoryId - The category ID
   * @param {string} templateId - The template ID
   * @returns {string} The template content or empty string if not found
   */
  export const getTemplate = (categoryId, templateId) => {
    const category = configTemplates[categoryId] || {};
    return category[templateId] || '';
  };