FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    build-essential \
    gnat \
    gprbuild \
    make \
    python3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3 /usr/bin/python || true

WORKDIR /opt
RUN git clone https://github.com/mk270/whitakers-words.git

WORKDIR /opt/whitakers-words
RUN sed -i 's/^GPRBUILD_OPTIONS .*$/GPRBUILD_OPTIONS := -j4 -gnatwJ/' Makefile || true && \
    make && \
    test -f /opt/whitakers-words/bin/words && chmod +x /opt/whitakers-words/bin/words

ENV WHITAKER_BIN=/opt/whitakers-words/bin/words
ENV WHITAKER_DIR=/opt/whitakers-words

WORKDIR /work
