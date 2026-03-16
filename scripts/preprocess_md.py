#!/usr/bin/env python3

import pathlib


ROOT = pathlib.Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "_posts"


def process_file(path: pathlib.Path) -> None:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    out: list[str] = []
    in_code = False
    code_buffer: list[str] = []
    code_has_liquid = False

    def flush_code_block():
        nonlocal code_buffer, code_has_liquid, out
        if not code_buffer:
            return
        if code_has_liquid:
            # 在含有 {{ 或 }} 的代码块外包一层 raw，这样渲染出来的代码不会多出反斜杠
            out.append("{% raw %}")
            out.extend(code_buffer)
            out.append("{% endraw %}")
        else:
            out.extend(code_buffer)
        code_buffer = []
        code_has_liquid = False

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("```"):
            # 代码块 fence 本身也放进 buffer
            if not in_code:
                # 进入代码块前，先把之前的普通内容刷出去
                flush_code_block()
                in_code = True
                code_buffer.append(line)
            else:
                # 结束代码块
                code_buffer.append(line)
                in_code = False
                flush_code_block()
            continue

        if in_code:
            if "{{" in line or "}}" in line:
                code_has_liquid = True
            code_buffer.append(line)
        else:
            out.append(line)

    # 文件末尾如果还在代码块缓冲中，刷一次
    flush_code_block()

    new_text = "\n".join(out)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")


def main() -> None:
    if not POSTS_DIR.exists():
        return
    for md in POSTS_DIR.rglob("*.md"):
        process_file(md)


if __name__ == "__main__":
    main()

