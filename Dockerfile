FROM nikolaik/python-nodejs:python3.12-nodejs22-bookworm

ENV NODE_ENV=production

RUN npm install -g opencode-ai@latest

# 复制 Agent 配置到工作目录
COPY --chown=pn:pn agent/.opencode /home/pn/app/.opencode
COPY --chown=pn:pn agent/opencode.json /home/pn/app/opencode.json
COPY --chown=pn:pn agent/AGENTS.md /home/pn/app/AGENTS.md

WORKDIR /home/pn/app
USER pn
EXPOSE 2442

CMD ["opencode", "web", "--port", "2442", "--hostname", "0.0.0.0"]
