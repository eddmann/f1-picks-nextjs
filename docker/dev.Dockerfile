FROM public.ecr.aws/lambda/nodejs:20
WORKDIR /var/task
COPY package*.json ./
COPY prisma ./
RUN npm ci
ENTRYPOINT []
CMD ["npm", "run", "dev"]
