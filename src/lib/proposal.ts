export type Block =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type Section = {
  id: string;
  index: string;
  title: string;
  blocks: Block[];
};

/** 기획서 마크다운(#, ##, ###, -, 문단)을 목차가 있는 섹션 구조로 바꿔요. */
export function parseProposal(md: string): { title: string; sections: Section[] } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  const sections: Section[] = [];
  let current: Section | null = null;
  let list: string[] | null = null;

  const flushList = () => {
    if (list && current) current.blocks.push({ type: "ul", items: list });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      const heading = line.slice(3).trim();
      const match = heading.match(/^(\d+)\.\s*(.+)$/);
      current = {
        id: `proposal-section-${sections.length + 1}`,
        index: match ? match[1].padStart(2, "0") : String(sections.length + 1).padStart(2, "0"),
        title: match ? match[2] : heading,
        blocks: [],
      };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("### ")) {
      flushList();
      current.blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      if (!list) list = [];
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    current.blocks.push({ type: "p", text: line });
  }
  flushList();
  return { title, sections };
}
