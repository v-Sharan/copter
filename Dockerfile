FROM node:18

# Install all needed build dependencies + full GStreamer development environment
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    git \
    pkg-config \
    ninja-build \
    build-essential \
    cmake \
    gstreamer1.0-tools \
    gstreamer1.0-doc \
    gstreamer1.0-x \
    gstreamer1.0-alsa \
    gstreamer1.0-gl \
    gstreamer1.0-gtk3 \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    libgstreamer1.0-dev \
    libgstreamer-plugins-base1.0-dev \
    libgirepository1.0-dev \
    && rm -rf /var/lib/apt/lists/*

# Debug — verify GStreamer headers exist
RUN test -f /usr/include/gstreamer-1.0/gst/gst.h && echo "GStreamer headers OK" || (echo "❌ GStreamer headers MISSING" && exit 1)

WORKDIR /app

COPY package*.json ./

# Install deps
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start:electron"]
