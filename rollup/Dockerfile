# syntax=docker.io/docker/dockerfile:1

FROM --platform=linux/riscv64 ghcr.io/crypto-bug-hunters/builtins:0.7.2 AS builtins

# Build stage: includes resources necessary for installing dependencies
FROM node:20.16.0-bookworm AS build-stage

# Install Yarn
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory
WORKDIR /opt/cartesi/dapp

# Copy project files
COPY . .

# Install dependencies and build the application
RUN yarn install && yarn build

# Runtime stage: produces the final image that will be executed
FROM --platform=linux/riscv64 cartesi/node:20.16.0-jammy-slim

# Install Cartesi Machine Emulator tools
ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ADD https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb /
RUN dpkg -i /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb \
  && rm /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb

# Add Cartesi rollups and Foundry labels
LABEL io.cartesi.rollups.sdk_version=0.9.0
LABEL io.cartesi.rollups.ram_size=128Mi

# Install additional dependencies
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    busybox-static=1:1.30.1-7ubuntu3 curl bash git \
    && rm -rf /var/lib/apt/lists/* /var/log/* /var/cache/* \
    && useradd --create-home --user-group dapp

# Set up Foundry
COPY --from=builtins /opt/bundle/solc-0.8.27-linux-riscv64 /usr/bin/solc
COPY --from=builtins /opt/bundle/forge-2cdbfac-linux-riscv64 /usr/bin/forge

# /usr/bin/forge build --use /usr/bin/solc --offline

# Set up PATH for Cartesi binaries
ENV PATH="/opt/cartesi/bin:${PATH}"

# Create the tests directory with proper permissions
RUN mkdir -p /home/dapp/tests && chmod 777 /home/dapp/tests && chmod  777 /etc/
RUN git config --global user.name "Ranaco"
RUN git config --global user.email "ranasatyamraj@gmail.com"

# Set up the working directory
WORKDIR /opt/cartesi/dapp

# Copy application build output from the build stage
COPY --from=build-stage /opt/cartesi/dapp/dist .

# Set the Rollup HTTP Server URL environment variable
ENV ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004"

# Entrypoint and default command
ENTRYPOINT ["rollup-init"]
CMD ["node", "index.js"]
